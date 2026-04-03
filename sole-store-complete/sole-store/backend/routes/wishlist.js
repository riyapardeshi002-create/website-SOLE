// backend/routes/wishlist.js
const router = require('express').Router();
const { query }  = require('../config/db');
const { protect } = require('../middleware/auth');

// GET /api/wishlist
router.get('/', protect, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT w.id AS wishlist_id, w.created_at AS saved_at,
              p.id, p.name, p.slug, p.price, p.original_price, p.badge, p.main_image, p.rating,
              b.name AS brand, c.name AS category
       FROM wishlist w
       JOIN products p ON p.id=w.product_id
       LEFT JOIN brands b ON b.id=p.brand_id
       LEFT JOIN categories c ON c.id=p.category_id
       WHERE w.user_id=$1 ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json({ success:true, wishlist:rows });
  } catch (e) { next(e); }
});

// POST /api/wishlist
router.post('/', protect, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success:false, message:'productId required' });
    await query('INSERT INTO wishlist (user_id,product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.user.id, productId]);
    res.status(201).json({ success:true, message:'Added to wishlist' });
  } catch (e) { next(e); }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    await query('DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2', [req.user.id, req.params.productId]);
    res.json({ success:true, message:'Removed from wishlist' });
  } catch (e) { next(e); }
});

module.exports = router;
