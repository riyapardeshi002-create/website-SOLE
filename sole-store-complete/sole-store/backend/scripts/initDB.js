// backend/scripts/initDB.js
require('dotenv').config();
const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');

async function init() {
  const dbName = process.env.DB_NAME || 'sole_store';

  // Connect to default postgres DB to create our DB
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || 'ASDF189251',
  });
  try {
    const { rowCount } = await adminPool.query('SELECT 1 FROM pg_database WHERE datname=$1', [dbName]);
    if (!rowCount) {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Created database: ${dbName}`);
    } else {
      console.log(`ℹ️  Database already exists: ${dbName}`);
    }
  } finally {
    await adminPool.end();
  }

  // Apply schema
  const appPool = new Pool({
    host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 5432,
    database: dbName,
    user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || 'ASDF189251',
  });
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
    await appPool.query(sql);
    console.log('✅ Schema applied');
  } finally {
    await appPool.end();
  }
}

init().catch(e => { console.error('❌', e.message); process.exit(1); });
