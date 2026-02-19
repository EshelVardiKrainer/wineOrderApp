import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingSite } from './shipping-site.entity';
import { ShippingSitesService } from './shipping-sites.service';
import { ShippingSitesController } from './shipping-sites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingSite])],
  controllers: [ShippingSitesController],
  providers: [ShippingSitesService],
  exports: [ShippingSitesService],
})
export class ShippingSitesModule {}
