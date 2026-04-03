-- ================================================================
--  SOLE STORE  —  PostgreSQL Schema
--  Setup: psql -U postgres -d sole_store -f schema.sql
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop everything (clean reset)
DROP TABLE IF EXISTS order_items   CASCADE;
DROP TABLE IF EXISTS orders        CASCADE;
DROP TABLE IF EXISTS cart_items    CASCADE;
DROP TABLE IF EXISTS carts         CASCADE;
DROP TABLE IF EXISTS wishlist      CASCADE;
DROP TABLE IF EXISTS reviews       CASCADE;
DROP TABLE IF EXISTS product_colors CASCADE;
DROP TABLE IF EXISTS product_sizes  CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products      CASCADE;
DROP TABLE IF EXISTS categories    CASCADE;
DROP TABLE IF EXISTS brands        CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS badge_type   CASCADE;

-- ── Enums ─────────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM
  ('pending','processing','shipped','delivered','cancelled','refunded');

CREATE TYPE badge_type AS ENUM ('New','Hot','Sale');

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  avatar_url    TEXT,
  phone         VARCHAR(20),
  address       JSONB         DEFAULT '{}',
  member_tier   VARCHAR(20)   DEFAULT 'Bronze'
                              CHECK (member_tier IN ('Bronze','Silver','Gold','Platinum')),
  total_spent   DECIMAL(10,2) DEFAULT 0.00,
  is_active     BOOLEAN       DEFAULT TRUE,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- ── Refresh tokens ────────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Brands ────────────────────────────────────────────────────
CREATE TABLE brands (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  logo_url   TEXT,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Categories ────────────────────────────────────────────────
CREATE TABLE categories (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Products ──────────────────────────────────────────────────
CREATE TABLE products (
  id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(200)  NOT NULL,
  slug           VARCHAR(250)  NOT NULL UNIQUE,
  brand_id       INTEGER       REFERENCES brands(id),
  category_id    INTEGER       REFERENCES categories(id),
  price          DECIMAL(10,2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10,2) CHECK (original_price >= price),
  description    TEXT,
  badge          badge_type,
  main_image     TEXT          NOT NULL,
  stock          INTEGER       DEFAULT 100 CHECK (stock >= 0),
  is_active      BOOLEAN       DEFAULT TRUE,
  rating         DECIMAL(3,2)  DEFAULT 4.50 CHECK (rating BETWEEN 0 AND 5),
  review_count   INTEGER       DEFAULT 0,
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   DEFAULT NOW()
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand    ON products(brand_id);
CREATE INDEX idx_products_price    ON products(price);
CREATE INDEX idx_products_active   ON products(is_active);

-- ── Product Images ────────────────────────────────────────────
CREATE TABLE product_images (
  id         SERIAL  PRIMARY KEY,
  product_id UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT    NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- ── Product Sizes ─────────────────────────────────────────────
CREATE TABLE product_sizes (
  id         SERIAL       PRIMARY KEY,
  product_id UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       DECIMAL(4,1) NOT NULL,
  stock      INTEGER      DEFAULT 20
);
CREATE UNIQUE INDEX idx_prod_size ON product_sizes(product_id, size);

-- ── Product Colors ────────────────────────────────────────────
CREATE TABLE product_colors (
  id         SERIAL      PRIMARY KEY,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  hex_code   VARCHAR(7)  NOT NULL,
  name       VARCHAR(50)
);

-- ── Reviews ───────────────────────────────────────────────────
CREATE TABLE reviews (
  id         UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID     NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title      VARCHAR(200),
  body       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

-- ── Wishlist ──────────────────────────────────────────────────
CREATE TABLE wishlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ── Carts ─────────────────────────────────────────────────────
CREATE TABLE carts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
  id         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id    UUID          NOT NULL REFERENCES carts(id)    ON DELETE CASCADE,
  product_id UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty        INTEGER       NOT NULL DEFAULT 1 CHECK (qty > 0),
  size       DECIMAL(4,1),
  color_hex  VARCHAR(7),
  unit_price DECIMAL(10,2) NOT NULL,
  UNIQUE (cart_id, product_id, size, color_hex)
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE orders (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         REFERENCES users(id) ON DELETE SET NULL,
  status           order_status DEFAULT 'pending',
  subtotal         DECIMAL(10,2) NOT NULL,
  shipping_cost    DECIMAL(10,2) DEFAULT 0.00,
  discount         DECIMAL(10,2) DEFAULT 0.00,
  total            DECIMAL(10,2) NOT NULL,
  shipping_address JSONB         NOT NULL,
  payment_method   VARCHAR(50)   DEFAULT 'card',
  payment_id       VARCHAR(255),
  notes            TEXT,
  created_at       TIMESTAMPTZ   DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   DEFAULT NOW()
);
CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date   ON orders(created_at DESC);

CREATE TABLE order_items (
  id         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID          REFERENCES products(id) ON DELETE SET NULL,
  name       VARCHAR(200)  NOT NULL,
  brand      VARCHAR(100),
  image      TEXT,
  size       DECIMAL(4,1),
  color_hex  VARCHAR(7),
  qty        INTEGER       NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total      DECIMAL(10,2) GENERATED ALWAYS AS (qty * unit_price) STORED
);

-- ── Trigger: updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ts_users    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER ts_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER ts_orders   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER ts_carts    BEFORE UPDATE ON carts    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ── Trigger: auto member tier ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_member_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.member_tier = CASE
    WHEN NEW.total_spent >= 2000 THEN 'Platinum'
    WHEN NEW.total_spent >= 1000 THEN 'Gold'
    WHEN NEW.total_spent >= 500  THEN 'Silver'
    ELSE 'Bronze'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_tier
BEFORE UPDATE OF total_spent ON users
FOR EACH ROW EXECUTE FUNCTION update_member_tier();

-- ── Trigger: product rating after review ─────────────────────
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating       = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ── View: v_products (full product detail) ────────────────────
CREATE OR REPLACE VIEW v_products AS
SELECT
  p.id, p.name, p.slug, p.price, p.original_price, p.description,
  p.badge, p.main_image, p.stock, p.rating, p.review_count, p.is_active, p.created_at,
  b.name  AS brand,
  c.name  AS category,
  c.slug  AS category_slug,
  COALESCE((SELECT json_agg(url ORDER BY sort_order) FROM product_images WHERE product_id = p.id),'[]'::json) AS images,
  COALESCE((SELECT json_agg(size ORDER BY size)      FROM product_sizes  WHERE product_id = p.id),'[]'::json) AS sizes,
  COALESCE((SELECT json_agg(json_build_object('hex',hex_code,'name',name)) FROM product_colors WHERE product_id = p.id),'[]'::json) AS colors
FROM products p
LEFT JOIN brands     b ON b.id = p.brand_id
LEFT JOIN categories c ON c.id = p.category_id;

-- ── View: v_orders (order + items + user) ────────────────────
CREATE OR REPLACE VIEW v_orders AS
SELECT
  o.*,
  u.name  AS user_name,
  u.email AS user_email,
  COALESCE((SELECT json_agg(row_to_json(oi)) FROM order_items oi WHERE oi.order_id = o.id),'[]'::json) AS items
FROM orders o
LEFT JOIN users u ON u.id = o.user_id;
