import { Controller, UseGuards } from '@nestjs/common';
import { TypedRoute, TypedBody, TypedParam, TypedQuery } from '@nestia/core';
import { WinesService } from './wines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type {
  IWine,
  IWineCreate,
  IWineUpdate,
  IWineFilter,
  IWineListResponse,
} from '@wine-order-app/shared-types';

@Controller('wines')
export class WinesController {
  constructor(private readonly winesService: WinesService) {}

  /** Public — browse the wine catalog with filters */
  @TypedRoute.Get()
  async findAll(@TypedQuery() filter: IWineFilter): Promise<IWineListResponse> {
    return this.winesService.findAll(filter);
  }

  /** Public — get a single wine by id */
  @TypedRoute.Get(':id')
  async findOne(@TypedParam('id') id: string): Promise<IWine> {
    return this.winesService.findById(id);
  }

  /** Admin — create a wine */
  @TypedRoute.Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@TypedBody() input: IWineCreate): Promise<IWine> {
    return this.winesService.create(input);
  }

  /** Admin — update a wine */
  @TypedRoute.Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @TypedParam('id') id: string,
    @TypedBody() input: IWineUpdate,
  ): Promise<IWine> {
    return this.winesService.update(id, input);
  }

  /** Admin — delete a wine */
  @TypedRoute.Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@TypedParam('id') id: string): Promise<void> {
    return this.winesService.remove(id);
  }
}
