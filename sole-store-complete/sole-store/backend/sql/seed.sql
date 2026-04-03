-- ================================================================
--  SOLE STORE  —  Seed Data
-- ================================================================

-- Brands
INSERT INTO brands (name) VALUES
  ('Nike'),('Adidas'),('Puma'),('New Balance'),('Reebok'),('Salomon'),('Converse'),('Jordan')
ON CONFLICT (name) DO NOTHING;

-- Categories
INSERT INTO categories (name, slug, description) VALUES
  ('Running','running','Performance running shoes'),
  ('Casual', 'casual', 'Everyday lifestyle sneakers'),
  ('Sports', 'sports', 'Multi-sport athletic shoes')
ON CONFLICT (slug) DO NOTHING;

-- Products (8 shoes matching the frontend)
INSERT INTO products (id,name,slug,brand_id,category_id,price,original_price,description,badge,main_image,stock,rating)
SELECT
  uuid_generate_v4(),
  t.name, t.slug,
  (SELECT id FROM brands     WHERE name = t.brand),
  (SELECT id FROM categories WHERE slug = t.cat),
  t.price, t.og, t.description, t.badge::badge_type,
  t.img, t.stock, t.rating
FROM (VALUES
  ('AirEdge Pro X',     'airedge-pro-x',     'Nike',        'running', 189.00,240.00,
   'Engineered for elite runners who demand peak performance. The AirEdge Pro X features our revolutionary cushioning system that absorbs impact and propels you forward with every stride. Lightweight mesh upper keeps you cool, while the carbon fiber plate delivers explosive energy return.',
   'Hot','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',85,4.8),

  ('UrbanDrift Classic','urbandrift-classic', 'Adidas',      'casual',  145.00,145.00,
   'Where street culture meets premium craftsmanship. The UrbanDrift Classic is built for the city adventurer — versatile enough for coffee runs, gallery openings, or late-night sessions.',
   'New','https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',120,4.6),

  ('SpeedForce Elite',  'speedforce-elite',   'Puma',        'sports',  215.00,280.00,
   'Break records, not budgets. The SpeedForce Elite delivers 40% more energy return than standard cushioning with our proprietary foam compound.',
   'Sale','https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80',60,4.9),

  ('CloudWalk Luxe',    'cloudwalk-luxe',     'New Balance', 'casual',  165.00,165.00,
   'All-day comfort meets refined aesthetics. The CloudWalk Luxe wraps your foot in signature cloud foam technology, delivering a walking-on-air sensation.',
   'New','https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',95,4.7),

  ('StrikeFlex TR',     'strikeflex-tr',      'Nike',        'sports',  132.00,175.00,
   'Dominate the court, the track, or the field. The StrikeFlex TR features aggressive outsole tread that provides grip on any surface.',
   'Sale','https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',70,4.5),

  ('RetroJoy 90s',      'retrojoy-90s',       'Reebok',      'casual',  110.00,110.00,
   'Nostalgia reimagined for the present. The RetroJoy 90s brings back the chunky silhouette and bold colorways of the decade that defined sneaker culture.',
   'Hot','https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',150,4.4),

  ('TerraGrip ADV',     'terragrip-adv',      'Salomon',     'running', 195.00,195.00,
   'Conquer trails you never thought possible. The TerraGrip ADV 360° Sensifit system locks your foot in for precise handling on technical terrain.',
   'New','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',45,4.8),

  ('VelvetStep Premier','velvetstep-premier', 'Converse',    'casual',   98.00,120.00,
   'An icon elevated with premium velvet upper, ortholite cushioning, and a subtle platform sole that adds modern height.',
   'Sale','https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',200,4.3)
) AS t(name,slug,brand,cat,price,og,description,badge,img,stock,rating);

-- Product images (3 per product)
INSERT INTO product_images (product_id, url, sort_order) VALUES
  ((SELECT id FROM products WHERE slug='airedge-pro-x'),    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='airedge-pro-x'),    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='airedge-pro-x'),    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',3),
  ((SELECT id FROM products WHERE slug='urbandrift-classic'),'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='urbandrift-classic'),'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='urbandrift-classic'),'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',3),
  ((SELECT id FROM products WHERE slug='speedforce-elite'),  'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='speedforce-elite'),  'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='speedforce-elite'),  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',3),
  ((SELECT id FROM products WHERE slug='cloudwalk-luxe'),    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='cloudwalk-luxe'),    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='cloudwalk-luxe'),    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',3),
  ((SELECT id FROM products WHERE slug='strikeflex-tr'),     'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='strikeflex-tr'),     'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='strikeflex-tr'),     'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',3),
  ((SELECT id FROM products WHERE slug='retrojoy-90s'),      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='retrojoy-90s'),      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='retrojoy-90s'),      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',3),
  ((SELECT id FROM products WHERE slug='terragrip-adv'),     'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='terragrip-adv'),     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='terragrip-adv'),     'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80',3),
  ((SELECT id FROM products WHERE slug='velvetstep-premier'),'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',1),
  ((SELECT id FROM products WHERE slug='velvetstep-premier'),'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',2),
  ((SELECT id FROM products WHERE slug='velvetstep-premier'),'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',3);

-- Sizes (US 6–12 for all products)
INSERT INTO product_sizes (product_id, size, stock)
SELECT p.id, s.sz, 20
FROM products p
CROSS JOIN (VALUES (6.0),(7.0),(8.0),(9.0),(10.0),(11.0),(12.0)) AS s(sz);

-- Colors
INSERT INTO product_colors (product_id, hex_code, name) VALUES
  ((SELECT id FROM products WHERE slug='airedge-pro-x'),    '#FF2D78','Pink'),
  ((SELECT id FROM products WHERE slug='airedge-pro-x'),    '#1a1a2e','Midnight'),
  ((SELECT id FROM products WHERE slug='airedge-pro-x'),    '#C8FF00','Acid'),
  ((SELECT id FROM products WHERE slug='urbandrift-classic'),'#7B2FFF','Violet'),
  ((SELECT id FROM products WHERE slug='urbandrift-classic'),'#F0F0FF','White'),
  ((SELECT id FROM products WHERE slug='urbandrift-classic'),'#080810','Black'),
  ((SELECT id FROM products WHERE slug='speedforce-elite'),  '#00F5FF','Cyan'),
  ((SELECT id FROM products WHERE slug='speedforce-elite'),  '#FF2D78','Pink'),
  ((SELECT id FROM products WHERE slug='speedforce-elite'),  '#1a1a2e','Navy'),
  ((SELECT id FROM products WHERE slug='cloudwalk-luxe'),    '#C8FF00','Acid'),
  ((SELECT id FROM products WHERE slug='cloudwalk-luxe'),    '#808080','Grey'),
  ((SELECT id FROM products WHERE slug='cloudwalk-luxe'),    '#1a1a2e','Navy'),
  ((SELECT id FROM products WHERE slug='strikeflex-tr'),     '#FF8C00','Orange'),
  ((SELECT id FROM products WHERE slug='strikeflex-tr'),     '#1a1a2e','Black'),
  ((SELECT id FROM products WHERE slug='strikeflex-tr'),     '#FF2D78','Pink'),
  ((SELECT id FROM products WHERE slug='retrojoy-90s'),      '#FF2D78','Pink'),
  ((SELECT id FROM products WHERE slug='retrojoy-90s'),      '#ffffff','White'),
  ((SELECT id FROM products WHERE slug='retrojoy-90s'),      '#4169E1','Blue'),
  ((SELECT id FROM products WHERE slug='terragrip-adv'),     '#00FF88','Lime'),
  ((SELECT id FROM products WHERE slug='terragrip-adv'),     '#FF4500','Orange'),
  ((SELECT id FROM products WHERE slug='terragrip-adv'),     '#1a1a2e','Black'),
  ((SELECT id FROM products WHERE slug='velvetstep-premier'),'#7B2FFF','Violet'),
  ((SELECT id FROM products WHERE slug='velvetstep-premier'),'#1a1a2e','Black'),
  ((SELECT id FROM products WHERE slug='velvetstep-premier'),'#F0F0FF','White');
