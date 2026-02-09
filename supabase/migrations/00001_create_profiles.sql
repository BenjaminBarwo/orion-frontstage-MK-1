-- Migration: Add onboarding-specific profile fields
-- Extends existing profiles table with first_name, last_name, zip_code, and onboarding_completed
-- Built on top of migrations 20260208000001_create_profiles.sql and 20260208000003_optimize_schema_ml_readiness.sql
--
-- STORAGE SETUP NOTE:
-- After running this migration, create the avatars storage bucket via Supabase Dashboard or CLI:
--   supabase storage create avatars --public
-- Then apply the storage RLS policies (see bottom of file)

-- Add new columns for onboarding flow
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS zip_code VARCHAR(5) CHECK (zip_code ~ '^\d{5}$'),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Update bio constraint to match onboarding requirement (300 chars instead of 1000)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_bio_check,
  ADD CONSTRAINT profiles_bio_check CHECK (char_length(bio) <= 300);

-- ============================================================================
-- STORAGE BUCKET AND RLS (run manually after bucket creation)
-- ============================================================================
--
-- Create avatars bucket (run via CLI or Dashboard):
--   supabase storage create avatars --public
--
-- Or via SQL:
--   INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
--
-- Storage RLS policies:
--
-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "Anyone can view avatars"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id = 'avatars');
--
-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE
--   TO authenticated
--   USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "Users can delete own avatar"
--   ON storage.objects FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
