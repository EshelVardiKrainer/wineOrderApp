import { Controller, UseGuards, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
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

  @Get()
  async findAll(): Promise<IShippingSite[]> {
    return this.sitesService.findAll(true);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAllAdmin(): Promise<IShippingSite[]> {
    return this.sitesService.findAll(false);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IShippingSite> {
    return this.sitesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() input: IShippingSiteCreate): Promise<IShippingSite> {
    return this.sitesService.create(input);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() input: IShippingSiteUpdate,
  ): Promise<IShippingSite> {
    return this.sitesService.update(id, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<void> {
    return this.sitesService.remove(id);
  }
}
