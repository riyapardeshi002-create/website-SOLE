// backend/scripts/seedDB.js
require('dotenv').config();
const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');

async function seed() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const useSSL = process.env.DB_SSL === 'true' || hasDatabaseUrl || process.env.NODE_ENV === 'production';

  const poolConfig = hasDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'sole_store',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'ASDF189251',
        ssl: useSSL ? { rejectUnauthorized: false } : false,
      };

  const pool = new Pool(poolConfig);
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../sql/seed.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Seed data inserted');
  } finally {
    await pool.end();
  }
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
