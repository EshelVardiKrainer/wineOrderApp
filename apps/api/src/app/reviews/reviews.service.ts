import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WineReview } from './wine-review.entity';
import { Wine } from '../wines/wine.entity';
import type { IWineReview, IWineReviewCreate, IWineReviewSummary } from '@wine-order-app/shared-types';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(WineReview)
    private readonly repo: Repository<WineReview>,
    @InjectRepository(Wine)
    private readonly wineRepo: Repository<Wine>,
  ) {}

  async upsert(userId: string, wineId: string, input: IWineReviewCreate): Promise<IWineReview> {
    if (input.rating < 1 || input.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    let review = await this.repo.findOne({ where: { userId, wineId }, relations: ['user'] });
    if (review) {
      review.rating = input.rating;
      review.comment = input.comment ?? null;
      review = await this.repo.save(review);
    } else {
      const created = this.repo.create({
        userId,
        wineId,
        rating: input.rating,
        comment: input.comment ?? null,
      });
      review = await this.repo.save(created);
      review = await this.repo.findOne({ where: { id: review.id }, relations: ['user'] }) ?? review;
    }

    await this.recalcWineRating(wineId);
    return this.toDto(review);
  }

  async getForWine(wineId: string): Promise<IWineReviewSummary> {
    const reviews = await this.repo.find({
      where: { wineId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    const count = reviews.length;
    const avgRating = count > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;
    return { avgRating, count, reviews: reviews.map(this.toDto) };
  }

  async getMyReview(userId: string, wineId: string): Promise<IWineReview | null> {
    const r = await this.repo.findOne({ where: { userId, wineId }, relations: ['user'] });
    return r ? this.toDto(r) : null;
  }

  async deleteReview(userId: string, wineId: string): Promise<void> {
    await this.repo.delete({ userId, wineId });
    await this.recalcWineRating(wineId);
  }

  private async recalcWineRating(wineId: string): Promise<void> {
    const result = await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.wineId = :wineId', { wineId })
      .getRawOne();
    await this.wineRepo.update(wineId, {
      avgRating: result.avg ? Math.round(Number(result.avg) * 10) / 10 : 0,
      reviewCount: Number(result.count) || 0,
    });
  }

  private toDto = (r: WineReview): IWineReview => ({
    id: r.id,
    userId: r.userId,
    userName: r.user?.name ?? 'Unknown',
    wineId: r.wineId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  });
}
