import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env['VITE_API_URL']
      ? '*'
      : ['http://localhost:5173', 'http://localhost:4200'],
    credentials: true,
  });

  const uploadsDir = join(process.cwd(), 'uploads', 'wines');
  mkdirSync(uploadsDir, { recursive: true });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.setGlobalPrefix('api');

  const port = process.env['PORT'] || process.env['API_PORT'] || 3000;
  await app.listen(port);
  console.log(`🍷 Wine Order API running on http://localhost:${port}/api`);
}

bootstrap();
