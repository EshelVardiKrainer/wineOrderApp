import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wine } from './wine.entity';
import { WinesService } from './wines.service';
import { WinesController } from './wines.controller';
import { WineImageController } from './wine-image.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wine])],
  controllers: [WinesController, WineImageController],
  providers: [WinesService],
  exports: [WinesService],
})
export class WinesModule {}
