-- ============================================================
-- Smart Agriculture Advisory - Database Functions Migration
-- ============================================================
-- Run this AFTER the indexes migration
-- 
-- This creates useful database functions for common operations
-- ============================================================

-- STEP 10: Utility Functions
-- ============================================================

-- Function to update last_active_at timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET last_active_at = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to automatically update last_active_at
DROP TRIGGER IF EXISTS trigger_update_last_active_predictions ON predictions;
CREATE TRIGGER trigger_update_last_active_predictions
    AFTER INSERT ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

DROP TRIGGER IF EXISTS trigger_update_last_active_crop_recommendations ON crop_recommendations;
CREATE TRIGGER trigger_update_last_active_crop_recommendations
    AFTER INSERT ON crop_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

DROP TRIGGER IF EXISTS trigger_update_last_active_user_history ON user_history;
CREATE TRIGGER trigger_update_last_active_user_history
    AFTER INSERT ON user_history
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Function to get user dashboard statistics
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_predictions', COALESCE((SELECT COUNT(*) FROM predictions WHERE user_id = user_uuid), 0),
        'total_recommendations', COALESCE((SELECT COUNT(*) FROM crop_recommendations WHERE user_id = user_uuid), 0),
        'accuracy_rate', COALESCE((
            SELECT ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)::numeric, 2)
            FROM feedback f 
            JOIN predictions p ON f.prediction_id = p.id 
            WHERE p.user_id = user_uuid
        ), 0),
        'last_activity', (
            SELECT MAX(created_at) 
            FROM user_history 
            WHERE user_id = user_uuid
        ),
        'unread_notifications', COALESCE((
            SELECT COUNT(*) 
            FROM notifications 
            WHERE user_id = user_uuid AND read_at IS NULL
        ), 0),
        'recent_crops', (
            SELECT COALESCE(json_agg(crop), '[]'::json) FROM (
                SELECT recommended_crop AS crop
                FROM crop_recommendations 
                WHERE user_id = user_uuid 
                AND created_at > NOW() - INTERVAL '30 days'
                GROUP BY recommended_crop
                ORDER BY MAX(created_at) DESC
                LIMIT 5
            ) sub
        ),
        'avg_confidence', COALESCE((
            SELECT ROUND(AVG(confidence)::numeric, 2)
            FROM predictions 
            WHERE user_id = user_uuid
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date TIMESTAMPTZ;
BEGIN
    start_date := NOW() - (days_back || ' days')::INTERVAL;
    
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles),
        'active_users', (SELECT COUNT(*) FROM profiles WHERE last_active_at > start_date),
        'new_users', (SELECT COUNT(*) FROM profiles WHERE created_at > start_date),
        'total_predictions', (SELECT COUNT(*) FROM predictions WHERE created_at > start_date),
        'total_recommendations', (SELECT COUNT(*) FROM crop_recommendations WHERE created_at > start_date),
        'avg_prediction_confidence', COALESCE((
            SELECT ROUND(AVG(confidence)::numeric, 2) 
            FROM predictions 
            WHERE created_at > start_date
        ), 0),
        'avg_recommendation_confidence', COALESCE((
            SELECT ROUND(AVG(confidence)::numeric, 2) 
            FROM crop_recommendations 
            WHERE created_at > start_date
        ), 0),
        'feedback_rate', COALESCE((
            SELECT ROUND(
                ((COUNT(f.*)::FLOAT / COUNT(p.*)) * 100)::numeric, 2
            )
            FROM predictions p
            LEFT JOIN feedback f ON p.id = f.prediction_id
            WHERE p.created_at > start_date
        ), 0),
        'top_diseases', (
            SELECT COALESCE(json_agg(disease_stats), '[]'::json)
            FROM (
                SELECT json_build_object(
                    'disease', prediction,
                    'count', COUNT(*),
                    'avg_confidence', ROUND(AVG(confidence)::numeric, 2)
                ) as disease_stats
                FROM predictions 
                WHERE created_at > start_date
                GROUP BY prediction
                ORDER BY COUNT(*) DESC
                LIMIT 10
            ) t
        ),
        'top_crops', (
            SELECT COALESCE(json_agg(crop_stats), '[]'::json)
            FROM (
                SELECT json_build_object(
                    'crop', recommended_crop,
                    'count', COUNT(*),
                    'avg_confidence', ROUND(AVG(confidence)::numeric, 2)
                ) as crop_stats
                FROM crop_recommendations 
                WHERE created_at > start_date
                GROUP BY recommended_crop
                ORDER BY COUNT(*) DESC
                LIMIT 10
            ) t
        ),
        'user_locations', (
            SELECT COALESCE(json_agg(location_stats), '[]'::json)
            FROM (
                SELECT json_build_object(
                    'location', COALESCE(location, 'Unknown'),
                    'count', COUNT(*)
                ) as location_stats
                FROM profiles 
                WHERE location IS NOT NULL
                GROUP BY location
                ORDER BY COUNT(*) DESC
                LIMIT 10
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired cache data
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    weather_deleted INTEGER;
    market_deleted INTEGER;
    old_analytics INTEGER;
BEGIN
    -- Clean expired weather cache
    DELETE FROM weather_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS weather_deleted = ROW_COUNT;
    
    -- Clean expired market prices cache
    DELETE FROM market_prices_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS market_deleted = ROW_COUNT;
    
    -- Clean old user analytics (keep 1 year)
    DELETE FROM user_analytics WHERE created_at < NOW() - INTERVAL '1 year';
    GET DIAGNOSTICS old_analytics = ROW_COUNT;
    
    deleted_count := weather_deleted + market_deleted + old_analytics;
    
    RAISE NOTICE 'Cleanup completed: % weather cache, % market cache, % old analytics records deleted', 
                 weather_deleted, market_deleted, old_analytics;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_uuid UUID, days_back INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date TIMESTAMPTZ;
BEGIN
    start_date := NOW() - (days_back || ' days')::INTERVAL;
    
    SELECT json_build_object(
        'predictions_count', COALESCE((
            SELECT COUNT(*) 
            FROM predictions 
            WHERE user_id = user_uuid AND created_at > start_date
        ), 0),
        'recommendations_count', COALESCE((
            SELECT COUNT(*) 
            FROM crop_recommendations 
            WHERE user_id = user_uuid AND created_at > start_date
        ), 0),
        'total_time_spent', COALESCE((
            SELECT SUM(time_spent_minutes) 
            FROM user_analytics 
            WHERE user_id = user_uuid AND created_at > start_date
        ), 0),
        'page_views', COALESCE((
            SELECT COUNT(*) 
            FROM user_analytics 
            WHERE user_id = user_uuid AND created_at > start_date
        ), 0),
        'feedback_given', COALESCE((
            SELECT COUNT(*) 
            FROM feedback f
            JOIN predictions p ON f.prediction_id = p.id
            WHERE p.user_id = user_uuid AND f.created_at > start_date
        ), 0),
        'notifications_read', COALESCE((
            SELECT COUNT(*) 
            FROM notifications 
            WHERE user_id = user_uuid 
            AND read_at > start_date 
            AND read_at IS NOT NULL
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'system',
    notification_priority TEXT DEFAULT 'normal',
    notification_data JSONB DEFAULT '{}',
    expires_in_hours INTEGER DEFAULT 168 -- 7 days default
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        priority,
        data,
        expires_at
    ) VALUES (
        target_user_id,
        notification_title,
        notification_message,
        notification_type,
        notification_priority,
        notification_data,
        NOW() + (expires_in_hours || ' hours')::INTERVAL
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read_at = NOW() 
    WHERE id = notification_id 
    AND user_id = user_uuid 
    AND read_at IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get model performance metrics
CREATE OR REPLACE FUNCTION get_model_performance_metrics(
    model_name_param TEXT,
    days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date TIMESTAMPTZ;
BEGIN
    start_date := NOW() - (days_back || ' days')::INTERVAL;
    
    SELECT json_build_object(
        'model_name', model_name_param,
        'total_predictions', COALESCE((
            SELECT COUNT(*) 
            FROM model_performance 
            WHERE model_name = model_name_param 
            AND created_at > start_date
        ), 0),
        'avg_confidence', COALESCE((
            SELECT ROUND(AVG(confidence_score)::numeric, 2) 
            FROM model_performance 
            WHERE model_name = model_name_param 
            AND created_at > start_date
            AND confidence_score IS NOT NULL
        ), 0),
        'avg_processing_time', COALESCE((
            SELECT ROUND(AVG(processing_time_ms), 2) 
            FROM model_performance 
            WHERE model_name = model_name_param 
            AND created_at > start_date
            AND processing_time_ms IS NOT NULL
        ), 0),
        'user_satisfaction', COALESCE((
            SELECT ROUND(AVG(user_feedback_score), 2) 
            FROM model_performance 
            WHERE model_name = model_name_param 
            AND created_at > start_date
            AND user_feedback_score IS NOT NULL
        ), 0),
        'error_rate', COALESCE((
            SELECT ROUND(
                ((COUNT(CASE WHEN error_details IS NOT NULL THEN 1 END)::FLOAT / COUNT(*)) * 100)::numeric, 2
            )
            FROM model_performance 
            WHERE model_name = model_name_param 
            AND created_at > start_date
        ), 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS trigger_update_crop_recommendations_updated_at ON crop_recommendations;
CREATE TRIGGER trigger_update_crop_recommendations_updated_at
    BEFORE UPDATE ON crop_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- All functions and triggers created successfully