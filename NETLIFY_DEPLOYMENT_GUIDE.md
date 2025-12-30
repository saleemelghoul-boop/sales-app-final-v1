# Netlify Deployment Guide - Enable Supabase Connection

## Problem
App uses localStorage instead of Supabase. Data doesn't sync between devices.

## Root Cause
Missing environment variables on Netlify.

---

## Solution Steps

### Step 1: Get Your Supabase Keys

1. Go to your new Supabase project: https://app.supabase.com/project/cxoldiyxjjuicmfrsqmn
2. Click **Settings** (gear icon) in sidebar
3. Click **API**
4. Copy these two values:
   - **Project URL**: `https://cxoldiyxjjuicmfrsqmn.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

### Step 2: Add Environment Variables to Netlify

1. Go to Netlify: https://app.netlify.com
2. Select your site: **salesmanager-v1**
3. Click **Site settings**
4. Click **Environment variables** (in sidebar)
5. Click **Add a variable**
6. Add these TWO variables:

**Variable 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://cxoldiyxjjuicmfrsqmn.supabase.co`

**Variable 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `[paste your anon key here]`

7. Click **Save**

### Step 3: Redeploy

1. In Netlify, go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait 2-3 minutes

### Step 4: Verify Database Connection

1. Open: https://salesmanager-v1.netlify.app
2. Open browser console (F12)
3. Login with admin/admin
4. Check console - should see Supabase queries
5. Add a sales rep on computer
6. Open app on phone - should see the sales rep

---

## SQL Scripts Order

Run these in your Supabase SQL Editor:

1. **First**: `scripts/verify-supabase-setup.sql`
   - Check if tables exist
   - If tables exist with data → SKIP step 2

2. **Only if needed**: `scripts/complete-database-setup.sql`
   - Creates all tables
   - Adds admin user
   - Disables RLS

---

## Quick Test

After deployment:

1. **Computer**: Login → Add sales rep named "Test Rep"
2. **Phone**: Login → Should see "Test Rep" immediately
3. **Phone**: Add customer "Test Customer"
4. **Computer**: Refresh → Should see "Test Customer"

If data syncs = SUCCESS ✓

---

## Troubleshooting

**Problem**: Still using localStorage after deploy

**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Try incognito mode

**Problem**: Login fails with admin/admin

**Solution**:
1. Go to Supabase → Table Editor
2. Open `users` table
3. Verify admin user exists
4. If not, run `complete-database-setup.sql` again

---

## Contact Support

If issues persist, provide:
1. Netlify deploy log
2. Browser console errors (F12)
3. Screenshot of Supabase environment variables
