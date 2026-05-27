import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.APP_ENV === 'production'
      ? ['https://josmef-hrms.vercel.app']
      : ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Health check that bypasses global prefix (required by Render)
  app.getHttpAdapter().get('/healthz', (_req, res) => res.json({ status: 'ok' }));

  const port = process.env.PORT || process.env.APP_PORT || 4000;
  await app.listen(port);
  console.log(`JOSMEF HRMS API running on port ${port}`);
}
bootstrap();
