-- Insert default admin user (password: admin)
-- Note: In production, use proper password hashing
INSERT INTO users (username, password, role, full_name, is_active)
VALUES ('admin', 'admin', 'admin', 'المدير العام', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample product groups
INSERT INTO product_groups (name, description, display_order) VALUES
('أدوية القلب والأوعية الدموية', 'أدوية خاصة بأمراض القلب والشرايين', 1),
('المضادات الحيوية', 'مضادات البكتيريا والالتهابات', 2),
('مسكنات الألم', 'أدوية تسكين الألم والالتهابات', 3),
('فيتامينات ومكملات', 'المكملات الغذائية والفيتامينات', 4)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (group_id, name, code, price, unit, display_order)
SELECT 
  pg.id,
  product.name,
  product.code,
  product.price,
  product.unit,
  product.display_order
FROM product_groups pg
CROSS JOIN (
  VALUES 
    ('أسبرين 100 ملغ', 'ASP-100', 15.50, 'علبة', 1),
    ('كونكور 5 ملغ', 'CON-5', 45.00, 'علبة', 2)
) AS product(name, code, price, unit, display_order)
WHERE pg.name = 'أدوية القلب والأوعية الدموية'
ON CONFLICT DO NOTHING;
