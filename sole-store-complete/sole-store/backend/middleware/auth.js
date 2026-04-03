// backend/middleware/auth.js
const jwt   = require('jsonwebtoken');
const { query } = require('../config/db');

const SECRET = process.env.JWT_SECRET || 'sole_dev_secret_32chars_minimum!!';

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(header.split(' ')[1], SECRET);
    const { rows } = await query(
      'SELECT id,name,email,member_tier,total_spent,avatar_url FROM users WHERE id=$1 AND is_active=TRUE',
      [decoded.id]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'User not found' });

    req.user = rows[0];
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ success: false, message: msg });
  }
};

const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], SECRET);
      const { rows } = await query('SELECT id,name,email FROM users WHERE id=$1 AND is_active=TRUE', [decoded.id]);
      if (rows.length) req.user = rows[0];
    }
  } catch (_) {}
  next();
};

const generateToken = (id) =>
  jwt.sign({ id }, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

module.exports = { protect, optionalAuth, generateToken };
