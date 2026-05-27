import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '4000', 10),
  env: process.env.APP_ENV || 'development',
}));
