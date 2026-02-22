import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '..', '..', '..', '..', '.env') });

import { User } from '../app/users/user.entity';
import { Wine } from '../app/wines/wine.entity';
import { ShippingSite } from '../app/shipping-sites/shipping-site.entity';

async function showStats() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'] || 'localhost',
    port: Number(process.env['DB_PORT']) || 5432,
    username: process.env['DB_USER'] || 'wine_user',
    password: process.env['DB_PASS'] || 'wine_pass',
    database: process.env['DB_NAME'] || 'wine_orders',
    entities: [join(__dirname, '..', 'app', '**', '*.entity.{ts,js}')],
  });

  await ds.initialize();
  console.log('📊 --- PROJECT STATS ---');

  const userRepo = ds.getRepository(User);
  const wineRepo = ds.getRepository(Wine);
  const siteRepo = ds.getRepository(ShippingSite);

  const [totalUsers, adminCount, retailCount, customerCount] = await Promise.all([
    userRepo.count(),
    userRepo.countBy({ role: 'ADMIN' as any }),
    userRepo.countBy({ role: 'RETAIL' as any }),
    userRepo.countBy({ role: 'CUSTOMER' as any }),
  ]);

  const [totalWines, totalSites, activeSites] = await Promise.all([
    wineRepo.count(),
    siteRepo.count(),
    siteRepo.countBy({ isActive: true }),
  ]);

  console.log(`👤 Users: ${totalUsers} total (Admins: ${adminCount}, Retailers: ${retailCount}, Customers: ${customerCount})`);
  console.log(`🍷 Wines: ${totalWines} available`);
  console.log(`📦 Shipping Sites: ${totalSites} total (${activeSites} active)`);
  console.log('-------------------------');

  await ds.destroy();
}

showStats().catch((err) => {
  console.error('Stats check failed:', err);
  process.exit(1);
});
