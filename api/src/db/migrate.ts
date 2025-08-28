import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client';

async function run() {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations applied successfully');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


