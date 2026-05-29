import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApplicantsModule } from './modules/applicants/applicants.module';
import { TraineesModule } from './modules/trainees/trainees.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ExitClearanceModule } from './modules/exit-clearance/exit-clearance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';
import { FormerEmployeesModule } from './modules/former-employees/former-employees.module';
import { LoansModule } from './modules/loans/loans.module';
import { DisciplinaryModule } from './modules/disciplinary/disciplinary.module';
import { NteModule } from './modules/nte/nte.module';
import { IncidentReportsModule } from './modules/incident-reports/incident-reports.module';
import { WorkCertificatesModule } from './modules/work-certificates/work-certificates.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AuditModule } from './modules/audit/audit.module';
import { LeaveModule } from './modules/leave/leave.module';
import { PortalModule } from './modules/portal/portal.module';
import { GovReportsModule } from './modules/gov-reports/gov-reports.module';
import { TrainingModule } from './modules/training/training.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { NumberingModule } from './common/modules/numbering.module';
import { NotificationModule } from './common/modules/notification.module';
import { User } from './modules/users/entities/user.entity';
import { LeaveType } from './modules/leave/entities/leave-type.entity';
import { Employee } from './modules/employees/entities/employee.entity';
import { SeedService } from './seeds/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = process.env.DATABASE_URL;
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
            logging: false,
            // Render free tier: limit connections; main.ts retry-loop handles reconnects
            extra: { max: 2, min: 0, idleTimeoutMillis: 10000 },
            retryAttempts: 15,   // 15 × 3 s = 45 s per bootstrap attempt
            retryDelay: 3000,
          };
        }
        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('app.env') === 'development',
          logging: configService.get('app.env') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, LeaveType, Employee]),
    // Core global modules
    NumberingModule,
    NotificationModule,
    AuditModule,
    // Feature modules
    AuthModule,
    UsersModule,
    ApplicantsModule,
    TraineesModule,
    EmployeesModule,
    FormerEmployeesModule,
    DocumentsModule,
    AttendanceModule,
    PayrollModule,
    ExitClearanceModule,
    DashboardModule,
    AiModule,
    // 201 File modules
    LoansModule,
    DisciplinaryModule,
    NteModule,
    IncidentReportsModule,
    WorkCertificatesModule,
    ComplianceModule,
    LeaveModule,
    PortalModule,
    GovReportsModule,
    TrainingModule,
    AnalyticsModule,
    LicensesModule,
    ShiftsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
