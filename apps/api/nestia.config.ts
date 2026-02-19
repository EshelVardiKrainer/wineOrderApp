import { INestiaConfig } from '@nestia/sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app/app.module';

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    return app;
  },
  output: '../../libs/api-sdk/src',
  clone: true,
  primitive: false,
  simulate: false,
};

export default NESTIA_CONFIG;
