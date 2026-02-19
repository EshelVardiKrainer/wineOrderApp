import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '..', '..', '.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: Number(process.env['DB_PORT']) || 5432,
  username: process.env['DB_USER'] || 'wine_user',
  password: process.env['DB_PASS'] || 'wine_pass',
  database: process.env['DB_NAME'] || 'wine_orders',
  entities: [join(__dirname, 'app', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
