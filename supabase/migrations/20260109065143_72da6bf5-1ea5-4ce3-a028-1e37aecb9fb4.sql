-- Add patient_id column with auto-generated unique ID
ALTER TABLE public.profiles
ADD COLUMN patient_id TEXT UNIQUE;

-- Create function to generate patient ID (format: PAT-XXXXXX)
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  done BOOL;
BEGIN
  done := FALSE;
  WHILE NOT done LOOP
    -- Generate format: PAT-6 random alphanumeric characters
    new_id := 'PAT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    -- Check if it already exists
    done := NOT EXISTS(SELECT 1 FROM profiles WHERE patient_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$;

-- Create trigger function to set patient_id on insert
CREATE OR REPLACE FUNCTION public.set_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.patient_id IS NULL THEN
    NEW.patient_id := public.generate_patient_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_profile_created_set_patient_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_patient_id();

-- Generate patient IDs for existing profiles
UPDATE public.profiles
SET patient_id = public.generate_patient_id()
WHERE patient_id IS NULL;