// backend/scripts/initDB.js
require('dotenv').config();
const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');

async function init() {
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

  const appPool = new Pool(poolConfig);
  try {
    console.log('Applying schema to database...');
    const sql = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
    await appPool.query(sql);
    console.log('✅ Schema applied successfully');
  } finally {
    await appPool.end();
  }
}

init().catch(e => { console.error('❌', e.message); process.exit(1); });
