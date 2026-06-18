-- ============================================================
-- AgriSmart Ultimate Demo Data Generator (Failsafe Version)
-- ============================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query

DO $$ 
DECLARE
  v_user_id UUID;
  i INT;
  random_disease_idx INT;
  random_days INT;
  random_conf DECIMAL;
  diseases TEXT[] := ARRAY[
    'Corn Common Rust', 'Corn Common Rust', 'Corn Common Rust', 
    'Tomato Early Blight', 'Tomato Early Blight',
    'Soybean healthy', 'Soybean healthy',
    'Blueberry healthy',
    'Potato Late Blight',
    'Apple Scab',
    'Grape Black Rot'
  ];
BEGIN
  -- Grab the very first user ID in the system (100% guaranteed to work)
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

  IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'No users found in the profiles table! Please create an account first.';
  END IF;

  -- Delete the old sparse dummy data so we can replace it with a massive, realistic dataset
  DELETE FROM public.predictions WHERE image_url LIKE '%unsplash.com%';

  -- Generate 180 highly realistic, randomized predictions spread over 30 days
  FOR i IN 1..180 LOOP
      -- Randomize the disease (weighted by the array above)
      random_disease_idx := floor(random() * array_length(diseases, 1) + 1);
      
      -- Randomize the date (heavily clustered in the last 15 days to look like recent growth)
      random_days := floor(random() * random() * 30);
      
      -- Randomize the confidence between 75.0 and 99.9
      random_conf := 75.0 + (random() * 24.9);

      INSERT INTO public.predictions (user_id, prediction, confidence, image_url, created_at, flagged)
      VALUES (
        v_user_id, 
        diseases[random_disease_idx], 
        random_conf, 
        'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', 
        NOW() - (random_days || ' days')::INTERVAL - (floor(random()*24) || ' hours')::INTERVAL, 
        (random() > 0.85) -- 15% chance it's flagged
      );
  END LOOP;
END $$;
