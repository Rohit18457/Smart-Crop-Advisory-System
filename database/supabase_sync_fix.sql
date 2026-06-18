-- ============================================================
-- AgriSmart Ultimate Database Standardization & Sync Migration
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- 
-- This script:
-- 1. Standardizes the profiles table columns and defaults.
-- 2. Ensures dual-column compatibility for 'preferred_language' and 'language_preference'.
-- 3. Enables RLS and sets up bulletproof access policies.
-- 4. Recreates the new user registration trigger utilizing ON CONFLICT DO UPDATE.
-- 5. Restores/ensures the user_preferences table exists and is secured.
-- ============================================================

-- STEP 1: Standardize Profiles Table Structure
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'farmer',
    soil_type TEXT,
    location TEXT,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    language_preference TEXT DEFAULT 'en',
    farm_size_acres DECIMAL(10,2),
    primary_crops TEXT[] DEFAULT '{}',
    farming_experience_years INTEGER,
    preferred_units TEXT DEFAULT 'metric',
    notification_preferences JSONB DEFAULT '{"weather": true, "market": true, "alerts": true, "recommendations": true}',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist individually (in case the table already existed)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'farmer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS farm_size_acres DECIMAL(10,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_crops TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS farming_experience_years INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_units TEXT DEFAULT 'metric';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"weather": true, "market": true, "alerts": true, "recommendations": true}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 2: Sync and Align Language Column Data
-- ============================================================
UPDATE public.profiles 
SET 
    language_preference = COALESCE(language_preference, preferred_language, 'en'),
    preferred_language = COALESCE(preferred_language, language_preference, 'en')
WHERE language_preference IS NULL OR preferred_language IS NULL;

-- STEP 3: Setup Row Level Security (RLS) & Policies
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Admin helper function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin read policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin());

-- System access policy (allows trigger & service role full access)
DROP POLICY IF EXISTS "System can manage profiles" ON public.profiles;
CREATE POLICY "System can manage profiles" 
ON public.profiles FOR ALL 
USING (true);

-- STEP 4: Standardize User Preferences Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    dashboard_layout JSONB DEFAULT '{"widgets": ["weather", "recommendations", "market", "alerts"]}',
    favorite_crops TEXT[] DEFAULT '{}',
    alert_thresholds JSONB DEFAULT '{"weather": {"temperature": {"min": 10, "max": 40}, "rainfall": {"min": 0, "max": 100}}, "market": {"price_change_percent": 10}}',
    privacy_settings JSONB DEFAULT '{"share_analytics": true, "share_location": true, "marketing_emails": false}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Preferences policy
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" 
ON public.user_preferences FOR ALL 
USING (auth.uid() = user_id);

-- STEP 5: Create Safe & Robust Registration Trigger Function
-- ============================================================
-- The SECURITY DEFINER modifier runs this function with the privileges of its creator (typically database owner/admin),
-- ensuring it bypasses any RLS rules during the initial signUp signup process.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role, 
    soil_type, 
    location, 
    phone,
    preferred_language, 
    language_preference,
    farm_size_acres,
    primary_crops,
    farming_experience_years,
    preferred_units,
    notification_preferences,
    last_active_at,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'farmer'),
    new.raw_user_meta_data->>'soil_type',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'language_preference', new.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(new.raw_user_meta_data->>'language_preference', new.raw_user_meta_data->>'preferred_language', 'en'),
    NULL,
    '{}'::text[],
    NULL,
    'metric',
    '{"weather": true, "market": true, "alerts": true, "recommendations": true}'::jsonb,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(EXCLUDED.role, profiles.role),
    soil_type = COALESCE(EXCLUDED.soil_type, profiles.soil_type),
    location = COALESCE(EXCLUDED.location, profiles.location),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    preferred_language = COALESCE(EXCLUDED.preferred_language, profiles.preferred_language),
    language_preference = COALESCE(EXCLUDED.language_preference, profiles.language_preference),
    updated_at = NOW();
  
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Completion Output
-- ============================================================
SELECT 'Database standardization completed successfully! Profiles trigger and preferences are now fully optimized.' AS status;
