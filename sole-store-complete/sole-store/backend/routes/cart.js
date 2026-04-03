// backend/routes/cart.js
const router = require('express').Router();
const { query } = require('../config/db');
const { protect } = require('../middleware/auth');

async function getOrCreateCart(userId) {
  let { rows } = await query('SELECT id FROM carts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1', [userId]);
  if (!rows.length) {
    const r = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
    return r.rows[0].id;
  }
  return rows[0].id;
}

async function fetchCart(cartId) {
  const { rows } = await query(`
    SELECT ci.id, ci.qty, ci.size, ci.color_hex, ci.unit_price,
           p.id AS product_id, p.name, p.main_image, p.stock, b.name AS brand
    FROM cart_items ci
    JOIN products p ON p.id=ci.product_id
    LEFT JOIN brands b ON b.id=p.brand_id
    WHERE ci.cart_id=$1 ORDER BY ci.ctid`, [cartId]);
  return rows;
}

// GET /api/cart
router.get('/', protect, async (req, res, next) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);
    const items  = await fetchCart(cartId);
    const total  = items.reduce((s,i) => s + parseFloat(i.unit_price)*i.qty, 0);
    res.json({ success:true, cartId, items, total:+total.toFixed(2) });
  } catch (e) { next(e); }
});

// POST /api/cart/items
router.post('/items', protect, async (req, res, next) => {
  try {
    const { productId, qty=1, size=null, colorHex=null } = req.body;
    if (!productId) return res.status(400).json({ success:false, message:'productId required' });

    const { rows:p } = await query('SELECT price,stock FROM products WHERE id=$1 AND is_active=TRUE', [productId]);
    if (!p.length)    return res.status(404).json({ success:false, message:'Product not found' });
    if (p[0].stock < qty) return res.status(400).json({ success:false, message:'Not enough stock' });

    const cartId = await getOrCreateCart(req.user.id);
    await query(
      `INSERT INTO cart_items (cart_id,product_id,qty,size,color_hex,unit_price)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (cart_id,product_id,size,color_hex)
       DO UPDATE SET qty=cart_items.qty+EXCLUDED.qty`,
      [cartId, productId, qty, size, colorHex, p[0].price]
    );
    const items = await fetchCart(cartId);
    const total = items.reduce((s,i) => s + parseFloat(i.unit_price)*i.qty, 0);
    res.json({ success:true, items, total:+total.toFixed(2) });
  } catch (e) { next(e); }
});

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', protect, async (req, res, next) => {
  try {
    const { qty } = req.body;
    if (!qty || qty<1) return res.status(400).json({ success:false, message:'qty must be ≥1' });
    const cartId = await getOrCreateCart(req.user.id);
    await query('UPDATE cart_items SET qty=$1 WHERE id=$2 AND cart_id=$3', [qty, req.params.itemId, cartId]);
    const items = await fetchCart(cartId);
    const total = items.reduce((s,i) => s + parseFloat(i.unit_price)*i.qty, 0);
    res.json({ success:true, items, total:+total.toFixed(2) });
  } catch (e) { next(e); }
});

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', protect, async (req, res, next) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);
    await query('DELETE FROM cart_items WHERE id=$1 AND cart_id=$2', [req.params.itemId, cartId]);
    const items = await fetchCart(cartId);
    const total = items.reduce((s,i) => s + parseFloat(i.unit_price)*i.qty, 0);
    res.json({ success:true, items, total:+total.toFixed(2) });
  } catch (e) { next(e); }
});

// DELETE /api/cart  (clear all)
router.delete('/', protect, async (req, res, next) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);
    await query('DELETE FROM cart_items WHERE cart_id=$1', [cartId]);
    res.json({ success:true, items:[], total:0 });
  } catch (e) { next(e); }
});

module.exports = router;
