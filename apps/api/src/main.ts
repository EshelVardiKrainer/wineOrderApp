import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env['VITE_API_URL']
      ? '*'
      : ['http://localhost:5173', 'http://localhost:4200'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env['API_PORT'] || 3000;
  await app.listen(port);
  console.log(`🍷 Wine Order API running on http://localhost:${port}/api`);
}

bootstrap();
