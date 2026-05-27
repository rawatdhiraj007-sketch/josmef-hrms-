import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../common/enums';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'josmef_hrms',
  entities: [User],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('📦 Database connected');

  const userRepo = dataSource.getRepository(User);

  const existing = await userRepo.findOne({ where: { email: 'admin@josmef.com' } });
  if (existing) {
    console.log('⚠️  Super Admin already exists. Skipping.');
  } else {
    const password = await bcrypt.hash('Admin@2025', 12);
    await userRepo.save({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@josmef.com',
      password,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });
    console.log('✅ Super Admin created: admin@josmef.com / Admin@2025');
  }

  await dataSource.destroy();
  console.log('🏁 Seed complete');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
