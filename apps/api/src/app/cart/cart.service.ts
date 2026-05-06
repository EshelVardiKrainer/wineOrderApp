import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import type {
  ICart,
  ICartItem,
  ICartItemAdd,
  ICartItemUpdate,
} from '@wine-order-app/shared-types';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  async getCart(userId: string): Promise<ICart> {
    const items = await this.cartItemRepo.find({
      where: { userId },
      relations: ['wine'],
      order: { wine: { name: 'ASC' } },
    });

    const cartItems: ICartItem[] = items.map((item) => ({
      id: item.id,
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
    }));

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.wine.price * item.quantity,
      0,
    );

    return { items: cartItems, totalPrice: Math.round(totalPrice * 100) / 100 };
  }

  async addItem(userId: string, input: ICartItemAdd): Promise<ICart> {
    if (input.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    let item = await this.cartItemRepo.findOne({
      where: { userId, wineId: input.wineId },
    });

    if (item) {
      item.quantity += input.quantity;
      await this.cartItemRepo.save(item);
    } else {
      item = this.cartItemRepo.create({
        userId,
        wineId: input.wineId,
        quantity: input.quantity,
      });
      await this.cartItemRepo.save(item);
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    itemId: string,
    input: ICartItemUpdate,
  ): Promise<ICart> {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (input.quantity < 1) {
      await this.cartItemRepo.remove(item);
    } else {
      item.quantity = input.quantity;
      await this.cartItemRepo.save(item);
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<ICart> {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, userId },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartItemRepo.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartItemRepo.delete({ userId });
  }

  /** Internal — get raw cart items for enrollment */
  async getRawItems(userId: string): Promise<CartItem[]> {
    return this.cartItemRepo.find({
      where: { userId },
      relations: ['wine'],
    });
  }
}
