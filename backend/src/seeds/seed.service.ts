import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../common/enums';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    try {
      const existing = await this.userRepo.findOne({
        where: { email: 'admin@josmef.com' },
      });
      if (existing) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }
      const password = await bcrypt.hash('Admin@2025', 12);
      await this.userRepo.save({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@josmef.com',
        password,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      this.logger.log('Admin created: admin@josmef.com / Admin@2025');
    } catch (err) {
      this.logger.error('Seed failed', err);
    }
  }
}
