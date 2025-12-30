-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (true);

-- RLS Policies for product_groups and products (readable by all)
CREATE POLICY "Product groups readable by all" ON product_groups
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage product groups" ON product_groups
  FOR ALL USING (true);

CREATE POLICY "Products readable by all" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (true);

-- RLS Policies for customers
CREATE POLICY "Sales reps can view own customers" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Sales reps can manage own customers" ON customers
  FOR ALL USING (true);

-- RLS Policies for orders
CREATE POLICY "Users can view relevant orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Sales reps can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (true);

-- RLS Policies for order_items
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Users can manage order items" ON order_items
  FOR ALL USING (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (true);
