-- ============================================================
-- AgriSmart Database Fix & Data Seeder (Final Fix)
-- ============================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query

-- 1. Ensure the tables exist correctly
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prediction TEXT NOT NULL,
    confidence DECIMAL NOT NULL,
    image_url TEXT,
    flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1B. Ensure the rating and is_correct columns exist if the table was already created!
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 5;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS is_correct BOOLEAN NOT NULL DEFAULT true;

-- 2. Enable Security (RLS)
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. Fix Policies: Allow Users to Save Data
DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;
CREATE POLICY "Users can insert own predictions" ON public.predictions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
CREATE POLICY "Users can insert own feedback" ON public.feedback 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own predictions" ON public.predictions;
CREATE POLICY "Users can read own predictions" ON public.predictions 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own feedback" ON public.feedback;
CREATE POLICY "Users can read own feedback" ON public.feedback 
FOR SELECT USING (auth.uid() = user_id);

-- 4. Fix Policies: Allow Admins to see EVERYTHING
DROP POLICY IF EXISTS "Admins can read all predictions" ON public.predictions;
CREATE POLICY "Admins can read all predictions" ON public.predictions 
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update predictions" ON public.predictions;
CREATE POLICY "Admins can update predictions" ON public.predictions 
FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all feedback" ON public.feedback;
CREATE POLICY "Admins can read all feedback" ON public.feedback 
FOR SELECT USING (public.is_admin());

-- 5. Seed the Data!
DO $$ 
DECLARE
  v_user_id UUID;
BEGIN
  -- Grab your user ID
  SELECT id INTO v_user_id FROM public.profiles 
  WHERE email = 'rohitsuryawanashi775682@gmail.com' OR email = 'rohitsuryawanshi775682@gmail.com' 
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
      -- Delete old dummy data to prevent duplicates
      DELETE FROM public.predictions WHERE image_url LIKE '%unsplash.com%';
      DELETE FROM public.feedback WHERE comment LIKE '%The AI accurately detected%';

      -- Insert highly realistic predictions spread over the last 30 days
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

      -- Insert some dummy feedback WITH the is_correct column!
      INSERT INTO public.feedback (user_id, rating, comment, is_correct, created_at)
      VALUES 
        (v_user_id, 5, 'The AI accurately detected the rust on my corn early, saved my entire crop!', true, NOW() - INTERVAL '2 days'),
        (v_user_id, 4, 'Very fast prediction, but would love more pesticide recommendations.', true, NOW() - INTERVAL '10 days'),
        (v_user_id, 5, 'Love the beautiful interface. The 98% accuracy on my blueberries was spot on.', true, NOW() - INTERVAL '20 days');
  END IF;
END $$;
