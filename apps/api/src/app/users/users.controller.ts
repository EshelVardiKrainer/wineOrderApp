import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── User Management (SUPER_ADMIN only) ─────────────────

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      lastActiveAt: u.lastActiveAt ? u.lastActiveAt.toISOString() : null,
    }));
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    const user = await this.usersService.updateRole(id, body.role as any);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastActiveAt: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
    };
  }

  // ── Role Requests ──────────────────────────────────────

  @Post('role-requests')
  @UseGuards(JwtAuthGuard)
  async createRoleRequest(
    @Request() req: any,
    @Body() body: { requestedRole: 'ADMIN' | 'RETAIL'; reason?: string },
  ) {
    const roleReq = await this.usersService.createRoleRequest(
      req.user.id,
      body.requestedRole,
      body.reason,
    );
    return {
      id: roleReq.id,
      userId: roleReq.userId,
      requestedRole: roleReq.requestedRole,
      status: roleReq.status,
      reason: roleReq.reason,
      createdAt: roleReq.createdAt.toISOString(),
      updatedAt: roleReq.updatedAt.toISOString(),
    };
  }

  @Get('role-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getPendingRequests() {
    const requests = await this.usersService.getPendingRequests();
    return requests.map((r) => ({
      id: r.id,
      userId: r.userId,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        role: r.user.role,
        avatarUrl: r.user.avatarUrl,
      },
      requestedRole: r.requestedRole,
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  @Get('role-requests/count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getPendingRequestCount() {
    const count = await this.usersService.getPendingRequestCount();
    return { count };
  }

  @Get('role-requests/mine')
  @UseGuards(JwtAuthGuard)
  async getMyRequests(@Request() req: any) {
    const requests = await this.usersService.getMyRequests(req.user.id);
    return requests.map((r) => ({
      id: r.id,
      userId: r.userId,
      requestedRole: r.requestedRole,
      status: r.status,
      reason: r.reason,
      reviewedById: r.reviewedById,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  @Patch('role-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async reviewRoleRequest(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'DENIED' },
    @Request() req: any,
  ) {
    const roleReq = await this.usersService.reviewRoleRequest(
      id,
      body.status,
      req.user.id,
    );
    return {
      id: roleReq.id,
      userId: roleReq.userId,
      user: {
        id: roleReq.user.id,
        name: roleReq.user.name,
        email: roleReq.user.email,
        role: roleReq.user.role,
        avatarUrl: roleReq.user.avatarUrl,
      },
      requestedRole: roleReq.requestedRole,
      status: roleReq.status,
      reason: roleReq.reason,
      reviewedById: roleReq.reviewedById,
      createdAt: roleReq.createdAt.toISOString(),
      updatedAt: roleReq.updatedAt.toISOString(),
    };
  }
}
