import { Controller, UseGuards } from '@nestjs/common';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import { ShippingSitesService } from './shipping-sites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type {
  IShippingSite,
  IShippingSiteCreate,
  IShippingSiteUpdate,
} from '@wine-order-app/shared-types';

@Controller('shipping-sites')
export class ShippingSitesController {
  constructor(private readonly sitesService: ShippingSitesService) {}

  /** Public — list active shipping sites */
  @TypedRoute.Get()
  async findAll(): Promise<IShippingSite[]> {
    return this.sitesService.findAll(true);
  }

  /** Admin — list all shipping sites including inactive */
  @TypedRoute.Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAllAdmin(): Promise<IShippingSite[]> {
    return this.sitesService.findAll(false);
  }

  /** Public — get a single shipping site */
  @TypedRoute.Get(':id')
  async findOne(@TypedParam('id') id: string): Promise<IShippingSite> {
    return this.sitesService.findById(id);
  }

  /** Admin — create a shipping site */
  @TypedRoute.Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@TypedBody() input: IShippingSiteCreate): Promise<IShippingSite> {
    return this.sitesService.create(input);
  }

  /** Admin — update a shipping site */
  @TypedRoute.Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @TypedParam('id') id: string,
    @TypedBody() input: IShippingSiteUpdate,
  ): Promise<IShippingSite> {
    return this.sitesService.update(id, input);
  }

  /** Admin — delete a shipping site */
  @TypedRoute.Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@TypedParam('id') id: string): Promise<void> {
    return this.sitesService.remove(id);
  }
}
