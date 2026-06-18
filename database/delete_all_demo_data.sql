-- Run this in your Supabase SQL Editor to delete ALL dummy data
-- This will leave ONLY real predictions made by real users using the frontend app.

DELETE FROM public.predictions WHERE image_url LIKE '%unsplash.com%';
