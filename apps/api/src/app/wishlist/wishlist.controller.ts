import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';
import type { IWishlistItem } from '@wine-order-app/shared-types';

interface AuthRequest { user: { id: string } }

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly svc: WishlistService) {}

  @Get()
  getAll(@Req() req: AuthRequest): Promise<IWishlistItem[]> {
    return this.svc.getForUser(req.user.id);
  }

  @Get('ids')
  async getIds(@Req() req: AuthRequest): Promise<string[]> {
    return this.svc.getWineIds(req.user.id);
  }

  @Post(':wineId')
  add(@Param('wineId') wineId: string, @Req() req: AuthRequest): Promise<IWishlistItem> {
    return this.svc.add(req.user.id, wineId);
  }

  @Delete(':wineId')
  remove(@Param('wineId') wineId: string, @Req() req: AuthRequest): Promise<void> {
    return this.svc.remove(req.user.id, wineId);
  }
}
