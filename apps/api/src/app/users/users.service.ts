import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
}
