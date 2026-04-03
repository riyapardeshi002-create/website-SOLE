// backend/routes/auth.js
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query }         = require('../config/db');
const { protect, generateToken } = require('../middleware/auth');

const validate = (req, res) => {
  const e = validationResult(req);
  if (!e.isEmpty()) { res.status(400).json({ success: false, errors: e.array() }); return false; }
  return true;
};

const fmt = (user, token) => ({
  success: true, token,
  user: {
    id: user.id, name: user.name, email: user.email,
    member_tier: user.member_tier, total_spent: user.total_spent,
    avatar_url: user.avatar_url, address: user.address, phone: user.phone,
  },
});

// POST /api/auth/register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { name, email, password } = req.body;

    const exists = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rowCount) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (name,email,password_hash)
       VALUES ($1,$2,$3)
       RETURNING id,name,email,member_tier,total_spent,avatar_url,address,phone`,
      [name, email, hash]
    );
    res.status(201).json(fmt(rows[0], generateToken(rows[0].id)));
  } catch (e) { next(e); }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { email, password } = req.body;
    const { rows } = await query(
      'SELECT id,name,email,password_hash,member_tier,total_spent,avatar_url,address,phone FROM users WHERE email=$1 AND is_active=TRUE',
      [email]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json(fmt(rows[0], generateToken(rows[0].id)));
  } catch (e) { next(e); }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id,name,email,member_tier,total_spent,avatar_url,address,phone,created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (e) { next(e); }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const { rows } = await query(
      `UPDATE users SET
         name    = COALESCE($1, name),
         phone   = COALESCE($2, phone),
         address = COALESCE($3::jsonb, address)
       WHERE id=$4
       RETURNING id,name,email,member_tier,total_spent,avatar_url,address,phone`,
      [name || null, phone || null, address ? JSON.stringify(address) : null, req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (e) { next(e); }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { currentPassword, newPassword } = req.body;
    const { rows } = await query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!(await bcrypt.compare(currentPassword, rows[0].password_hash)))
      return res.status(400).json({ success: false, message: 'Incorrect current password' });

    await query('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(newPassword, 12), req.user.id]);
    res.json({ success: true, message: 'Password updated' });
  } catch (e) { next(e); }
});

module.exports = router;
