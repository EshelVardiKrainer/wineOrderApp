import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingSite } from './shipping-site.entity';
import type {
  IShippingSite,
  IShippingSiteCreate,
  IShippingSiteUpdate,
} from '@wine-order-app/shared-types';

@Injectable()
export class ShippingSitesService {
  constructor(
    @InjectRepository(ShippingSite)
    private readonly siteRepo: Repository<ShippingSite>,
  ) {}

  async findAll(activeOnly = true): Promise<IShippingSite[]> {
    const where = activeOnly ? { isActive: true } : {};
    const sites = await this.siteRepo.find({
      where,
      order: { name: 'ASC' },
    });
    return sites.map(this.toDto);
  }

  async findById(id: string): Promise<IShippingSite> {
    const site = await this.siteRepo.findOne({ where: { id } });
    if (!site) throw new NotFoundException('Shipping site not found');
    return this.toDto(site);
  }

  async create(input: IShippingSiteCreate): Promise<IShippingSite> {
    const site = this.siteRepo.create(input);
    const saved = await this.siteRepo.save(site);
    return this.toDto(saved);
  }

  async update(id: string, input: IShippingSiteUpdate): Promise<IShippingSite> {
    const site = await this.siteRepo.findOne({ where: { id } });
    if (!site) throw new NotFoundException('Shipping site not found');
    Object.assign(site, input);
    const saved = await this.siteRepo.save(site);
    return this.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.siteRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Shipping site not found');
  }

  private toDto(site: ShippingSite): IShippingSite {
    return {
      id: site.id,
      name: site.name,
      address: site.address,
      city: site.city,
      isActive: site.isActive,
      createdAt: site.createdAt.toISOString(),
      updatedAt: site.updatedAt.toISOString(),
    };
  }
}
