-- إضافة المدير الافتراضي
INSERT INTO users (username, password, full_name, role, is_active, admin_permission)
VALUES ('admin', 'admin', 'المدير العام', 'admin', true, 'full')
ON CONFLICT (username) DO NOTHING;

-- إضافة مجموعات المنتجات الافتراضية
INSERT INTO product_groups (name, description) VALUES
  ('أدوية تنفسية', 'أدوية الجهاز التنفسي'),
  ('مضادات حيوية', 'المضادات الحيوية'),
  ('مسكنات', 'مسكنات الألم'),
  ('أدوية هضمية', 'أدوية الجهاز الهضمي')
ON CONFLICT DO NOTHING;

-- إضافة المنتجات الافتراضية
INSERT INTO products (group_id, name, code, price, unit)
SELECT 
  (SELECT id FROM product_groups WHERE name = 'أدوية تنفسية' LIMIT 1),
  name, code, price, unit
FROM (VALUES
  ('فنتولين', 'VEN001', 25, 'علبة'),
  ('سيريتايد', 'SER001', 120, 'علبة'),
  ('سينجولير', 'SIN001', 85, 'علبة')
) AS t(name, code, price, unit)
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (group_id, name, code, price, unit)
SELECT 
  (SELECT id FROM product_groups WHERE name = 'مضادات حيوية' LIMIT 1),
  name, code, price, unit
FROM (VALUES
  ('أموكسيسيللين', 'AMO001', 35, 'علبة'),
  ('أزيثروماسين', 'AZI001', 45, 'علبة'),
  ('سيفيكسيم', 'CEF001', 55, 'علبة')
) AS t(name, code, price, unit)
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (group_id, name, code, price, unit)
SELECT 
  (SELECT id FROM product_groups WHERE name = 'مسكنات' LIMIT 1),
  name, code, price, unit
FROM (VALUES
  ('بانادول', 'PAN001', 15, 'علبة'),
  ('بروفين', 'BRU001', 20, 'علبة'),
  ('فولتارين', 'VOL001', 30, 'علبة')
) AS t(name, code, price, unit)
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (group_id, name, code, price, unit)
SELECT 
  (SELECT id FROM product_groups WHERE name = 'أدوية هضمية' LIMIT 1),
  name, code, price, unit
FROM (VALUES
  ('جافيسكون', 'GAV001', 28, 'علبة'),
  ('نيكسيوم', 'NEX001', 65, 'علبة')
) AS t(name, code, price, unit)
ON CONFLICT (code) DO NOTHING;
