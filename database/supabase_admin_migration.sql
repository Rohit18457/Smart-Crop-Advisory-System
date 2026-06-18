-- ============================================================
-- AgriSmart Admin Dashboard — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  prediction TEXT NOT NULL,
  confidence FLOAT,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  region TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dataset table
CREATE TABLE IF NOT EXISTS dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  label TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Translations table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, lang)
);

-- 6. User History table
CREATE TABLE IF NOT EXISTS user_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  result TEXT,
  confidence FLOAT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS (Row Level Security) on all tables
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies — allow authenticated users to read, admins to write

-- Predictions: users can insert their own, admins can read all
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
CREATE POLICY "Users can insert own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can read own predictions" ON predictions;
CREATE POLICY "Users can read own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can update predictions" ON predictions;
CREATE POLICY "Admins can update predictions" ON predictions FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Feedback: users can insert, admins can read all
DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;
CREATE POLICY "Users can insert feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can read feedback" ON feedback;
CREATE POLICY "Anyone can read feedback" ON feedback FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Alerts: admins full access, users can read active
DROP POLICY IF EXISTS "Anyone can read active alerts" ON alerts;
CREATE POLICY "Anyone can read active alerts" ON alerts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage alerts" ON alerts;
CREATE POLICY "Admins can manage alerts" ON alerts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Dataset: admins only
DROP POLICY IF EXISTS "Admins can manage dataset" ON dataset;
CREATE POLICY "Admins can manage dataset" ON dataset FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Anyone can read dataset" ON dataset;
CREATE POLICY "Anyone can read dataset" ON dataset FOR SELECT USING (true);

-- Translations: admins can edit, anyone can read
DROP POLICY IF EXISTS "Anyone can read translations" ON translations;
CREATE POLICY "Anyone can read translations" ON translations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage translations" ON translations;
CREATE POLICY "Admins can manage translations" ON translations FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- User History: users can insert/read own history, admins can read all
DROP POLICY IF EXISTS "Users can insert own history" ON user_history;
CREATE POLICY "Users can insert own history" ON user_history FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can read own history" ON user_history;
CREATE POLICY "Users can read own history" ON user_history FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. Set your user as admin (REPLACE with your actual user email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- 10. Create storage bucket for dataset images (run separately in Storage settings)
-- Or use: INSERT INTO storage.buckets (id, name, public) VALUES ('dataset-images', 'dataset-images', true);

SELECT 'Migration complete! Remember to update your profile role to admin.' AS status;
