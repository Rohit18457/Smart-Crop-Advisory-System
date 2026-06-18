-- ============================================================
-- AgriSmart Schema Cache & Relationship Fix
-- ============================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query

-- 1. Fix the relationship for the Predictions table
ALTER TABLE public.predictions DROP CONSTRAINT IF EXISTS predictions_user_id_fkey;
ALTER TABLE public.predictions 
  ADD CONSTRAINT predictions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Fix the relationship for the Feedback table
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE public.feedback 
  ADD CONSTRAINT feedback_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Notify PostgREST to reload the schema cache so the API recognizes the new links
NOTIFY pgrst, 'reload schema';
