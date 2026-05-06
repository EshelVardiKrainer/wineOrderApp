import { Controller, Post, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { IGroupCreateRequest, IGroup, IGroupMemberRoleUpdate, IGroupInviteRequest } from '@wine-order-app/shared-types';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('request')
  async requestGroup(@Req() req: Request, @Body() body: IGroupCreateRequest): Promise<IGroup> {
    const user = req.user as any;
    return this.groupsService.requestGroup(user.userId, body);
  }

  @Get('pending')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getPendingGroups(): Promise<IGroup[]> {
    return this.groupsService.getPendingGroups();
  }

  @Put(':id/approve')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async approveGroup(@Param('id') id: string): Promise<IGroup> {
    return this.groupsService.approveGroup(id);
  }
  
  @Get('mine')
  async getMyGroups(@Req() req: Request): Promise<IGroup[]> {
    const user = req.user as any;
    return this.groupsService.getMyGroups(user.userId);
  }

  @Post(':id/join')
  async joinGroup(@Req() req: Request, @Param('id') groupId: string): Promise<void> {
    const user = req.user as any;
    await this.groupsService.joinGroup(groupId, user.userId);
  }

  @Post(':id/invite')
  async inviteUser(@Req() req: Request, @Param('id') groupId: string, @Body() body: IGroupInviteRequest): Promise<void> {
    const user = req.user as any;
    await this.groupsService.inviteUser(groupId, body.email, user.userId);
  }

  @Put(':id/members/:userId/approve')
  async approveMember(@Req() req: Request, @Param('id') groupId: string, @Param('userId') targetUserId: string): Promise<void> {
    const user = req.user as any;
    await this.groupsService.approveMember(groupId, targetUserId, user.userId);
  }

  @Put(':id/members/:userId/role')
  async changeMemberRole(
    @Req() req: Request, 
    @Param('id') groupId: string, 
    @Param('userId') targetUserId: string,
    @Body() body: IGroupMemberRoleUpdate
  ): Promise<void> {
    const user = req.user as any;
    await this.groupsService.changeMemberRole(groupId, targetUserId, user.userId, body.role);
  }
}
