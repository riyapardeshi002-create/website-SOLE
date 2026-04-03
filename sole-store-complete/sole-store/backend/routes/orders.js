// backend/routes/orders.js
const router = require('express').Router();
const { query, getClient } = require('../config/db');
const { protect }          = require('../middleware/auth');
const { v4: uuidv4 }       = require('uuid');

// POST /api/orders  — creates order from cart (transaction)
router.post('/', protect, async (req, res, next) => {
  const client = await getClient();
  try {
    const { shippingAddress, paymentMethod='card', notes } = req.body;
    if (!shippingAddress) return res.status(400).json({ success:false, message:'shippingAddress required' });

    await client.query('BEGIN');

    // Get cart
    const { rows:carts } = await client.query(
      'SELECT id FROM carts WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1', [req.user.id]
    );
    if (!carts.length) { await client.query('ROLLBACK'); return res.status(400).json({ success:false, message:'No cart found' }); }

    // Get cart items
    const { rows:items } = await client.query(`
      SELECT ci.id, ci.qty, ci.size, ci.color_hex, ci.unit_price,
             p.id AS product_id, p.name, p.main_image, p.stock, b.name AS brand
      FROM cart_items ci
      JOIN products p ON p.id=ci.product_id
      LEFT JOIN brands b ON b.id=p.brand_id
      WHERE ci.cart_id=$1`, [carts[0].id]
    );
    if (!items.length) { await client.query('ROLLBACK'); return res.status(400).json({ success:false, message:'Cart is empty' }); }

    // Validate stock
    for (const item of items) {
      if (item.stock < item.qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success:false, message:`Not enough stock for ${item.name}` });
      }
    }

    const subtotal     = items.reduce((s,i) => s + parseFloat(i.unit_price)*i.qty, 0);
    const shippingCost = subtotal >= 150 ? 0 : 12;
    const total        = subtotal + shippingCost;
    const paymentId    = `PAY-${uuidv4().toUpperCase().slice(0,12)}`;

    // Create order
    const { rows:[order] } = await client.query(
      `INSERT INTO orders (user_id,subtotal,shipping_cost,total,shipping_address,payment_method,payment_id,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, subtotal.toFixed(2), shippingCost.toFixed(2), total.toFixed(2),
       JSON.stringify(shippingAddress), paymentMethod, paymentId, notes || null]
    );

    // Insert order items + decrement stock
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id,product_id,name,brand,image,size,color_hex,qty,unit_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [order.id, item.product_id, item.name, item.brand, item.main_image,
         item.size, item.color_hex, item.qty, item.unit_price]
      );
      await client.query('UPDATE products SET stock=stock-$1 WHERE id=$2', [item.qty, item.product_id]);
    }

    // Update user total_spent (triggers member tier)
    await client.query('UPDATE users SET total_spent=total_spent+$1 WHERE id=$2', [total.toFixed(2), req.user.id]);

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE cart_id=$1', [carts[0].id]);

    await client.query('COMMIT');

    // Return full order with items
    const { rows:[full] } = await query(
      `SELECT o.*,
         COALESCE((SELECT json_agg(row_to_json(oi)) FROM order_items oi WHERE oi.order_id=o.id),'[]'::json) AS items
       FROM orders o WHERE o.id=$1`, [order.id]
    );
    res.status(201).json({ success:true, order:full });
  } catch (e) {
    await client.query('ROLLBACK');
    next(e);
  } finally {
    client.release();
  }
});

// GET /api/orders
router.get('/', protect, async (req, res, next) => {
  try {
    const { page=1, limit=10 } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const { rows } = await query(
      `SELECT o.id,o.status,o.subtotal,o.total,o.shipping_cost,o.payment_id,o.created_at,o.shipping_address,
              COALESCE((SELECT json_agg(json_build_object(
                'id',oi.id,'name',oi.name,'brand',oi.brand,'image',oi.image,
                'qty',oi.qty,'unit_price',oi.unit_price,'size',oi.size
              )) FROM order_items oi WHERE oi.order_id=o.id),'[]'::json) AS items
       FROM orders o WHERE o.user_id=$1 ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );
    const { rows:[cnt] } = await query('SELECT COUNT(*) FROM orders WHERE user_id=$1', [req.user.id]);
    res.json({ success:true, orders:rows, total:+cnt.count, page:+page });
  } catch (e) { next(e); }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT o.*,
         COALESCE((SELECT json_agg(row_to_json(oi)) FROM order_items oi WHERE oi.order_id=o.id),'[]'::json) AS items
       FROM orders o WHERE o.id=$1 AND o.user_id=$2`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success:false, message:'Order not found' });
    res.json({ success:true, order:rows[0] });
  } catch (e) { next(e); }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE orders SET status='cancelled' WHERE id=$1 AND user_id=$2 AND status IN ('pending','processing') RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(400).json({ success:false, message:'Order cannot be cancelled' });
    res.json({ success:true, order:rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;
