-- إصلاح صلاحيات المديرين القدامى
UPDATE users
SET admin_permission = 'full'
WHERE role = 'admin' AND (admin_permission IS NULL OR admin_permission = '');

-- عرض جميع المديرين
SELECT id, username, full_name, role, admin_permission, is_active
FROM users
WHERE role = 'admin';
