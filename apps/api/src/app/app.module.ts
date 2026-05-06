import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WinesModule } from './wines/wines.module';
import { ShippingSitesModule } from './shipping-sites/shipping-sites.module';
import { CartModule } from './cart/cart.module';
import { GroupOrdersModule } from './group-orders/group-orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'wine_user'),
        password: config.get<string>('DB_PASS', 'wine_pass'),
        database: config.get<string>('DB_NAME', 'wine_orders'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    WinesModule,
    ShippingSitesModule,
    CartModule,
    GroupOrdersModule,
    NotificationsModule,
    WishlistModule,
    ReviewsModule,
  ],
})
export class AppModule {}
