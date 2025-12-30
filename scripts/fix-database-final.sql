-- حذف جميع الجداول القديمة
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- إنشاء جدول المستخدمين
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
  price NUMERIC NOT NULL,
  group_id UUID REFERENCES product_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول العملاء
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  sales_rep_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول الطلبيات
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

-- إنشاء جدول عناصر الطلبيات
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- إنشاء جدول الإشعارات
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إيقاف RLS تماماً
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- حذف أي سياسات موجودة
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert access for all users" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Enable update access for all users" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Enable delete access for all users" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Enable all access for ' || r.tablename || '" ON ' || r.tablename;
    END LOOP;
END $$;

-- إنشاء المستخدم الافتراضي admin
INSERT INTO users (username, password, full_name, role, is_active, admin_permission)
VALUES ('admin', 'admin', 'المدير العام', 'admin', true, 'full')
ON CONFLICT (username) DO UPDATE 
SET password = 'admin', full_name = 'المدير العام', role = 'admin', is_active = true, admin_permission = 'full';

-- إضافة بيانات تجريبية
INSERT INTO product_groups (name) VALUES 
('أدوية'),
('مستحضرات تجميل'),
('معدات طبية'),
('فيتامينات');

-- التحقق من النتيجة
SELECT * FROM users WHERE username = 'admin';
