import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupOrder } from './entities/group-order.entity';
import { GroupOrderParticipant } from './entities/group-order-participant.entity';
import { OrderItem } from './entities/order-item.entity';
import { GroupOrdersController } from './group-orders.controller';
import { GroupOrdersService } from './group-orders.service';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupOrder, GroupOrderParticipant, OrderItem]),
    CartModule,
  ],
  controllers: [GroupOrdersController],
  providers: [GroupOrdersService],
  exports: [GroupOrdersService],
})
export class GroupOrdersModule {}
