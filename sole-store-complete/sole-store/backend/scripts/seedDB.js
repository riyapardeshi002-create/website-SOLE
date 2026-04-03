// backend/scripts/seedDB.js
require('dotenv').config();
const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');

async function seed() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sole_store',
    user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || 'ASDF189251',
  });
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../sql/seed.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Seed data inserted');
  } finally {
    await pool.end();
  }
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
