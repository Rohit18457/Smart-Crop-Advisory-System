-- ============================================================
-- AgriSmart Demo Data Seeder
-- ============================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query
-- This will populate your admin charts with beautiful, realistic data.

DO $$ 
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Grab your user ID so the data looks authentic and belongs to a real location
  SELECT id INTO v_user_id FROM public.profiles 
  WHERE email = 'rohitsuryawanashi775682@gmail.com' OR email = 'rohitsuryawanshi775682@gmail.com' 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User not found. Please make sure your email matches.';
    RETURN;
  END IF;

  -- 2. Insert 14 highly realistic predictions spread over the last 30 days
  -- This will completely light up your "Daily Predictions (30d)" line chart
  -- and populate the "Top Diseases" and "Region Insights" boxes!
  INSERT INTO public.predictions (user_id, prediction, confidence, image_url, created_at, flagged)
  VALUES 
    (v_user_id, 'Corn Common Rust', 94.5, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '1 days', false),
    (v_user_id, 'Blueberry healthy', 98.2, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500', NOW() - INTERVAL '2 days', false),
    (v_user_id, 'Soybean healthy', 99.1, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '4 days', false),
    (v_user_id, 'Tomato Early Blight', 88.4, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500', NOW() - INTERVAL '5 days', true),
    (v_user_id, 'Corn Common Rust', 91.2, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '8 days', false),
    (v_user_id, 'Tomato healthy', 97.6, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500', NOW() - INTERVAL '10 days', false),
    (v_user_id, 'Corn Northern Leaf Blight', 85.3, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '12 days', false),
    (v_user_id, 'Soybean healthy', 96.8, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '14 days', false),
    (v_user_id, 'Blueberry healthy', 99.5, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500', NOW() - INTERVAL '18 days', false),
    (v_user_id, 'Corn Common Rust', 92.1, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '21 days', true),
    (v_user_id, 'Tomato Early Blight', 89.9, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500', NOW() - INTERVAL '24 days', false),
    (v_user_id, 'Soybean healthy', 98.7, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '26 days', false),
    (v_user_id, 'Corn Common Rust', 95.4, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', NOW() - INTERVAL '28 days', false),
    (v_user_id, 'Tomato healthy', 99.2, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500', NOW() - INTERVAL '29 days', false);

  -- 3. Insert some dummy feedback so the "Feedback" menu lights up
  INSERT INTO public.feedback (user_id, rating, comment, created_at)
  VALUES 
    (v_user_id, 5, 'The AI accurately detected the rust on my corn early, saved my entire crop!', NOW() - INTERVAL '2 days'),
    (v_user_id, 4, 'Very fast prediction, but would love more pesticide recommendations.', NOW() - INTERVAL '10 days'),
    (v_user_id, 5, 'Love the beautiful interface. The 98% accuracy on my blueberries was spot on.', NOW() - INTERVAL '20 days');

END $$;
