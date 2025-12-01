-- Create a secure function to create hospital profile during signup
-- This bypasses RLS since it runs as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_hospital_profile(
  p_user_id uuid,
  p_name text,
  p_email text,
  p_city text,
  p_country text,
  p_phone text,
  p_description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hospital_id uuid;
BEGIN
  -- Insert hospital record
  INSERT INTO public.hospitals (
    user_id,
    name,
    email,
    city,
    country,
    phone,
    description,
    verification_status,
    is_active
  ) VALUES (
    p_user_id,
    p_name,
    p_email,
    p_city,
    p_country,
    p_phone,
    p_description,
    'pending',
    false
  )
  RETURNING id INTO v_hospital_id;
  
  RETURN v_hospital_id;
END;
$$;

COMMENT ON FUNCTION public.create_hospital_profile IS 
'Creates a hospital profile during signup. Uses SECURITY DEFINER to bypass RLS since user is not yet authenticated.';