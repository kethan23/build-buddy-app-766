
-- Document access audit log
CREATE TABLE public.document_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID,
  document_path TEXT,
  accessed_by UUID NOT NULL,
  action TEXT NOT NULL DEFAULT 'view',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.document_access_log TO authenticated;
GRANT ALL ON public.document_access_log TO service_role;
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users log their own access" ON public.document_access_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = accessed_by);
CREATE POLICY "Users view own access log" ON public.document_access_log
  FOR SELECT TO authenticated USING (auth.uid() = accessed_by OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_doc_access_log_accessed_by ON public.document_access_log(accessed_by);
CREATE INDEX idx_doc_access_log_document ON public.document_access_log(document_id);

-- AI usage / rate-limit log
CREATE TABLE public.ai_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_usage_log TO authenticated;
GRANT ALL ON public.ai_usage_log TO service_role;
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own AI usage" ON public.ai_usage_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_ai_usage_user_endpoint_time ON public.ai_usage_log(user_id, endpoint, created_at DESC);

-- Web push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subs" ON public.push_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
