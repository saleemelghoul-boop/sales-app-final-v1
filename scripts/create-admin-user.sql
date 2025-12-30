-- سكريبت لإنشاء المستخدم الافتراضي
-- شغّل هذا السكريبت في Supabase SQL Editor

-- حذف المستخدم الافتراضي إن وجد
DELETE FROM users WHERE username = 'admin';

-- إنشاء المستخدم الافتراضي
INSERT INTO users (username, password, full_name, role, is_active, admin_permission, phone, security_question, security_answer)
VALUES (
  'admin',
  'admin',
  'المدير العام',
  'admin',
  true,
  'full',
  '',
  'ما هو اسم شركتك؟',
  'الترياق'
);

-- التحقق من إنشاء المستخدم
SELECT * FROM users WHERE username = 'admin';
