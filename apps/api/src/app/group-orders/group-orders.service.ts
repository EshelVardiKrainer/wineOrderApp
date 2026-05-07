import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupOrder } from './entities/group-order.entity';
import { GroupOrderParticipant } from './entities/group-order-participant.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import type {
  IGroupOrder,
  IGroupOrderCreate,
  IGroupOrderParticipant,
  IOrderItem,
  IOrderItemAdd,
  IOrderItemUpdate,
  IGroupOrderSummary,
  IWineAggregation,
  GroupOrderStatus,
} from '@wine-order-app/shared-types';

@Injectable()
export class GroupOrdersService {
  constructor(
    @InjectRepository(GroupOrder)
    private readonly groupOrderRepo: Repository<GroupOrder>,
    @InjectRepository(GroupOrderParticipant)
    private readonly participantRepo: Repository<GroupOrderParticipant>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ─── Admin: open a new group order for a site ───────────────────────

  async createGroupOrder(input: IGroupOrderCreate): Promise<IGroupOrder> {
    const existing = await this.groupOrderRepo.findOne({
      where: { shippingSiteId: input.shippingSiteId, status: 'open' },
    });
    if (existing) {
      throw new ConflictException(
        'This site already has an active group order',
      );
    }

    const go = this.groupOrderRepo.create({
      shippingSiteId: input.shippingSiteId,
      status: 'open',
      minimumAmount: input.minimumAmount ?? 0,
    });
    const saved = await this.groupOrderRepo.save(go);
    return this.findById(saved.id);
  }

  // ─── Admin: change group order status ───────────────────────────────

  async closeGroupOrder(id: string): Promise<IGroupOrder> {
    return this.updateStatus(id, 'open', 'closed');
  }

  async submitGroupOrder(id: string): Promise<IGroupOrder> {
    const go = await this.updateStatus(id, 'closed', 'submitted');
    const userIds = go.participants.map((p) => p.userId);
    if (userIds.length) {
      await this.notificationsService.createForUsers(userIds, {
        type: 'GROUP_ORDER_SUBMITTED',
        title: 'Order Submitted to Supplier',
        body: `Your group order at ${go.shippingSite.name} has been submitted. We'll notify you when it ships.`,
        link: `/group-orders/${go.id}`,
      });
    }
    return go;
  }

  async markShipped(id: string): Promise<IGroupOrder> {
    const go = await this.updateStatus(id, 'submitted', 'shipped');
    const userIds = go.participants.map((p) => p.userId);
    if (userIds.length) {
      await this.notificationsService.createForUsers(userIds, {
        type: 'GROUP_ORDER_SHIPPED',
        title: 'Your Wine Is on the Way!',
        body: `Your order from ${go.shippingSite.name} has shipped. See you at pickup!`,
        link: `/group-orders/${go.id}`,
      });
    }
    return go;
  }

  // ─── User: enroll in a group order ──────────────────────────────────

  async enroll(
    groupOrderId: string,
    userId: string,
  ): Promise<IGroupOrderParticipant> {
    const go = await this.groupOrderRepo.findOne({
      where: { id: groupOrderId },
    });
    if (!go) throw new NotFoundException('Group order not found');
    if (go.status !== 'open') {
      throw new BadRequestException('Group order is not open for enrollment');
    }

    const existingParticipant = await this.participantRepo.findOne({
      where: { groupOrderId, userId },
    });
    if (existingParticipant) {
      throw new ConflictException('You are already enrolled in this group order');
    }

    // Create participant
    const participant = this.participantRepo.create({ groupOrderId, userId });
    const savedParticipant = await this.participantRepo.save(participant);

    // Copy cart items → order items (snapshot price at enrollment time)
    const cartItems = await this.cartService.getRawItems(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException(
        'Your cart is empty. Add wines before enrolling.',
      );
    }

    const orderItems = cartItems.map((ci) =>
      this.orderItemRepo.create({
        participantId: savedParticipant.id,
        wineId: ci.wineId,
        quantity: ci.quantity,
        unitPrice: Number(ci.wine.price),
      }),
    );
    await this.orderItemRepo.save(orderItems);

    // Clear the cart after enrollment
    await this.cartService.clearCart(userId);

    return this.findParticipant(savedParticipant.id);
  }

  // ─── User: modify own order items (while group order is open) ──────

  async addOrderItem(
    participantId: string,
    userId: string,
    input: IOrderItemAdd,
  ): Promise<IGroupOrderParticipant> {
    const participant = await this.getVerifiedParticipant(
      participantId,
      userId,
    );

    // Check existing item for the same wine
    let existing = await this.orderItemRepo.findOne({
      where: { participantId, wineId: input.wineId },
      relations: ['wine'],
    });

    if (existing) {
      existing.quantity += input.quantity;
      await this.orderItemRepo.save(existing);
    } else {
      // Need to look up wine price
      const wineItem = await this.orderItemRepo.manager
        .getRepository('wines')
        .findOne({ where: { id: input.wineId } });
      if (!wineItem) throw new NotFoundException('Wine not found');

      const item = this.orderItemRepo.create({
        participantId,
        wineId: input.wineId,
        quantity: input.quantity,
        unitPrice: Number((wineItem as any).price),
      });
      await this.orderItemRepo.save(item);
    }

    return this.findParticipant(participant.id);
  }

  async updateOrderItem(
    participantId: string,
    orderItemId: string,
    userId: string,
    input: IOrderItemUpdate,
  ): Promise<IGroupOrderParticipant> {
    const participant = await this.getVerifiedParticipant(
      participantId,
      userId,
    );

    const item = await this.orderItemRepo.findOne({
      where: { id: orderItemId, participantId },
    });
    if (!item) throw new NotFoundException('Order item not found');

    if (input.quantity < 1) {
      await this.orderItemRepo.remove(item);
    } else {
      item.quantity = input.quantity;
      await this.orderItemRepo.save(item);
    }

    return this.findParticipant(participant.id);
  }

  async removeOrderItem(
    participantId: string,
    orderItemId: string,
    userId: string,
  ): Promise<IGroupOrderParticipant> {
    const participant = await this.getVerifiedParticipant(
      participantId,
      userId,
    );

    const item = await this.orderItemRepo.findOne({
      where: { id: orderItemId, participantId },
    });
    if (!item) throw new NotFoundException('Order item not found');
    await this.orderItemRepo.remove(item);

    return this.findParticipant(participant.id);
  }

  // ─── Queries ────────────────────────────────────────────────────────

  async findAll(status?: GroupOrderStatus): Promise<IGroupOrder[]> {
    const where = status ? { status } : {};
    const orders = await this.groupOrderRepo.find({
      where,
      relations: [
        'shippingSite',
        'participants',
        'participants.user',
        'participants.orderItems',
        'participants.orderItems.wine',
      ],
      order: { createdAt: 'DESC' },
    });
    return orders.map(this.toGroupOrderDto);
  }

  async findById(id: string): Promise<IGroupOrder> {
    const go = await this.groupOrderRepo.findOne({
      where: { id },
      relations: [
        'shippingSite',
        'participants',
        'participants.user',
        'participants.orderItems',
        'participants.orderItems.wine',
      ],
    });
    if (!go) throw new NotFoundException('Group order not found');
    return this.toGroupOrderDto(go);
  }

  async findBySite(shippingSiteId: string): Promise<IGroupOrder[]> {
    const orders = await this.groupOrderRepo.find({
      where: { shippingSiteId },
      relations: [
        'shippingSite',
        'participants',
        'participants.user',
        'participants.orderItems',
        'participants.orderItems.wine',
      ],
      order: { createdAt: 'DESC' },
    });
    return orders.map(this.toGroupOrderDto);
  }

  async findMyParticipations(userId: string): Promise<IGroupOrderParticipant[]> {
    const participations = await this.participantRepo.find({
      where: { userId },
      relations: [
        'groupOrder',
        'groupOrder.shippingSite',
        'orderItems',
        'orderItems.wine',
        'user',
      ],
      order: { enrolledAt: 'DESC' },
    });
    return participations.map(this.toParticipantDto);
  }

  async getGroupOrderSummary(id: string): Promise<IGroupOrderSummary> {
    const go = await this.findById(id);

    const aggregation: IWineAggregation[] = await this.orderItemRepo
      .createQueryBuilder('item')
      .select('item.wineId', 'wineId')
      .addSelect('wine.name', 'wineName')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.quantity * item."unitPrice")', 'totalPrice')
      .innerJoin('item.wine', 'wine')
      .innerJoin('item.participant', 'participant')
      .where('participant."groupOrderId" = :goId', { goId: id })
      .groupBy('item.wineId')
      .addGroupBy('wine.name')
      .getRawMany();

    const totalBottles = aggregation.reduce(
      (sum, a) => sum + Number(a.totalQuantity),
      0,
    );
    const totalPrice = aggregation.reduce(
      (sum, a) => sum + Number(a.totalPrice),
      0,
    );

    const minimumAmount = Number(go.minimumAmount) || 0;
    return {
      groupOrderId: go.id,
      shippingSite: go.shippingSite,
      status: go.status,
      minimumAmount,
      minimumReached: minimumAmount <= 0 || totalPrice >= minimumAmount,
      totalParticipants: go.participants.length,
      totalBottles,
      totalPrice: Math.round(totalPrice * 100) / 100,
      wineAggregation: aggregation.map((a) => ({
        wineId: a.wineId,
        wineName: a.wineName,
        totalQuantity: Number(a.totalQuantity),
        totalPrice: Math.round(Number(a.totalPrice) * 100) / 100,
      })),
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────

  private async updateStatus(
    id: string,
    expectedCurrent: GroupOrderStatus,
    next: GroupOrderStatus,
  ): Promise<IGroupOrder> {
    const go = await this.groupOrderRepo.findOne({ where: { id } });
    if (!go) throw new NotFoundException('Group order not found');
    if (go.status !== expectedCurrent) {
      throw new BadRequestException(
        `Cannot transition from "${go.status}" to "${next}"`,
      );
    }
    go.status = next;
    if (next === 'closed') {
      go.closedAt = new Date();
    }
    await this.groupOrderRepo.save(go);
    return this.findById(id);
  }

  private async getVerifiedParticipant(
    participantId: string,
    userId: string,
  ): Promise<GroupOrderParticipant> {
    const participant = await this.participantRepo.findOne({
      where: { id: participantId },
      relations: ['groupOrder'],
    });
    if (!participant) throw new NotFoundException('Participant not found');
    if (participant.userId !== userId) {
      throw new ForbiddenException('You can only modify your own order');
    }
    if (participant.groupOrder.status !== 'open') {
      throw new BadRequestException(
        'Cannot modify items — the group order is no longer open',
      );
    }
    return participant;
  }

  private async findParticipant(id: string): Promise<IGroupOrderParticipant> {
    const p = await this.participantRepo.findOne({
      where: { id },
      relations: ['user', 'orderItems', 'orderItems.wine'],
    });
    if (!p) throw new NotFoundException('Participant not found');
    return this.toParticipantDto(p);
  }

  private toGroupOrderDto = (go: GroupOrder): IGroupOrder => ({
    id: go.id,
    shippingSiteId: go.shippingSiteId,
    minimumAmount: Number(go.minimumAmount) || 0,
    shippingSite: {
      id: go.shippingSite.id,
      name: go.shippingSite.name,
      address: go.shippingSite.address,
      city: go.shippingSite.city,
      isActive: go.shippingSite.isActive,
      createdAt: go.shippingSite.createdAt.toISOString(),
      updatedAt: go.shippingSite.updatedAt.toISOString(),
    },
    status: go.status,
    createdAt: go.createdAt.toISOString(),
    closedAt: go.closedAt?.toISOString() ?? null,
    participants: (go.participants ?? []).map(this.toParticipantDto),
  });

  private toParticipantDto = (p: GroupOrderParticipant): IGroupOrderParticipant => ({
    id: p.id,
    groupOrderId: p.groupOrderId,
    userId: p.userId,
    user: {
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
      role: p.user.role,
      createdAt: p.user.createdAt.toISOString(),
      updatedAt: p.user.updatedAt.toISOString(),
      lastActiveAt: p.user.lastActiveAt ? p.user.lastActiveAt.toISOString() : null,
    },
    enrolledAt: p.enrolledAt.toISOString(),
    orderItems: (p.orderItems ?? []).map(this.toOrderItemDto),
  });

  private toOrderItemDto = (item: OrderItem): IOrderItem => ({
    id: item.id,
    participantId: item.participantId,
    wineId: item.wineId,
    wine: {
      id: item.wine.id,
      name: item.wine.name,
      color: item.wine.color,
      description: item.wine.description,
      imageUrl: item.wine.imageUrl,
      price: Number(item.wine.price),
      region: item.wine.region,
      vintage: item.wine.vintage,
      stock: item.wine.stock,
      avgRating: Number(item.wine.avgRating) || 0,
      reviewCount: item.wine.reviewCount || 0,
      createdAt: item.wine.createdAt.toISOString(),
      updatedAt: item.wine.updatedAt.toISOString(),
    },
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
  });
}
