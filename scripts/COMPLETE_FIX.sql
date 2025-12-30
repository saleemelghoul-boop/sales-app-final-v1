-- ===================================================================
-- سكريبت الحل الشامل والنهائي لجميع مشاكل Sales Manager
-- ===================================================================
-- هذا السكريبت يحل:
-- 1. مشكلة تسجيل الدخول
-- 2. مشكلة Row Level Security (RLS)
-- 3. إنشاء جميع الجداول بشكل صحيح
-- 4. إضافة المستخدم الافتراضي admin/admin
-- ===================================================================

-- الخطوة 1: حذف جميع الجداول القديمة
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- الخطوة 2: إنشاء جدول المستخدمين
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  admin_permission TEXT CHECK (admin_permission IN ('full', 'orders_only')),
  security_question TEXT,
  security_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- الخطوة 3: إنشاء جدول المجموعات
CREATE TABLE product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- الخطوة 4: إنشاء جدول المنتجات
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  group_id UUID REFERENCES product_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- الخطوة 5: إنشاء جدول العملاء
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  sales_rep_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- الخطوة 6: إنشاء جدول الطلبيات
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  sales_rep_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'printed', 'deleted')),
  notes TEXT,
  images TEXT[],
  text_order TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- الخطوة 7: إنشاء جدول عناصر الطلبيات
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- الخطوة 8: إنشاء جدول الإشعارات
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- الخطوة 9: إيقاف Row Level Security نهائياً
-- ===================================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- الخطوة 10: إنشاء المستخدم الافتراضي admin/admin
-- ===================================================================
INSERT INTO users (username, password, full_name, role, is_active, admin_permission)
VALUES ('admin', 'admin', 'المدير العام', 'admin', true, 'full');

-- ===================================================================
-- الخطوة 11: إضافة بيانات تجريبية
-- ===================================================================

-- إضافة مجموعات تجريبية
INSERT INTO product_groups (name) VALUES 
('أدوية'),
('مستحضرات تجميل'),
('معدات طبية'),
('فيتامينات');

-- إضافة منتجات تجريبية
INSERT INTO products (name, price, group_id) 
SELECT 'باراسيتامول', 5000, id FROM product_groups WHERE name = 'أدوية' LIMIT 1;

INSERT INTO products (name, price, group_id) 
SELECT 'كريم مرطب', 15000, id FROM product_groups WHERE name = 'مستحضرات تجميل' LIMIT 1;

-- ===================================================================
-- تم الانتهاء! يمكنك الآن تسجيل الدخول بـ admin/admin
-- ===================================================================
