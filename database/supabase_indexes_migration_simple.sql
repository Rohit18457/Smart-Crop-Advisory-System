-- ============================================================
-- Smart Agriculture Advisory - Database Indexes Migration (SIMPLE & SAFE)
-- ============================================================
-- This version uses simple conditional blocks without helper functions
-- Run this AFTER the main migration (supabase_enhanced_migration_fixed.sql)
-- ============================================================

-- Core indexes with safe existence checks
DO $$
BEGIN
    -- Predictions table core indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'predictions') THEN
        DROP INDEX IF EXISTS idx_predictions_user_created;
        CREATE INDEX idx_predictions_user_created ON predictions(user_id, created_at DESC);
    END IF;
END
$$;

DO $$
BEGIN
    -- User history table core indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_history') THEN
        DROP INDEX IF EXISTS idx_user_history_user_created;
        CREATE INDEX idx_user_history_user_created ON user_history(user_id, created_at DESC);
    END IF;
END
$$;

DO $$
BEGIN
    -- Feedback table core indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
        DROP INDEX IF EXISTS idx_feedback_prediction;
        CREATE INDEX idx_feedback_prediction ON feedback(prediction_id, is_correct);
        
        DROP INDEX IF EXISTS idx_feedback_user_created;
        CREATE INDEX idx_feedback_user_created ON feedback(user_id, created_at DESC);
    END IF;
END
$$;

-- Conditional indexes using DO blocks
DO $$
BEGIN
    -- Predictions table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'predictions' AND column_name = 'confidence') THEN
        DROP INDEX IF EXISTS idx_predictions_confidence;
        CREATE INDEX idx_predictions_confidence ON predictions(confidence DESC) WHERE confidence IS NOT NULL;
        
        DROP INDEX IF EXISTS idx_predictions_user_confidence_created;
        CREATE INDEX idx_predictions_user_confidence_created ON predictions(user_id, confidence DESC, created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'predictions' AND column_name = 'flagged') THEN
        DROP INDEX IF EXISTS idx_predictions_flagged;
        CREATE INDEX idx_predictions_flagged ON predictions(flagged, created_at DESC) WHERE flagged = true;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'predictions' AND column_name = 'prediction') THEN
        DROP INDEX IF EXISTS idx_predictions_prediction_fts;
        CREATE INDEX idx_predictions_prediction_fts ON predictions USING gin(to_tsvector('english', prediction));
    END IF;
END
$$;

DO $$
BEGIN
    -- User history table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_history' AND column_name = 'type') THEN
        DROP INDEX IF EXISTS idx_user_history_type;
        CREATE INDEX idx_user_history_type ON user_history(type, created_at DESC);
    END IF;
    
    -- If your user_history has action_type instead of type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_history' AND column_name = 'action_type') THEN
        DROP INDEX IF EXISTS idx_user_history_action_type;
        CREATE INDEX idx_user_history_action_type ON user_history(action_type, created_at DESC);
    END IF;
END
$$;

DO $$
BEGIN
    -- Alerts table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alerts' AND column_name = 'is_active') THEN
        DROP INDEX IF EXISTS idx_alerts_active;
        CREATE INDEX idx_alerts_active ON alerts(is_active, created_at DESC) WHERE is_active = true;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alerts' AND column_name = 'region') THEN
        DROP INDEX IF EXISTS idx_alerts_region;
        CREATE INDEX idx_alerts_region ON alerts(region, is_active) WHERE is_active = true AND region IS NOT NULL;
    END IF;
    
    -- Full-text search for alerts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alerts' AND column_name = 'title') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'alerts' AND column_name = 'message') THEN
        DROP INDEX IF EXISTS idx_alerts_title_message_fts;
        CREATE INDEX idx_alerts_title_message_fts ON alerts USING gin(to_tsvector('english', title || ' ' || message));
    END IF;
END
$$;

DO $$
BEGIN
    -- Profiles table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        DROP INDEX IF EXISTS idx_profiles_role;
        CREATE INDEX idx_profiles_role ON profiles(role) WHERE role = 'admin';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'location') THEN
        DROP INDEX IF EXISTS idx_profiles_location;
        CREATE INDEX idx_profiles_location ON profiles(location) WHERE location IS NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_active_at') THEN
        DROP INDEX IF EXISTS idx_profiles_last_active;
        CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC) WHERE last_active_at IS NOT NULL;
    END IF;
END
$$;

-- New tables indexes (only if tables exist)
DO $$
BEGIN
    -- Crop recommendations indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crop_recommendations') THEN
        DROP INDEX IF EXISTS idx_crop_recommendations_user_created;
        CREATE INDEX idx_crop_recommendations_user_created ON crop_recommendations(user_id, created_at DESC);
        
        DROP INDEX IF EXISTS idx_crop_recommendations_crop;
        CREATE INDEX idx_crop_recommendations_crop ON crop_recommendations(recommended_crop, created_at DESC);
        
        DROP INDEX IF EXISTS idx_crop_recommendations_season;
        CREATE INDEX idx_crop_recommendations_season ON crop_recommendations(season, created_at DESC) WHERE season IS NOT NULL;
        
        DROP INDEX IF EXISTS idx_crop_recommendations_location;
        CREATE INDEX idx_crop_recommendations_location ON crop_recommendations(location) WHERE location IS NOT NULL;
        
        DROP INDEX IF EXISTS idx_crop_recommendations_feedback;
        CREATE INDEX idx_crop_recommendations_feedback ON crop_recommendations(user_feedback_rating, created_at DESC) WHERE user_feedback_rating IS NOT NULL;
        
        DROP INDEX IF EXISTS idx_crop_recommendations_user_confidence_created;
        CREATE INDEX idx_crop_recommendations_user_confidence_created ON crop_recommendations(user_id, confidence DESC, created_at DESC);
    END IF;
END
$$;

DO $$
BEGIN
    -- Weather cache indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'weather_cache') THEN
        DROP INDEX IF EXISTS idx_weather_cache_location_expires;
        CREATE INDEX idx_weather_cache_location_expires ON weather_cache(location, expires_at);
        
        DROP INDEX IF EXISTS idx_weather_cache_coordinates;
        CREATE INDEX idx_weather_cache_coordinates ON weather_cache USING GIST(location_coordinates) WHERE location_coordinates IS NOT NULL;
    END IF;
END
$$;

DO $$
BEGIN
    -- Market prices cache indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_prices_cache') THEN
        DROP INDEX IF EXISTS idx_market_prices_cache_location_expires;
        CREATE INDEX idx_market_prices_cache_location_expires ON market_prices_cache(state, market, commodity, expires_at);
        
        DROP INDEX IF EXISTS idx_market_prices_cache_commodity;
        CREATE INDEX idx_market_prices_cache_commodity ON market_prices_cache(commodity, created_at DESC);
    END IF;
END
$$;

DO $$
BEGIN
    -- User analytics indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_analytics') THEN
        DROP INDEX IF EXISTS idx_user_analytics_user_session;
        CREATE INDEX idx_user_analytics_user_session ON user_analytics(user_id, session_id, created_at DESC);
        
        DROP INDEX IF EXISTS idx_user_analytics_created;
        CREATE INDEX idx_user_analytics_created ON user_analytics(created_at DESC);
    END IF;
END
$$;

DO $$
BEGIN
    -- Model performance indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'model_performance') THEN
        DROP INDEX IF EXISTS idx_model_performance_model_created;
        CREATE INDEX idx_model_performance_model_created ON model_performance(model_name, created_at DESC);
        
        DROP INDEX IF EXISTS idx_model_performance_feedback;
        CREATE INDEX idx_model_performance_feedback ON model_performance(user_feedback_score, created_at DESC) WHERE user_feedback_score IS NOT NULL;
        
        DROP INDEX IF EXISTS idx_model_performance_confidence;
        CREATE INDEX idx_model_performance_confidence ON model_performance(confidence_score DESC) WHERE confidence_score IS NOT NULL;
    END IF;
END
$$;

DO $$
BEGIN
    -- Notifications indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        DROP INDEX IF EXISTS idx_notifications_user_unread;
        CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
        
        DROP INDEX IF EXISTS idx_notifications_user_type;
        CREATE INDEX idx_notifications_user_type ON notifications(user_id, type, created_at DESC);
        
        DROP INDEX IF EXISTS idx_notifications_priority;
        CREATE INDEX idx_notifications_priority ON notifications(priority, created_at DESC) WHERE priority IN ('high', 'urgent');
        
        DROP INDEX IF EXISTS idx_notifications_expires;
        CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;
    END IF;
END
$$;

DO $$
BEGIN
    -- User preferences indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        DROP INDEX IF EXISTS idx_user_preferences_user;
        CREATE UNIQUE INDEX idx_user_preferences_user ON user_preferences(user_id);
    END IF;
END
$$;

-- Success message
SELECT 'All applicable indexes created successfully! Database performance optimized.' as status;