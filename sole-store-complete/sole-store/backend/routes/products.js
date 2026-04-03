// backend/routes/products.js
const router = require('express').Router();
const { query }  = require('../config/db');
const { protect } = require('../middleware/auth');

const PRODUCT_SELECT = `
  SELECT
    p.id, p.name, p.slug, p.price, p.original_price, p.badge, p.description,
    p.main_image, p.stock, p.rating, p.review_count, p.created_at,
    b.name AS brand, c.name AS category, c.slug AS category_slug,
    COALESCE((SELECT json_agg(url ORDER BY sort_order) FROM product_images WHERE product_id=p.id),'[]'::json) AS images,
    COALESCE((SELECT json_agg(size ORDER BY size)      FROM product_sizes  WHERE product_id=p.id),'[]'::json) AS sizes,
    COALESCE((SELECT json_agg(json_build_object('hex',hex_code,'name',name)) FROM product_colors WHERE product_id=p.id),'[]'::json) AS colors
  FROM products p
  LEFT JOIN brands     b ON b.id=p.brand_id
  LEFT JOIN categories c ON c.id=p.category_id
`;

// GET /api/products?category=&brand=&badge=&minPrice=&maxPrice=&search=&sort=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { category, brand, badge, minPrice, maxPrice, search, sort='newest', page=1, limit=20 } = req.query;
    const conds = ['p.is_active=TRUE'];
    const params = [];
    let i = 1;

    if (category) { conds.push(`c.slug=$${i++}`);                    params.push(category); }
    if (brand)    { conds.push(`LOWER(b.name)=LOWER($${i++})`);      params.push(brand); }
    if (badge)    { conds.push(`p.badge=$${i++}`);                   params.push(badge); }
    if (minPrice) { conds.push(`p.price>=$${i++}`);                  params.push(+minPrice); }
    if (maxPrice) { conds.push(`p.price<=$${i++}`);                  params.push(+maxPrice); }
    if (search)   { conds.push(`(p.name ILIKE $${i} OR b.name ILIKE $${i} OR p.description ILIKE $${i})`); params.push(`%${search}%`); i++; }

    const orderMap = { price_asc:'p.price ASC', price_desc:'p.price DESC', rating:'p.rating DESC', newest:'p.created_at DESC' };
    const order = orderMap[sort] || 'p.created_at DESC';
    const offset = (parseInt(page)-1)*parseInt(limit);
    const where = `WHERE ${conds.join(' AND ')}`;

    const [data, cnt] = await Promise.all([
      query(`${PRODUCT_SELECT} ${where} ORDER BY ${order} LIMIT $${i++} OFFSET $${i}`, [...params, parseInt(limit), offset]),
      query(`SELECT COUNT(*) FROM products p LEFT JOIN brands b ON b.id=p.brand_id LEFT JOIN categories c ON c.id=p.category_id ${where}`, params),
    ]);
    res.json({ success:true, products:data.rows, total:+cnt.rows[0].count, page:+page, pages:Math.ceil(cnt.rows[0].count/limit) });
  } catch (e) { next(e); }
});

// GET /api/products/featured
router.get('/featured', async (req, res, next) => {
  try {
    const { rows } = await query(`${PRODUCT_SELECT} WHERE p.is_active=TRUE ORDER BY p.rating DESC, p.review_count DESC LIMIT 8`);
    res.json({ success:true, products:rows });
  } catch (e) { next(e); }
});

// GET /api/products/:idOrSlug
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const col = /^[0-9a-f-]{36}$/i.test(id) ? 'p.id' : 'p.slug';
    const { rows } = await query(`${PRODUCT_SELECT} WHERE ${col}=$1 AND p.is_active=TRUE`, [id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product:rows[0] });
  } catch (e) { next(e); }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT r.id,r.rating,r.title,r.body,r.created_at,u.name AS user_name,u.avatar_url
       FROM reviews r JOIN users u ON u.id=r.user_id
       WHERE r.product_id=$1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json({ success:true, reviews:rows });
  } catch (e) { next(e); }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, title, body } = req.body;
    if (!rating || rating<1 || rating>5) return res.status(400).json({ success:false, message:'Rating must be 1-5' });
    const { rows } = await query(
      'INSERT INTO reviews (product_id,user_id,rating,title,body) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, req.user.id, rating, title, body]
    );
    res.status(201).json({ success:true, review:rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;
