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

  const userData = [
    {
      name: 'Admin User',
      email: 'admin@wine.local',
      passwordHash,
      role: 'ADMIN',
    },
    {
      name: 'Retail Buyer',
      email: 'retail@wine.local',
      passwordHash,
      role: 'RETAIL',
    },
    {
      name: 'Regular Customer',
      email: 'customer@wine.local',
      passwordHash,
      role: 'CUSTOMER',
    },
  ];

  for (const u of userData) {
    const exists = await userRepo.findOneBy({ email: u.email });
    if (!exists) {
      await userRepo.save(userRepo.create(u as any));
    }
  }
  console.log('👤 Users checked/seeded');

  // ─── Wines ──────────────────────────────────────────────────────────
  const winesData = [
    // אדום 🌹
    {
      name: 'אמפלוס פוס של זכריאס (אדום, יוון)',
      description: 'אדום ימתיכוני לשלוקים גדולים שאפשר לשתות צונן. 70% אגיורגיטיקו ו-30% קברנה סובניון. יוון (נמאה).',
      price: 45,
      region: 'Nemea, Greece',
      vintage: 2023,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/%D7%96%D7%9B%D7%A8%D7%99%D7%90%D7%A1-%D7%90%D7%9E%D7%A4%D7%9C%D7%95%D7%A1-%D7%90%D7%93%D7%95%D7%9D-scaled.jpg',
    },
    {
      name: 'רפושק של סנתומאס (אדום, סלובניה)',
      description: 'רפושק (Refosk) של סנתומאס, סלובניה.',
      price: 55,
      region: 'Slovenia',
      vintage: 2021,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/%D7%A1%D7%A0%D7%AA%D7%95%D7%9E%D7%90%D7%A1-%D7%A8%D7%A4%D7%95%D7%A9%D7%A7-scaled.jpg',
    },
    {
      name: 'פינו נואר של סטובי (אדום, מקדוניה)',
      description: 'פינו נואר של סטובי, מקדוניה. יין קליל וארומטי.',
      price: 45,
      region: 'Macedonia',
      vintage: 2022,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/Stobi_Pinot_Noir_Red-scaled.jpg',
    },
    // רוזה 🦩
    {
      name: 'אנה של גונץ (רוזה, סלובניה)',
      description: 'אנה של גונץ (Gonc Anna), סלובניה. רוזה מרענן.',
      price: 54,
      region: 'Slovenia',
      vintage: 2022,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/GONC_Anna_Rose-scaled.jpg',
    },
    {
      name: 'זכריאס רוזה (רוזה, יוון)',
      description: 'זכריאס אגיורגיטיקו רוזה, יוון.',
      price: 55,
      region: 'Greece',
      vintage: 2023,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/%D7%96%D7%9B%D7%A8%D7%99%D7%90%D7%A1-%D7%A8%D7%95%D7%96%D7%94-scaled.jpg',
    },
    // לבן ⚪️
    {
      name: 'גונץ הקטן (לבן, סלובניה)',
      description: 'The Little One by Gonc, סלובניה.',
      price: 55,
      region: 'Slovenia',
      vintage: 2022,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/GONC_Little_One-scaled.jpg',
    },
    {
      name: 'גרייפ אבדקשן לבן (לבן, סלובניה)',
      description: 'Grape Abduction White, סלובניה. מורכב מחמישה זנים מקומיים.',
      price: 60,
      region: 'Slovenia',
      vintage: 2023,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/Grape_Abduction_White-scaled.jpg',
    },
    {
      name: 'סטירייה הילס מוסקט (לבן חצי מתוק, סלובניה)',
      description: 'Kobal Styria Hills Muscat, סלובניה. חצי מתוק, ארומטי ומרענן.',
      price: 50,
      region: 'Slovenia',
      vintage: 2022,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/%D7%A7%D7%95%D7%91%D7%90%D7%9C-%D7%9E%D7%95%D7%A1%D7%A7%D7%98-scaled.jpg',
    },
    {
      name: 'מוסקופילרו של זכריאס (לבן, יוון)',
      description: 'Zacharias Moschofilero, יוון. יין לבן ארומטי מאוד עם חמיצות נעימה.',
      price: 62,
      region: 'Greece',
      vintage: 2023,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/%D7%96%D7%9B%D7%A8%D7%99%D7%90%D7%A1-%D7%9E%D7%95%D7%A1%D7%A7%D7%95%D7%A4%D7%99%D7%9C%D7%A8%D7%95-scaled.jpg',
    },
    {
      name: 'סטובי סמדרבקה (לבן, מקדוניה)',
      description: 'Stobi Smederevka, מקדוניה. יין קליל ופירותי.',
      price: 45,
      region: 'Macedonia',
      vintage: 2023,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/Stobi_Smederevka-scaled.jpg',
    },
    {
      name: 'רבולה של שצ\'ורק (לבן, סלובניה)',
      description: 'Scurek Rebula, סלובניה. יין רענן עם מינרליות בולטת.',
      price: 75,
      region: 'Slovenia',
      vintage: 2022,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/%D7%A9%D7%A6%D7%95%D7%A8%D7%A7-%D7%A8%D7%91%D7%95%D7%9C%D7%94-scaled.jpg',
    },
    // כתום 🐅
    {
      name: 'גרייפ אבדקשן כתום (כתום, סלובניה)',
      description: 'Grape Abduction Orange, סלובניה. יין כתום עם ארומות של קליפות תפוז ותבלינים.',
      price: 60,
      region: 'Slovenia',
      vintage: 2022,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/Grape_Abduction_Orange-scaled.jpg',
    },
    {
      name: 'שטקר/שצ\'ורק מלבזיה (כתום, סלובניה)',
      description: 'Scurek Malvazija, סלובניה. יין כתום עשיר ומורכב.',
      price: 100,
      region: 'Slovenia',
      vintage: 2022,
      stock: 100,
      imageUrl: 'https://www.saroimports.com/wp-content/uploads/%D7%A9%D7%A6%D7%95%D7%A8%D7%A7-%D7%9E%D7%9C%D7%91%D7%96%D7%99%D7%94-scaled.jpg',
    },
  ];

  for (const w of winesData) {
    const exists = await wineRepo.findOneBy({ name: w.name });
    if (!exists) {
      await wineRepo.save(wineRepo.create(w as any));
    }
  }
  console.log('🍷 Wines checked/seeded');

  // ─── Shipping Sites ─────────────────────────────────────────────────
  const sitesData = [
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

  for (const s of sitesData) {
    const exists = await siteRepo.findOneBy({ name: s.name });
    if (!exists) {
      await siteRepo.save(siteRepo.create(s));
    }
  }
  console.log('📦 Shipping sites checked/seeded');

  await ds.destroy();
  console.log('✅ Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
