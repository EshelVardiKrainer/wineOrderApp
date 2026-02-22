import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wine } from './wine.entity';
import type {
  IWine,
  IWineCreate,
  IWineUpdate,
  IWineFilter,
  IWineListResponse,
} from '@wine-order-app/shared-types';

@Injectable()
export class WinesService {
  constructor(
    @InjectRepository(Wine)
    private readonly wineRepo: Repository<Wine>,
  ) {}

  async findAll(filter: IWineFilter): Promise<IWineListResponse> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.wineRepo.createQueryBuilder('wine');

    if (filter.color) {
      qb.andWhere('wine.color = :color', { color: filter.color });
    }
    if (filter.region) {
      qb.andWhere('wine.region ILIKE :region', {
        region: `%${filter.region}%`,
      });
    }
    if (filter.minVintage) {
      qb.andWhere('wine.vintage >= :minVintage', {
        minVintage: filter.minVintage,
      });
    }
    if (filter.maxVintage) {
      qb.andWhere('wine.vintage <= :maxVintage', {
        maxVintage: filter.maxVintage,
      });
    }
    if (filter.minPrice) {
      qb.andWhere('wine.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice) {
      qb.andWhere('wine.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }
    if (filter.search) {
      qb.andWhere('(wine.name ILIKE :search OR wine.description ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }

    qb.orderBy("CASE wine.color WHEN 'red' THEN 1 WHEN 'rose' THEN 2 WHEN 'white' THEN 3 WHEN 'orange' THEN 4 ELSE 5 END", 'ASC')
      .addOrderBy('wine.name', 'ASC')
      .skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map(this.toDto),
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<IWine> {
    const wine = await this.wineRepo.findOne({ where: { id } });
    if (!wine) throw new NotFoundException('Wine not found');
    return this.toDto(wine);
  }

  async create(input: IWineCreate): Promise<IWine> {
    const wine = this.wineRepo.create(input);
    const saved = await this.wineRepo.save(wine);
    return this.toDto(saved);
  }

  async update(id: string, input: IWineUpdate): Promise<IWine> {
    const wine = await this.wineRepo.findOne({ where: { id } });
    if (!wine) throw new NotFoundException('Wine not found');
    Object.assign(wine, input);
    const saved = await this.wineRepo.save(wine);
    return this.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.wineRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Wine not found');
  }

  private toDto(wine: Wine): IWine {
    return {
      id: wine.id,
      name: wine.name,
      color: wine.color,
      description: wine.description,
      imageUrl: wine.imageUrl,
      price: Number(wine.price),
      region: wine.region,
      vintage: wine.vintage,
      stock: wine.stock,
      createdAt: wine.createdAt.toISOString(),
      updatedAt: wine.updatedAt.toISOString(),
    };
  }
}
