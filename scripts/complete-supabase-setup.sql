-- حذف الجداول القديمة إن وجدت
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- إنشاء جدول المستخدمين
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep')),
  is_active BOOLEAN DEFAULT true,
  admin_permission TEXT CHECK (admin_permission IN ('full', 'orders_only')),
  security_question TEXT,
  security_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول مجموعات المنتجات
CREATE TABLE product_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المنتجات
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  group_id TEXT REFERENCES product_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول العملاء
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  sales_rep_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الطلبيات
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  sales_rep_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'printed', 'trash')),
  total NUMERIC DEFAULT 0,
  images TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول عناصر الطلبية
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإشعارات
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء المستخدم الافتراضي (المدير)
INSERT INTO users (id, username, password, name, phone, role, is_active, admin_permission)
VALUES ('admin', 'admin', 'admin', 'المدير', '', 'admin', true, 'full')
ON CONFLICT (id) DO NOTHING;

-- إنشاء مجموعات تجريبية
INSERT INTO product_groups (id, name) VALUES
  ('group1', 'مجموعة الأدوية'),
  ('group2', 'مجموعة المكملات'),
  ('group3', 'مجموعة العناية'),
  ('group4', 'مجموعة الطفل')
ON CONFLICT (id) DO NOTHING;

-- إنشاء منتجات تجريبية
INSERT INTO products (id, name, price, group_id) VALUES
  ('prod1', 'باراسيتامول', 15.50, 'group1'),
  ('prod2', 'ايبوبروفين', 22.00, 'group1'),
  ('prod3', 'فيتامين د', 45.00, 'group2'),
  ('prod4', 'أوميجا 3', 120.00, 'group2'),
  ('prod5', 'كريم مرطب', 35.00, 'group3'),
  ('prod6', 'شامبو طبي', 28.50, 'group3'),
  ('prod7', 'حليب أطفال', 85.00, 'group4'),
  ('prod8', 'حفاضات', 95.00, 'group4')
ON CONFLICT (id) DO NOTHING;

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_orders_sales_rep ON orders(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep ON customers(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_products_group ON products(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
