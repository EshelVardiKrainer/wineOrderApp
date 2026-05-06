import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './wishlist.entity';
import type { IWishlistItem } from '@wine-order-app/shared-types';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly repo: Repository<WishlistItem>,
  ) {}

  async getForUser(userId: string): Promise<IWishlistItem[]> {
    const items = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return items.map(this.toDto);
  }

  async add(userId: string, wineId: string): Promise<IWishlistItem> {
    const existing = await this.repo.findOne({ where: { userId, wineId } });
    if (existing) return this.toDto(existing);
    const item = await this.repo.save(this.repo.create({ userId, wineId }));
    const loaded = await this.repo.findOne({ where: { id: item.id } });
    return this.toDto(loaded!);
  }

  async remove(userId: string, wineId: string): Promise<void> {
    await this.repo.delete({ userId, wineId });
  }

  async getWineIds(userId: string): Promise<string[]> {
    const items = await this.repo.find({ where: { userId }, select: ['wineId'] });
    return items.map((i) => i.wineId);
  }

  private toDto = (item: WishlistItem): IWishlistItem => ({
    id: item.id,
    userId: item.userId,
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
    createdAt: item.createdAt.toISOString(),
  });
}
