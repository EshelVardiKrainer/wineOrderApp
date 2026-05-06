import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { ShippingSite } from '../shipping-sites/shipping-site.entity';
import { User } from '../users/user.entity';
import { IGroupCreateRequest, IGroup, GroupMemberRole } from '@wine-order-app/shared-types';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupMember) private readonly memberRepo: Repository<GroupMember>,
    @InjectRepository(ShippingSite) private readonly siteRepo: Repository<ShippingSite>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async requestGroup(userId: string, data: IGroupCreateRequest): Promise<IGroup> {
    const proposedSite = this.siteRepo.create({
      name: data.shippingSiteDetails.name,
      address: data.shippingSiteDetails.address,
      city: data.shippingSiteDetails.city,
      isActive: false,
    });
    const savedSite = await this.siteRepo.save(proposedSite);

    const group = this.groupRepo.create({
      name: data.name,
      shippingSiteId: savedSite.id,
      status: 'PENDING_APPROVAL',
    });
    const savedGroup = await this.groupRepo.save(group);

    const member = this.memberRepo.create({
      groupId: savedGroup.id,
      userId: userId,
      role: 'OWNER',
      status: 'ACTIVE',
    });
    await this.memberRepo.save(member);

    return this.findById(savedGroup.id);
  }

  async getPendingGroups(): Promise<IGroup[]> {
    const groups = await this.groupRepo.find({
      where: { status: 'PENDING_APPROVAL' },
      relations: ['shippingSite', 'members', 'members.user'],
    });
    return groups as unknown as IGroup[];
  }

  async approveGroup(groupId: string): Promise<IGroup> {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['shippingSite', 'members', 'members.user'],
    });
    if (!group) throw new NotFoundException('Group not found');
    if (group.status === 'ACTIVE') throw new ConflictException('Group is already active');

    group.status = 'ACTIVE';
    await this.groupRepo.save(group);

    if (group.shippingSite) {
      group.shippingSite.isActive = true;
      await this.siteRepo.save(group.shippingSite);
    }

    const ownerMember = group.members?.find((m) => m.role === 'OWNER');
    if (ownerMember && ownerMember.user) {
      this.logger.log(`[SIMULATED EMAIL] Sending approval email to ${ownerMember.user.email} (Group: ${group.name})`);
    }

    return this.findById(groupId);
  }

  private async getGroupActiveRoles(groupId: string, userId: string) {
    const member = await this.memberRepo.findOne({ where: { groupId, userId, status: 'ACTIVE' } });
    return member ? member.role : null;
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    const existing = await this.memberRepo.findOne({ where: { groupId, userId } });
    if (existing) throw new ConflictException('Already a member or pending request exists');

    const member = this.memberRepo.create({ groupId, userId, role: 'MEMBER', status: 'PENDING' });
    await this.memberRepo.save(member);
  }

  async approveMember(groupId: string, targetUserId: string, approverId: string): Promise<void> {
    const approverRole = await this.getGroupActiveRoles(groupId, approverId);
    if (approverRole !== 'OWNER' && approverRole !== 'MANAGER') throw new ForbiddenException('Not authorized');

    const member = await this.memberRepo.findOne({ where: { groupId, userId: targetUserId } });
    if (!member || member.status !== 'PENDING') throw new NotFoundException('Pending request not found');

    member.status = 'ACTIVE';
    await this.memberRepo.save(member);
  }

  async inviteUser(groupId: string, targetEmail: string, inviterId: string): Promise<void> {
    const inviterRole = await this.getGroupActiveRoles(groupId, inviterId);
    if (inviterRole !== 'OWNER' && inviterRole !== 'MANAGER') throw new ForbiddenException('Not authorized');

    const targetUser = await this.userRepo.findOne({ where: { email: targetEmail } });
    if (!targetUser) throw new NotFoundException('User with that email not found');

    const existing = await this.memberRepo.findOne({ where: { groupId, userId: targetUser.id } });
    if (existing) throw new ConflictException('User is already a member, pending, or invited');

    const member = this.memberRepo.create({ groupId, userId: targetUser.id, role: 'MEMBER', status: 'INVITED' });
    await this.memberRepo.save(member);
    this.logger.log(`[SIMULATED EMAIL] You have been invited to join group ${groupId}`);
  }

  async changeMemberRole(groupId: string, targetUserId: string, requesterId: string, newRole: GroupMemberRole): Promise<void> {
    const requesterRole = await this.getGroupActiveRoles(groupId, requesterId);
    if (requesterRole !== 'OWNER') throw new ForbiddenException('Only owners can change roles');

    const member = await this.memberRepo.findOne({ where: { groupId, userId: targetUserId } });
    if (!member) throw new NotFoundException('Member not found');
    if (member.status !== 'ACTIVE') throw new ConflictException('Member is not active');
    
    if (member.role === 'OWNER') throw new ConflictException('Cannot change role of the owner directly this way without transfer');

    member.role = newRole;
    await this.memberRepo.save(member);
  }

  async getMyGroups(userId: string): Promise<IGroup[]> {
    const groups = await this.groupRepo.find({
      where: { members: { userId } },
      relations: ['shippingSite', 'members', 'members.user'],
    });
    return groups as unknown as IGroup[];
  }

  private async findById(id: string): Promise<IGroup> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['shippingSite', 'members', 'members.user'],
    });
    if (!group) throw new NotFoundException('Group not found');
    return group as unknown as IGroup;
  }
}
