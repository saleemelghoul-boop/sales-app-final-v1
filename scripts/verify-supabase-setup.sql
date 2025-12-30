-- ========================================
-- VERIFY SUPABASE DATABASE SETUP
-- ========================================
-- Run this in your NEW Supabase project SQL Editor
-- Project: https://cxoldiyxjjuicmfrsqmn.supabase.co

-- Step 1: Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Step 2: Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Step 3: Check if admin user exists
SELECT username, full_name, role, is_active
FROM users
WHERE username = 'admin';

-- Step 4: Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
