import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WineReview } from './wine-review.entity';
import { Wine } from '../wines/wine.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WineReview, Wine])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
