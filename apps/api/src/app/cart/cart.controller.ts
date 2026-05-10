import { Controller, UseGuards, Req, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
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

  @Get()
  async getCart(@Req() req: AuthRequest): Promise<ICart> {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  async addItem(
    @Req() req: AuthRequest,
    @Body() input: ICartItemAdd,
  ): Promise<ICart> {
    return this.cartService.addItem(req.user.id, input);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Req() req: AuthRequest,
    @Param('itemId') itemId: string,
    @Body() input: ICartItemUpdate,
  ): Promise<ICart> {
    return this.cartService.updateItem(req.user.id, itemId, input);
  }

  @Delete('items/:itemId')
  async removeItem(
    @Req() req: AuthRequest,
    @Param('itemId') itemId: string,
  ): Promise<ICart> {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  @Delete()
  async clearCart(@Req() req: AuthRequest): Promise<void> {
    return this.cartService.clearCart(req.user.id);
  }
}
