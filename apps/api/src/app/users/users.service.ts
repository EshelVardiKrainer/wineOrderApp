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
    passwordHash: string;
    role: UserRole | string;
  }): Promise<User> {
    const user = this.userRepo.create({
      ...data,
      role: data.role as UserRole,
    });
    return this.userRepo.save(user) as Promise<User>;
  }
}
