-- ==========================================
-- سكريبت إنشاء المستخدم الافتراضي (admin)
-- ==========================================
-- انسخ هذا الكود والصقه في Supabase SQL Editor

-- حذف المستخدم القديم إن وجد
DELETE FROM users WHERE username = 'admin';

-- إنشاء المستخدم الافتراضي
INSERT INTO users (
  username, 
  password, 
  full_name, 
  role, 
  is_active, 
  admin_permission,
  phone,
  security_question,
  security_answer
) VALUES (
  'admin',           -- اسم المستخدم
  'admin',           -- كلمة المرور
  'المدير العام',   -- الاسم الكامل
  'admin',           -- الدور
  true,              -- نشط
  'full',            -- صلاحيات كاملة
  '',                -- رقم الهاتف
  'ما هو اسم شركتك؟',  -- سؤال الأمان
  'الترياق'          -- جواب سؤال الأمان
);

-- التحقق من النتيجة
SELECT 
  username,
  full_name,
  role,
  is_active,
  admin_permission,
  created_at
FROM users 
WHERE username = 'admin';
