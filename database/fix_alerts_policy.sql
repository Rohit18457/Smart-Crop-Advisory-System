-- ============================================================
-- AgriSmart Alerts Security Fix
-- ============================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query

-- Ensure the alerts table exists (just in case)
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    region TEXT DEFAULT 'All',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Enable Security (RLS) on the alerts table
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows ALL users (farmers) to READ the alerts
-- This is what allows the dashboard to fetch them!
DROP POLICY IF EXISTS "Anyone can read alerts" ON public.alerts;
CREATE POLICY "Anyone can read alerts" ON public.alerts 
FOR SELECT USING (true);

-- 3. Ensure Admins can manage alerts
DROP POLICY IF EXISTS "Admins can manage alerts" ON public.alerts;
CREATE POLICY "Admins can manage alerts" ON public.alerts 
FOR ALL USING (public.is_admin());
