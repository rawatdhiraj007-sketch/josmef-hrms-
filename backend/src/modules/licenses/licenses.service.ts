import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { License, LicenseStatus, LicenseType } from './entities/license.entity';
import { CreateLicenseDto, UpdateLicenseDto } from './dto/license.dto';

@Injectable()
export class LicensesService {
  constructor(
    @InjectRepository(License)
    private readonly repo: Repository<License>,
  ) {}

  // Compute status based on expiry date
  private computeStatus(expiry: Date | string, existing?: LicenseStatus): LicenseStatus {
    if (existing === LicenseStatus.SUSPENDED || existing === LicenseStatus.REVOKED) {
      return existing;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiry);
    exp.setHours(0, 0, 0, 0);
    const daysLeft = Math.floor((exp.getTime() - today.getTime()) / 86400000);
    if (daysLeft < 0) return LicenseStatus.EXPIRED;
    if (daysLeft <= 90) return LicenseStatus.EXPIRING_SOON;
    return LicenseStatus.ACTIVE;
  }

  async create(dto: CreateLicenseDto): Promise<License> {
    const lic = this.repo.create({
      ...dto,
      status: dto.status ?? this.computeStatus(dto.expiryDate),
    } as any) as License | License[];
    return Array.isArray(lic) ? this.repo.save(lic[0]) : this.repo.save(lic);
  }

  async findAll(opts: {
    employeeId?: string;
    status?: LicenseStatus;
    licenseType?: LicenseType;
    countryCode?: string;
    expiringWithinDays?: number;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(200, opts.limit ?? 50);
    const where: any = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.licenseType) where.licenseType = opts.licenseType;
    if (opts.countryCode) where.countryCode = opts.countryCode;
    if (opts.status) where.status = opts.status;

    if (opts.expiringWithinDays !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const future = new Date(today);
      future.setDate(future.getDate() + opts.expiringWithinDays);
      where.expiryDate = Between(today, future) as any;
    }

    const [rows, total] = await this.repo.findAndCount({
      where,
      relations: ['employee'],
      order: { expiryDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Refresh computed status on read (cheap)
    const refreshed = rows.map(r => ({
      ...r,
      status: this.computeStatus(r.expiryDate, r.status),
      daysUntilExpiry: Math.floor(
        (new Date(r.expiryDate).getTime() - Date.now()) / 86400000,
      ),
    }));

    return { rows: refreshed, total, page, limit };
  }

  async findOne(id: string) {
    const lic = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!lic) throw new NotFoundException('License not found');
    return {
      ...lic,
      status: this.computeStatus(lic.expiryDate, lic.status),
      daysUntilExpiry: Math.floor(
        (new Date(lic.expiryDate).getTime() - Date.now()) / 86400000,
      ),
    };
  }

  async findByEmployee(employeeId: string) {
    const rows = await this.repo.find({
      where: { employeeId },
      order: { expiryDate: 'ASC' },
    });
    return rows.map(r => ({
      ...r,
      status: this.computeStatus(r.expiryDate, r.status),
      daysUntilExpiry: Math.floor(
        (new Date(r.expiryDate).getTime() - Date.now()) / 86400000,
      ),
    }));
  }

  async update(id: string, dto: UpdateLicenseDto) {
    const lic = await this.repo.findOne({ where: { id } });
    if (!lic) throw new NotFoundException('License not found');
    Object.assign(lic, dto);
    if (dto.expiryDate || dto.status) {
      lic.status = dto.status ?? this.computeStatus(lic.expiryDate, lic.status);
    }
    return this.repo.save(lic);
  }

  async remove(id: string) {
    const lic = await this.repo.findOne({ where: { id } });
    if (!lic) throw new NotFoundException('License not found');
    await this.repo.softRemove(lic);
    return { ok: true };
  }

  async verify(id: string) {
    const lic = await this.repo.findOne({ where: { id } });
    if (!lic) throw new NotFoundException('License not found');
    lic.lastVerifiedAt = new Date();
    return this.repo.save(lic);
  }

  /**
   * Summary stats for licenses across the org.
   * Used by dashboard and compliance engine.
   */
  async summary() {
    const total = await this.repo.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expired = await this.repo.count({
      where: { expiryDate: LessThan(today) as any },
    });

    const in30 = new Date(today);
    in30.setDate(in30.getDate() + 30);
    const expiring30 = await this.repo.count({
      where: { expiryDate: Between(today, in30) as any },
    });

    const in90 = new Date(today);
    in90.setDate(in90.getDate() + 90);
    const expiring90 = await this.repo.count({
      where: { expiryDate: Between(today, in90) as any },
    });

    return {
      total,
      active: Math.max(0, total - expired),
      expired,
      expiring30,
      expiring90,
    };
  }
}
