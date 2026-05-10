import { Controller, UseGuards, Req, Query, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { GroupOrdersService } from './group-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type {
  IGroupOrder,
  IGroupOrderCreate,
  IGroupOrderParticipant,
  IGroupOrderSummary,
  IOrderItemAdd,
  IOrderItemUpdate,
  GroupOrderStatus,
} from '@wine-order-app/shared-types';

interface AuthRequest {
  user: { id: string; email: string; name: string; role: string };
}

@Controller('group-orders')
export class GroupOrdersController {
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('status') status?: GroupOrderStatus): Promise<IGroupOrder[]> {
    return this.groupOrdersService.findAll(status);
  }

  @Get('my/participations')
  @UseGuards(JwtAuthGuard)
  async myParticipations(@Req() req: AuthRequest): Promise<IGroupOrderParticipant[]> {
    return this.groupOrdersService.findMyParticipations(req.user.id);
  }

  @Get('site/:siteId')
  @UseGuards(JwtAuthGuard)
  async findBySite(@Param('siteId') siteId: string): Promise<IGroupOrder[]> {
    return this.groupOrdersService.findBySite(siteId);
  }

  @Get(':id/summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(@Param('id') id: string): Promise<IGroupOrderSummary> {
    return this.groupOrdersService.getGroupOrderSummary(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<IGroupOrder> {
    return this.groupOrdersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() input: IGroupOrderCreate): Promise<IGroupOrder> {
    return this.groupOrdersService.createGroupOrder(input);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async enroll(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.enroll(id, req.user.id);
  }

  @Post('participants/:participantId/items')
  @UseGuards(JwtAuthGuard)
  async addOrderItem(
    @Param('participantId') participantId: string,
    @Req() req: AuthRequest,
    @Body() input: IOrderItemAdd,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.addOrderItem(participantId, req.user.id, input);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async close(@Param('id') id: string): Promise<IGroupOrder> {
    return this.groupOrdersService.closeGroupOrder(id);
  }

  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async submit(@Param('id') id: string): Promise<IGroupOrder> {
    return this.groupOrdersService.submitGroupOrder(id);
  }

  @Patch(':id/ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async ship(@Param('id') id: string): Promise<IGroupOrder> {
    return this.groupOrdersService.markShipped(id);
  }

  @Patch('participants/:participantId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  async updateOrderItem(
    @Param('participantId') participantId: string,
    @Param('itemId') itemId: string,
    @Req() req: AuthRequest,
    @Body() input: IOrderItemUpdate,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.updateOrderItem(participantId, itemId, req.user.id, input);
  }

  @Delete('participants/:participantId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  async removeOrderItem(
    @Param('participantId') participantId: string,
    @Param('itemId') itemId: string,
    @Req() req: AuthRequest,
  ): Promise<IGroupOrderParticipant> {
    return this.groupOrdersService.removeOrderItem(participantId, itemId, req.user.id);
  }
}
