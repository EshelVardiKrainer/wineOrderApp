import { Controller, UseGuards, Req } from '@nestjs/common';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type {
  ICart,
  ICartItemAdd,
  ICartItemUpdate,
} from '@wine-order-app/shared-types';

interface AuthRequest {
  user: { id: string; email: string; name: string; role: string };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /** Get the current user's cart */
  @TypedRoute.Get()
  async getCart(@Req() req: AuthRequest): Promise<ICart> {
    return this.cartService.getCart(req.user.id);
  }

  /** Add an item to cart (or increment quantity if it already exists) */
  @TypedRoute.Post('items')
  async addItem(
    @Req() req: AuthRequest,
    @TypedBody() input: ICartItemAdd,
  ): Promise<ICart> {
    return this.cartService.addItem(req.user.id, input);
  }

  /** Update quantity of a cart item */
  @TypedRoute.Patch('items/:itemId')
  async updateItem(
    @Req() req: AuthRequest,
    @TypedParam('itemId') itemId: string,
    @TypedBody() input: ICartItemUpdate,
  ): Promise<ICart> {
    return this.cartService.updateItem(req.user.id, itemId, input);
  }

  /** Remove an item from cart */
  @TypedRoute.Delete('items/:itemId')
  async removeItem(
    @Req() req: AuthRequest,
    @TypedParam('itemId') itemId: string,
  ): Promise<ICart> {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  /** Clear all cart items */
  @TypedRoute.Delete()
  async clearCart(@Req() req: AuthRequest): Promise<void> {
    return this.cartService.clearCart(req.user.id);
  }
}
