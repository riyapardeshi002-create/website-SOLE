// backend/server.js
require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const express = require('express');
const cors    = require('cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { query } = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods:     ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Health ────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status:'ok', time: new Date().toISOString() })
);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/wishlist', require('./routes/wishlist'));

// ── Database Setup / Migration Endpoint ───────────────────────
app.post('/api/admin/init-db', async (_req, res) => {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'sql/schema.sql'), 'utf8');
    await query(schemaSql);
    const seedSql = fs.readFileSync(path.join(__dirname, 'sql/seed.sql'), 'utf8');
    await query(seedSql);
    res.json({ success: true, message: 'Database initialized and seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Categories shortcut ───────────────────────────────────────
app.get('/api/categories', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM categories ORDER BY name');
    res.json({ success:true, categories:rows });
  } catch (e) { next(e); }
});

// ── Dashboard stats ───────────────────────────────────────────
const { protect } = require('./middleware/auth');
app.get('/api/dashboard/stats', protect, async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [o, w, u] = await Promise.all([
      query(`SELECT COUNT(*) AS total,
               COALESCE(SUM(total),0) AS spent,
               COUNT(*) FILTER (WHERE status='delivered') AS delivered
             FROM orders WHERE user_id=$1`, [uid]),
      query('SELECT COUNT(*) AS total FROM wishlist WHERE user_id=$1', [uid]),
      query('SELECT member_tier, total_spent, created_at FROM users WHERE id=$1', [uid]),
    ]);
    res.json({ success:true, stats:{
      totalOrders:   +o.rows[0].total,
      totalSpent:    +parseFloat(o.rows[0].spent).toFixed(2),
      delivered:     +o.rows[0].delivered,
      wishlistCount: +w.rows[0].total,
      memberTier:    u.rows[0].member_tier,
      memberSince:   u.rows[0].created_at,
    }});
  } catch (e) { next(e); }
});

// ── Error handlers ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Auto-initialize DB if tables missing ──────────────────────
async function initDatabaseIfNeeded() {
  try {
    const { rows } = await query("SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='products'");
    if (!rows.length) {
      console.log('🔄 Initializing database: applying schema and seed data...');
      const schemaSql = fs.readFileSync(path.join(__dirname, 'sql/schema.sql'), 'utf8');
      await query(schemaSql);
      const seedSql = fs.readFileSync(path.join(__dirname, 'sql/seed.sql'), 'utf8');
      await query(seedSql);
      console.log('✅ Database initialized and seeded successfully!');
    } else {
      console.log('✅ Database tables already initialized.');
    }
  } catch (err) {
    console.error('⚠️ Database auto-migration warning:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`\n🚀  SOLE API  →  http://localhost:${PORT}`);
  console.log(`🗃️   Database  →  ${process.env.DB_NAME || 'sole_store'} @ ${process.env.DB_HOST || 'localhost'}\n`);
  await initDatabaseIfNeeded();
});

module.exports = app;
