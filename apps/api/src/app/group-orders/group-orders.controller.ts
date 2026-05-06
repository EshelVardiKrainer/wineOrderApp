import { Controller, UseGuards, Req, Query } from '@nestjs/common';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import { GroupOrdersService } from './group-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type {
  IGroupOrder,
  IGroupOrderCreate,
  IGroupOrderParticipant,
  IGroupOrderSummary,
  IOrderItemAdd,
  IOrderItemUpdate,
  GroupOrderStatus,
} from '@wine-order-app/shared-types';

interface AuthRequest {
  user: { id: string; email: string; name: string; role: string };
}

@Controller('group-orders')
export class GroupOrdersController {
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  // ─── Public / Authenticated queries ────────────────────────────────

  /** List all group orders, optionally filtered by status */
  @TypedRoute.Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req: AuthRequest,
    @Query('status') status?: GroupOrderStatus,
  ): Promise<IGroupOrder[]> {
    return this.groupOrdersService.findAll(req.user.id, status);
  }

  /** Get a single group order by id */
  @TypedRoute.Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Req() req: AuthRequest,
    @TypedParam('id') id: string
  ): Promise<IGroupOrder> {
    return this.groupOrdersService.findById(id, req.user.id);
  }

  /** Get group orders for a specific site */
  @TypedRoute.Get('site/:siteId')
  @UseGuards(JwtAuthGuard)
  async findBySite(
    @TypedParam('siteId') siteId: string,
  ): Promise<IGroupOrder[]> {
    return this.groupOrdersService.findBySite(siteId);
  }

  /** Get aggregated summary for a group order (supplier view) */
  @TypedRoute.Get(':id/summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(
    @Req() req: AuthRequest,
    @TypedParam('id') id: string,
  ): Promise<IGroupOrderSummary> {
    return this.groupOrdersService.getGroupOrderSummary(id, req.user.id, req.user.role);
  }

  /** Get the current user's enrollments */
  @TypedRoute.Get('my/participations')
  @UseGuards(JwtAuthGuard)
  async myParticipations(
    @Req() req: AuthRequest,
  ): Promise<IGroupOrderParticipant[]> {
    return this.groupOrdersService.findMyParticipations(req.user.id);
  }

  // ─── Admin: manage group orders ────────────────────────────────────

  /** Admin or Group Owner/Manager — open a new group order for a shipping site */
  @TypedRoute.Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: AuthRequest,
    @TypedBody() input: IGroupOrderCreate
  ): Promise<IGroupOrder> {
    return this.groupOrdersService.createGroupOrder(input, req.user.id, req.user.role);
  }

  /** Admin or Owner/Manager — close a group order (no more modifications) */
  @TypedRoute.Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  async close(@Req() req: AuthRequest, @TypedParam('id') id: string): Promise<IGroupOrder> {
    return this.groupOrdersService.closeGroupOrder(id, req.user.id, req.user.role);
  }

  /** Admin or Owner/Manager — submit a closed group order to supplier */
  @TypedRoute.Patch(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submit(@Req() req: AuthRequest, @TypedParam('id') id: string): Promise<IGroupOrder> {
    return this.groupOrdersService.submitGroupOrder(id, req.user.id, req.user.role);
  }

  /** Admin or Owner/Manager — mark group order as shipped */
  @TypedRoute.Patch(':id/ship')
  @UseGuards(JwtAuthGuard)
  async ship(@Req() req: AuthRequest, @TypedParam('id') id: string): Promise<IGroupOrder> {
    return this.groupOrdersService.markShipped(id, req.user.id, req.user.role);
  }

  // ─── User: enrollment & order item management ──────────────────────

  /** Enroll in a group order (copies cart → order items) */
  @TypedRoute.Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async enroll(
    @TypedParam('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.enroll(id, req.user.id);
  }

  /** Add a wine to my enrollment */
  @TypedRoute.Post('participants/:participantId/items')
  @UseGuards(JwtAuthGuard)
  async addOrderItem(
    @TypedParam('participantId') participantId: string,
    @Req() req: AuthRequest,
    @TypedBody() input: IOrderItemAdd,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.addOrderItem(
      participantId,
      req.user.id,
      input,
    );
  }

  /** Update quantity of an order item */
  @TypedRoute.Patch('participants/:participantId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  async updateOrderItem(
    @TypedParam('participantId') participantId: string,
    @TypedParam('itemId') itemId: string,
    @Req() req: AuthRequest,
    @TypedBody() input: IOrderItemUpdate,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.updateOrderItem(
      participantId,
      itemId,
      req.user.id,
      input,
    );
  }

  /** Remove an order item */
  @TypedRoute.Delete('participants/:participantId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  async removeOrderItem(
    @TypedParam('participantId') participantId: string,
    @TypedParam('itemId') itemId: string,
    @Req() req: AuthRequest,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.removeOrderItem(
      participantId,
      itemId,
      req.user.id,
    );
  }
}
