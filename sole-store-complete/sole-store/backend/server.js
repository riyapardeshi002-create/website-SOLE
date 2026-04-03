// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
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

// ── Categories shortcut ───────────────────────────────────────
const { query } = require('./config/db');
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

app.listen(PORT, () => {
  console.log(`\n🚀  SOLE API  →  http://localhost:${PORT}`);
  console.log(`🗃️   Database  →  ${process.env.DB_NAME || 'sole_store'} @ ${process.env.DB_HOST || 'localhost'}\n`);
});

module.exports = app;
