-- حذف الجداول القديمة إن وجدت
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- إنشاء جدول المستخدمين (المديرين والمندوبين)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep')),
  is_active BOOLEAN DEFAULT true,
  admin_permission TEXT CHECK (admin_permission IN ('full', 'orders_only')),
  security_question TEXT,
  security_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول المجموعات
CREATE TABLE product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول المنتجات
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  group_id UUID REFERENCES product_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول العملاء
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  sales_rep_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول الطلبيات
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  sales_rep_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'printed', 'deleted')),
  total_amount NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  text_order TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول عناصر الطلبية
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول الإشعارات
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة المستخدم الافتراضي (المدير)
INSERT INTO users (username, password, full_name, role, is_active, admin_permission)
VALUES ('admin', 'admin', 'المدير العام', 'admin', true, 'full');

-- إضافة مجموعات تجريبية
INSERT INTO product_groups (name) VALUES
  ('مجموعة أ'),
  ('مجموعة ب'),
  ('مجموعة ج'),
  ('مجموعة د');

-- إضافة منتجات تجريبية
INSERT INTO products (name, price, group_id)
SELECT 'منتج ' || i, (i * 10)::NUMERIC, 
  (SELECT id FROM product_groups LIMIT 1)
FROM generate_series(1, 10) i;

-- تفعيل Row Level Security (اختياري للأمان)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول (للسماح بالقراءة والكتابة للجميع مؤقتاً)
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for product_groups" ON product_groups FOR ALL USING (true);
CREATE POLICY "Enable all for products" ON products FOR ALL USING (true);
CREATE POLICY "Enable all for customers" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all for orders" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all for order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Enable all for notifications" ON notifications FOR ALL USING (true);
