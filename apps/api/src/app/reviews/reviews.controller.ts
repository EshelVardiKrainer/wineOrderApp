import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, Optional } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import type { IWineReview, IWineReviewCreate, IWineReviewSummary } from '@wine-order-app/shared-types';

interface AuthRequest { user: { id: string } }

@Controller('wines/:wineId/reviews')
export class ReviewsController {
  constructor(private readonly svc: ReviewsService) {}

  @Get()
  getForWine(@Param('wineId') wineId: string): Promise<IWineReviewSummary> {
    return this.svc.getForWine(wineId);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMyReview(
    @Param('wineId') wineId: string,
    @Req() req: AuthRequest,
  ): Promise<IWineReview | null> {
    return this.svc.getMyReview(req.user.id, wineId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(
    @Param('wineId') wineId: string,
    @Req() req: AuthRequest,
    @Body() body: IWineReviewCreate,
  ): Promise<IWineReview> {
    return this.svc.upsert(req.user.id, wineId, body);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteMyReview(
    @Param('wineId') wineId: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.svc.deleteReview(req.user.id, wineId);
  }
}
