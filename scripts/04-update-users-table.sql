-- إضافة أعمدة استعادة كلمة المرور لجدول المستخدمين
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS security_question TEXT,
ADD COLUMN IF NOT EXISTS security_answer TEXT;

-- تحديث المدير الافتراضي بسؤال أمان
UPDATE users 
SET 
  security_question = 'ما اسم الشركة؟',
  security_answer = 'الترياق'
WHERE username = 'admin';
