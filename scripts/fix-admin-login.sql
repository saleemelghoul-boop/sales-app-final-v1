-- حذف المستخدم الافتراضي القديم إذا كان موجوداً
DELETE FROM users WHERE username = 'admin';

-- إنشاء المستخدم الافتراضي admin/admin
INSERT INTO users (username, password, full_name, role, is_active, admin_permission)
VALUES ('admin', 'admin', 'المدير العام', 'admin', true, 'full');

-- التحقق من إنشاء المستخدم
SELECT username, full_name, role FROM users WHERE username = 'admin';
