
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  scans_this_month INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create startups table
CREATE TABLE public.startups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own startups" ON public.startups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own startups" ON public.startups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own startups" ON public.startups FOR UPDATE USING (auth.uid() = user_id);

-- Create scans table
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visibility_score INTEGER DEFAULT 0,
  total_queries INTEGER DEFAULT 0,
  visible_count INTEGER DEFAULT 0,
  not_visible_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans" ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view scans by share_token" ON public.scans FOR SELECT USING (share_token IS NOT NULL);

-- Create scan_results table
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  mention_snippet TEXT,
  competitors_found TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan_results" ON public.scan_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_results.scan_id AND scans.user_id = auth.uid())
);
CREATE POLICY "Users can create own scan_results" ON public.scan_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_results.scan_id AND scans.user_id = auth.uid())
);
CREATE POLICY "Users can update own scan_results" ON public.scan_results FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_results.scan_id AND scans.user_id = auth.uid())
);
CREATE POLICY "Users can delete own scan_results" ON public.scan_results FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_results.scan_id AND scans.user_id = auth.uid())
);
CREATE POLICY "Public can view scan_results by share_token" ON public.scan_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_results.scan_id AND scans.share_token IS NOT NULL)
);

-- Create suggestions table
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  is_pro_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own suggestions" ON public.suggestions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = suggestions.scan_id AND scans.user_id = auth.uid())
);
CREATE POLICY "Users can create own suggestions" ON public.suggestions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = suggestions.scan_id AND scans.user_id = auth.uid())
);
CREATE POLICY "Public can view non-pro suggestions by share_token" ON public.suggestions FOR SELECT USING (
  is_pro_only = false AND EXISTS (SELECT 1 FROM public.scans WHERE scans.id = suggestions.scan_id AND scans.share_token IS NOT NULL)
);
