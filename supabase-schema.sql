-- ================================================
-- DataPulse AI — Supabase Database Schema
-- Execute in Supabase SQL Editor in this exact order
-- ================================================

-- ================================================
-- EXTENSION
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- PROFILES
-- ================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'fr', 'es')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ================================================
-- CUSTOMERS
-- ================================================
CREATE TABLE customers (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own customer" ON customers FOR SELECT USING ((SELECT auth.uid()) = id);

-- ================================================
-- PRODUCTS
-- ================================================
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  active BOOLEAN DEFAULT true,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  metadata JSONB DEFAULT '{}'
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);

-- ================================================
-- PRICES
-- ================================================
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

CREATE TABLE prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products,
  active BOOLEAN DEFAULT true,
  unit_amount BIGINT,
  currency TEXT CHECK (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER,
  metadata JSONB DEFAULT '{}'
);
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public prices read" ON prices FOR SELECT USING (true);

-- ================================================
-- SUBSCRIPTIONS
-- ================================================
CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'canceled', 'incomplete',
  'incomplete_expired', 'past_due', 'unpaid', 'paused'
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status subscription_status NOT NULL,
  price_id TEXT REFERENCES prices,
  quantity INTEGER DEFAULT 1,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created TIMESTAMPTZ DEFAULT now(),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subs" ON subscriptions FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- ================================================
-- CREDITS
-- ================================================
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own credits" ON credits FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO credits (user_id, balance, total_purchased)
  VALUES (p_user_id, p_credits, p_credits)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = credits.balance + p_credits,
    total_purchased = credits.total_purchased + p_credits,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- PROJECTS
-- ================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  source_type TEXT DEFAULT 'pdf' CHECK (source_type IN ('pdf', 'url', 'text')),
  source_url TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  page_count INTEGER,
  languages TEXT[] DEFAULT ARRAY['en'],
  platforms TEXT[] DEFAULT ARRAY['linkedin'],
  tone TEXT DEFAULT 'professional',
  objective TEXT DEFAULT 'thought_leadership',
  target_audience TEXT DEFAULT 'professionals',
  cta TEXT,
  brand_name TEXT,
  website_url TEXT,
  hashtags TEXT[],
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own projects" ON projects FOR ALL USING ((SELECT auth.uid()) = user_id);
CREATE INDEX idx_projects_user ON projects (user_id);
CREATE INDEX idx_projects_status ON projects (status);

-- ================================================
-- DOCUMENT_INSIGHTS
-- ================================================
CREATE TABLE document_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  summary TEXT,
  key_themes TEXT[],
  extracted_statistics JSONB DEFAULT '[]',
  counter_intuitive_insights JSONB DEFAULT '[]',
  suggested_angles JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE document_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own insights" ON document_insights FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- ================================================
-- GENERATED_ASSETS
-- ================================================
CREATE TABLE generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  job_id TEXT,
  platform TEXT CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'infographic', 'bundle')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr', 'es')),
  content_type TEXT,
  content_text TEXT,
  content_json JSONB DEFAULT '{}',
  visual_brief TEXT,
  source_references JSONB DEFAULT '[]',
  version INTEGER DEFAULT 1,
  is_exported BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own assets" ON generated_assets FOR ALL USING ((SELECT auth.uid()) = user_id);
CREATE INDEX idx_assets_project ON generated_assets (project_id);
CREATE INDEX idx_assets_user ON generated_assets (user_id);

-- ================================================
-- JOBS
-- ================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects,
  user_id UUID REFERENCES auth.users,
  client_email TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  price_id TEXT,
  stripe_session_id TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  delivery_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own jobs" ON jobs FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- ================================================
-- CLIENTS
-- ================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read all clients" ON clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

-- ================================================
-- SYSTEM_LOGS
-- ================================================
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT,
  event_type TEXT,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read system logs" ON system_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);
CREATE POLICY "Service role can insert logs" ON system_logs FOR INSERT WITH CHECK (true);

-- ================================================
-- USAGE_LOGS
-- ================================================
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  action_type TEXT NOT NULL,
  project_id UUID REFERENCES projects,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage" ON usage_logs FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE INDEX idx_usage_user_action_date ON usage_logs (user_id, action_type, created_at DESC);

CREATE OR REPLACE FUNCTION get_monthly_usage(p_user_id UUID, p_action_type TEXT)
RETURNS INTEGER AS $$
  SELECT COALESCE(COUNT(*), 0)::INTEGER
  FROM usage_logs
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= date_trunc('month', now())
    AND created_at < date_trunc('month', now()) + INTERVAL '1 month';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ================================================
-- SDR_QUEUE
-- ================================================
CREATE TABLE sdr_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posts_json JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'published')),
  scheduled_date TIMESTAMPTZ,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sdr_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage SDR queue" ON sdr_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

-- ================================================
-- SUPABASE STORAGE
-- ================================================
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('pdfs', 'pdfs', false, ARRAY['application/pdf'], 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own PDFs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pdfs' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY "Users read own PDFs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pdfs' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY "Users delete own PDFs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pdfs' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);
