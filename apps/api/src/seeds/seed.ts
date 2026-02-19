import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '..', '..', '..', '..', '.env') });

import { User } from '../app/users/user.entity';
import { Wine } from '../app/wines/wine.entity';
import { ShippingSite } from '../app/shipping-sites/shipping-site.entity';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'] || 'localhost',
    port: Number(process.env['DB_PORT']) || 5432,
    username: process.env['DB_USER'] || 'wine_user',
    password: process.env['DB_PASS'] || 'wine_pass',
    database: process.env['DB_NAME'] || 'wine_orders',
    entities: [join(__dirname, '..', 'app', '**', '*.entity.{ts,js}')],
    synchronize: true,
  });

  await ds.initialize();
  console.log('🔌 Connected to database');

  const userRepo = ds.getRepository(User);
  const wineRepo = ds.getRepository(Wine);
  const siteRepo = ds.getRepository(ShippingSite);

  // ─── Users ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = userRepo.create({
    name: 'Admin User',
    email: 'admin@wine.local',
    passwordHash,
    role: 'ADMIN',
  });

  const retailUser = userRepo.create({
    name: 'Retail Buyer',
    email: 'retail@wine.local',
    passwordHash,
    role: 'RETAIL',
  });

  const customer = userRepo.create({
    name: 'Regular Customer',
    email: 'customer@wine.local',
    passwordHash,
    role: 'CUSTOMER',
  });

  await userRepo.save([admin, retailUser, customer]);
  console.log('👤 Users seeded');

  // ─── Wines ──────────────────────────────────────────────────────────
  const wines = [
    {
      name: 'Château Margaux 2018',
      description:
        'A complex and elegant Bordeaux with notes of blackcurrant, violet, and cedar.',
      price: 450,
      region: 'Bordeaux',
      vintage: 2018,
      stock: 120,
      imageUrl: null,
    },
    {
      name: 'Opus One 2019',
      description:
        'Napa Valley icon. Rich dark fruit, cocoa, and fine-grained tannins.',
      price: 380,
      region: 'Napa Valley',
      vintage: 2019,
      stock: 80,
      imageUrl: null,
    },
    {
      name: 'Cloudy Bay Sauvignon Blanc 2022',
      description:
        'Crisp and aromatic with passion fruit, citrus, and fresh herbs.',
      price: 28,
      region: 'Marlborough',
      vintage: 2022,
      stock: 500,
      imageUrl: null,
    },
    {
      name: 'Barolo Monfortino 2016',
      description:
        'The king of Italian reds. Tar, roses, and incredible depth.',
      price: 320,
      region: 'Piedmont',
      vintage: 2016,
      stock: 45,
      imageUrl: null,
    },
    {
      name: 'Penfolds Grange 2018',
      description:
        'Australia\'s most iconic Shiraz. Plum, dark chocolate, and spice.',
      price: 650,
      region: 'South Australia',
      vintage: 2018,
      stock: 30,
      imageUrl: null,
    },
    {
      name: 'Sancerre Domaine Vacheron 2021',
      description: 'Mineral-driven Loire Sauvignon Blanc with flint and citrus.',
      price: 42,
      region: 'Loire Valley',
      vintage: 2021,
      stock: 200,
      imageUrl: null,
    },
    {
      name: 'Rioja Reserva Viña Tondonia 2011',
      description:
        'Old-school Rioja. Dried cherry, leather, and tobacco leaf.',
      price: 55,
      region: 'Rioja',
      vintage: 2011,
      stock: 150,
      imageUrl: null,
    },
    {
      name: 'Whispering Angel Rosé 2023',
      description:
        'Provence rosé at its finest. Pale salmon with fresh strawberry and peach.',
      price: 22,
      region: 'Provence',
      vintage: 2023,
      stock: 600,
      imageUrl: null,
    },
    {
      name: 'Gewürztraminer Grand Cru 2020',
      description:
        'Lychee, rose petal, and ginger. Off-dry with beautiful acidity.',
      price: 38,
      region: 'Alsace',
      vintage: 2020,
      stock: 90,
      imageUrl: null,
    },
    {
      name: 'Brunello di Montalcino 2017',
      description:
        'Sangiovese at its purest. Cherry, earth, and dried herbs.',
      price: 75,
      region: 'Tuscany',
      vintage: 2017,
      stock: 110,
      imageUrl: null,
    },
  ];

  await wineRepo.save(wines.map((w) => wineRepo.create(w)));
  console.log('🍷 Wines seeded');

  // ─── Shipping Sites ─────────────────────────────────────────────────
  const sites = [
    {
      name: 'Tel Aviv Central Depot',
      address: '45 Rothschild Blvd',
      city: 'Tel Aviv',
      isActive: true,
    },
    {
      name: 'Jerusalem Wine Hub',
      address: '12 Jaffa Street',
      city: 'Jerusalem',
      isActive: true,
    },
    {
      name: 'Haifa Port Warehouse',
      address: '8 HaAtzmaut Road',
      city: 'Haifa',
      isActive: true,
    },
    {
      name: 'Beer Sheva Distribution',
      address: '20 Rager Blvd',
      city: 'Beer Sheva',
      isActive: true,
    },
    {
      name: 'Herzliya Pituach Pickup',
      address: '3 Maskit Street',
      city: 'Herzliya',
      isActive: false,
    },
  ];

  await siteRepo.save(sites.map((s) => siteRepo.create(s)));
  console.log('📦 Shipping sites seeded');

  await ds.destroy();
  console.log('✅ Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
