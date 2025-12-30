-- التأكد من وجود المستخدم الافتراضي (admin)
-- قم بتشغيل هذا السكريبت إذا لم تتمكن من تسجيل الدخول

INSERT INTO users (username, password, full_name, role, phone, email, security_question, security_answer, is_active, admin_permission)
VALUES ('admin', 'admin', 'المدير العام', 'admin', '', 'admin@example.com', 'ما هو اسم أول حبيبي؟', 'أحمد', true, 'full')
ON CONFLICT (username) DO NOTHING;

-- التحقق من إنشاء المستخدم
SELECT * FROM users WHERE username = 'admin';
