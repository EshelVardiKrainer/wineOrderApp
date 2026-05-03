import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { RoleRequest, RoleRequestStatus } from './role-request.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RoleRequest)
    private readonly roleRequestRepo: Repository<RoleRequest>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(data: {
    name: string;
    email: string;
    googleId?: string | null;
    avatarUrl?: string | null;
    role?: UserRole | string;
  }): Promise<User> {
    const user = this.userRepo.create({
      ...data,
      role: (data.role as UserRole) || 'CUSTOMER',
    });
    return this.userRepo.save(user) as Promise<User>;
  }

  async findOrCreateByGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  }): Promise<User> {
    // Try to find by googleId first, then by email
    let user = await this.userRepo.findOne({ where: { googleId: profile.googleId } });
    if (user) {
      // Update name/avatar if changed
      user.name = profile.name;
      user.avatarUrl = profile.avatarUrl ?? user.avatarUrl;
      return this.userRepo.save(user) as Promise<User>;
    }

    user = await this.findByEmail(profile.email);
    if (user) {
      // Link existing account to Google
      user.googleId = profile.googleId;
      user.name = profile.name;
      user.avatarUrl = profile.avatarUrl ?? user.avatarUrl;
      return this.userRepo.save(user) as Promise<User>;
    }

    // Create new user
    return this.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl,
      role: 'CUSTOMER',
    });
  }

  // ── User Management (SUPER_ADMIN) ──────────────────────

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateRole(userId: string, newRole: UserRole): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (newRole === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot assign SUPER_ADMIN role via API');
    }
    user.role = newRole;
    return this.userRepo.save(user) as Promise<User>;
  }

  // ── Role Requests ──────────────────────────────────────

  async createRoleRequest(
    userId: string,
    requestedRole: 'ADMIN' | 'RETAIL',
    reason?: string,
  ): Promise<RoleRequest> {
    // Check for existing pending request
    const existing = await this.roleRequestRepo.findOne({
      where: { userId, status: 'PENDING' },
    });
    if (existing) {
      throw new BadRequestException('You already have a pending role request');
    }

    const req = this.roleRequestRepo.create({
      userId,
      requestedRole,
      reason: reason || null,
      status: 'PENDING',
    });
    return this.roleRequestRepo.save(req) as Promise<RoleRequest>;
  }

  async getPendingRequests(): Promise<RoleRequest[]> {
    return this.roleRequestRepo.find({
      where: { status: 'PENDING' },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getPendingRequestCount(): Promise<number> {
    return this.roleRequestRepo.count({ where: { status: 'PENDING' } });
  }

  async getMyRequests(userId: string): Promise<RoleRequest[]> {
    return this.roleRequestRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async reviewRoleRequest(
    requestId: string,
    status: 'APPROVED' | 'DENIED',
    reviewerId: string,
  ): Promise<RoleRequest> {
    const req = await this.roleRequestRepo.findOne({
      where: { id: requestId },
      relations: ['user'],
    });
    if (!req) throw new NotFoundException('Role request not found');
    if (req.status !== 'PENDING') {
      throw new BadRequestException('This request has already been reviewed');
    }

    req.status = status;
    req.reviewedById = reviewerId;

    if (status === 'APPROVED') {
      const user = await this.userRepo.findOne({ where: { id: req.userId } });
      if (user) {
        user.role = req.requestedRole;
        await this.userRepo.save(user);
      }
    }

    return this.roleRequestRepo.save(req) as Promise<RoleRequest>;
  }
}
