import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../modules/users/entities/user.entity';
import { LeaveType } from '../modules/leave/entities/leave-type.entity';
import { Employee } from '../modules/employees/entities/employee.entity';
import { UserRole, EmploymentStatus } from '../common/enums';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(LeaveType)
    private leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedDemoEmployee();
    await this.seedLeaveTypes();
  }

  private async seedDemoEmployee() {
    try {
      const email = 'demo.employee@josmef.com';
      const existing = await this.userRepo.findOne({ where: { email } });
      if (existing) {
        this.logger.log('Demo employee user already exists, skipping');
        return;
      }
      const password = await bcrypt.hash('Demo@2025', 12);
      await this.userRepo.save({
        firstName: 'Maria',
        lastName: 'Santos',
        email,
        password,
        role: UserRole.EMPLOYEE,
        isActive: true,
      });

      // Create a matching Employee record so portal endpoints work
      const empExists = await this.employeeRepo.findOne({ where: { email } });
      if (!empExists) {
        await this.employeeRepo.save({
          employeeId: 'EMP-DEMO-001',
          firstName: 'Maria',
          lastName: 'Santos',
          email,
          mobile: '+639170000000',
          employmentStatus: EmploymentStatus.REGULAR,
        } as any);
      }
      this.logger.log('Demo employee created: demo.employee@josmef.com / Demo@2025');
    } catch (err) {
      this.logger.error('Demo employee seed failed', err);
    }
  }

  private async seedAdmin() {
    try {
      const existing = await this.userRepo.findOne({
        where: { email: 'admin@josmef.com' },
      });
      if (existing) {
        this.logger.log('Admin user already exists, skipping');
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
      this.logger.error('Admin seed failed', err);
    }
  }

  private async seedLeaveTypes() {
    try {
      const count = await this.leaveTypeRepo.count();
      if (count > 0) {
        this.logger.log('Leave types already seeded');
        return;
      }
      const defaults: Partial<LeaveType>[] = [
        { code: 'VL', name: 'Vacation Leave', annualEntitlement: 15, isPaid: true, requiresApproval: true, description: 'Annual vacation leave' },
        { code: 'SL', name: 'Sick Leave', annualEntitlement: 15, isPaid: true, requiresApproval: true, description: 'Medical leave for illness' },
        { code: 'ML', name: 'Maternity Leave', annualEntitlement: 105, isPaid: true, requiresApproval: true, description: 'Maternity leave (PH law: 105 days)' },
        { code: 'PL', name: 'Paternity Leave', annualEntitlement: 7, isPaid: true, requiresApproval: true, description: 'Paternity leave (PH law: 7 days)' },
        { code: 'BL', name: 'Bereavement Leave', annualEntitlement: 3, isPaid: true, requiresApproval: true, description: 'Leave for death of immediate family' },
        { code: 'SOLO', name: 'Solo Parent Leave', annualEntitlement: 7, isPaid: true, requiresApproval: true, description: 'RA 8972 — 7 days for solo parents' },
        { code: 'VAWC', name: 'VAWC Leave', annualEntitlement: 10, isPaid: true, requiresApproval: true, description: 'RA 9262 — Violence Against Women & Children leave' },
        { code: 'UL', name: 'Unpaid Leave', annualEntitlement: 0, isPaid: false, requiresApproval: true, description: 'Leave without pay' },
      ];
      await this.leaveTypeRepo.save(defaults);
      this.logger.log(`Seeded ${defaults.length} leave types`);
    } catch (err) {
      this.logger.error('Leave types seed failed', err);
    }
  }
}
