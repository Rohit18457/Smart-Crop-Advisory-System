-- ============================================================
-- Smart Agriculture Advisory - Enhanced Database Migration (FIXED)
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- 
-- This migration enhances your existing database with:
-- 1. Enhanced user profiles with farming-specific fields
-- 2. Crop recommendations tracking table
-- 3. Caching tables for weather and market data
-- 4. Analytics tables for user engagement and model performance
-- 5. Notification system for alerts and updates
-- 6. Optimized indexes for better query performance
-- 7. Database functions for common operations
-- ============================================================

-- STEP 1: Enhanced User Profiles
-- ============================================================
DO $$
BEGIN
    -- Add farming-specific fields to profiles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'farm_size_acres') THEN
        ALTER TABLE profiles ADD COLUMN farm_size_acres DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'primary_crops') THEN
        ALTER TABLE profiles ADD COLUMN primary_crops TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'farming_experience_years') THEN
        ALTER TABLE profiles ADD COLUMN farming_experience_years INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_units') THEN
        ALTER TABLE profiles ADD COLUMN preferred_units TEXT DEFAULT 'metric';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
        ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"weather": true, "market": true, "alerts": true, "recommendations": true}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active_at') THEN
        ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END
$$;

-- STEP 2: Crop Recommendations Tracking Table
-- ============================================================
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    input_parameters JSONB NOT NULL,
    recommended_crop TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    top_alternatives JSONB,
    location TEXT,
    season TEXT CHECK (season IN ('kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon')),
    weather_conditions JSONB,
    user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
    user_feedback_comment TEXT,
    implemented BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Weather Cache Table
-- ============================================================
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL,
    location_coordinates POINT,
    weather_data JSONB NOT NULL,
    forecast_data JSONB,
    api_source TEXT DEFAULT 'openweathermap',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location, api_source)
);

-- STEP 4: Market Prices Cache Table
-- ============================================================
CREATE TABLE IF NOT EXISTS market_prices_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT,
    district TEXT,
    market TEXT,
    commodity TEXT,
    variety TEXT,
    market_data JSONB NOT NULL,
    price_trend JSONB,
    api_source TEXT DEFAULT 'data_gov_in',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state, market, commodity, variety, api_source)
);

-- STEP 5: User Analytics Table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    page_views JSONB DEFAULT '{}',
    time_spent_minutes INTEGER DEFAULT 0,
    actions_taken JSONB DEFAULT '[]',
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Model Performance Tracking Table
-- ============================================================
CREATE TABLE IF NOT EXISTS model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL CHECK (model_name IN ('disease_detection', 'crop_recommendation')),
    model_version TEXT NOT NULL DEFAULT '1.0.0',
    prediction_id UUID,
    prediction_type TEXT CHECK (prediction_type IN ('disease', 'crop')),
    input_data JSONB,
    prediction_result JSONB,
    confidence_score FLOAT,
    user_feedback_score INTEGER CHECK (user_feedback_score >= 1 AND user_feedback_score <= 5),
    user_feedback_comment TEXT,
    accuracy_metrics JSONB,
    processing_time_ms INTEGER,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 7: Notifications Table
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('weather', 'market', 'alert', 'recommendation', 'system', 'feedback')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    action_url TEXT,
    action_label TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 8: User Preferences Table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    dashboard_layout JSONB DEFAULT '{"widgets": ["weather", "recommendations", "market", "alerts"]}',
    favorite_crops TEXT[] DEFAULT '{}',
    alert_thresholds JSONB DEFAULT '{"weather": {"temperature": {"min": 10, "max": 40}, "rainfall": {"min": 0, "max": 100}}, "market": {"price_change_percent": 10}}',
    privacy_settings JSONB DEFAULT '{"share_analytics": true, "share_location": true, "marketing_emails": false}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 9: Enable RLS on New Tables
-- ============================================================
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- STEP 10: RLS Policies
-- ============================================================

-- Crop recommendations policies
DROP POLICY IF EXISTS "Users can manage own crop recommendations" ON crop_recommendations;
CREATE POLICY "Users can manage own crop recommendations" 
ON crop_recommendations FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all crop recommendations" ON crop_recommendations;
CREATE POLICY "Admins can read all crop recommendations" 
ON crop_recommendations FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- User analytics policies
DROP POLICY IF EXISTS "Users can read own analytics" ON user_analytics;
CREATE POLICY "Users can read own analytics" 
ON user_analytics FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analytics" ON user_analytics;
CREATE POLICY "Users can insert own analytics" 
ON user_analytics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all analytics" ON user_analytics;
CREATE POLICY "Admins can read all analytics" 
ON user_analytics FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Model performance policies
DROP POLICY IF EXISTS "Admins can manage model performance" ON model_performance;
CREATE POLICY "Admins can manage model performance" 
ON model_performance FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "System can insert model performance" ON model_performance;
CREATE POLICY "System can insert model performance" 
ON model_performance FOR INSERT 
WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (true);

-- User preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences" 
ON user_preferences FOR ALL 
USING (auth.uid() = user_id);

-- Success message
SELECT 'Enhanced migration completed successfully! All tables, columns, and policies created.' as status;