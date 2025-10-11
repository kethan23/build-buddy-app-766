-- Fix 1: Allow hospital owners to view inquiry messages for their hospitals
CREATE POLICY "Hospital owners can view messages for their inquiries"
  ON public.inquiry_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inquiries
      JOIN public.hospitals ON hospitals.id = inquiries.hospital_id
      WHERE inquiries.id = inquiry_messages.inquiry_id
      AND hospitals.user_id = auth.uid()
    )
  );

-- Fix 2: Restrict search analytics INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can insert search analytics" ON public.search_analytics;

CREATE POLICY "Authenticated users can insert search analytics"
  ON public.search_analytics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add index for monitoring and rate limiting
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_created 
  ON public.search_analytics(user_id, created_at DESC);

-- Fix 3: Strengthen handle_new_user() to prevent admin role assignment via signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  -- Strictly validate role from metadata
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'patient'::app_role
  );
  
  -- CRITICAL: Prevent admin role assignment via signup
  -- Only allow patient or hospital roles through public signup
  IF user_role = 'admin' THEN
    user_role := 'patient'::app_role;
  END IF;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;