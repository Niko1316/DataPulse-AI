-- Migration: Add brand personalization fields to profiles table
-- Run this in Supabase SQL Editor if your database was created before this update

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#00d4ff';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_tone TEXT DEFAULT 'analytical';

-- Add deduct_credit function
CREATE OR REPLACE FUNCTION deduct_credit(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE credits SET balance = balance - 1, updated_at = now()
  WHERE user_id = p_user_id AND balance > 0;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('avatars', 'avatars', true, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'], 5242880)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Users upload own avatars" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY IF NOT EXISTS "Anyone can view avatars" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users update own avatars" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY IF NOT EXISTS "Users delete own avatars" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);
