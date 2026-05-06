import { Controller, UseGuards, Req, Get, Patch, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import type { INotification } from '@wine-order-app/shared-types';

interface AuthRequest {
  user: { id: string };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  getAll(@Req() req: AuthRequest): Promise<INotification[]> {
    return this.svc.getForUser(req.user.id);
  }

  @Get('count')
  async getUnreadCount(@Req() req: AuthRequest): Promise<{ count: number }> {
    const count = await this.svc.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch('read-all')
  markAllRead(@Req() req: AuthRequest): Promise<void> {
    return this.svc.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  markRead(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.svc.markRead(id, req.user.id);
  }
}
