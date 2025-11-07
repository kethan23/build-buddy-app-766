-- Fix hospital signup: Add missing INSERT policy for user_roles table
-- This allows the handle_new_user() trigger to create role entries during signup

CREATE POLICY "Allow trigger to insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (true);

COMMENT ON POLICY "Allow trigger to insert user roles" ON public.user_roles IS 
'Allows SECURITY DEFINER functions (like handle_new_user trigger) to insert roles during user signup';