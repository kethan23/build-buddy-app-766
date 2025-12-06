-- Add appointment_id column to bookings table for unique 12-digit ID
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS appointment_id TEXT UNIQUE;

-- Add caretaker columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS caretaker_name TEXT,
ADD COLUMN IF NOT EXISTS caretaker_phone TEXT;

-- Create function to generate unique 12-digit appointment ID
CREATE OR REPLACE FUNCTION public.generate_appointment_id()
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
    -- Generate a 12-digit random number
    new_id := LPAD(FLOOR(RANDOM() * 999999999999)::TEXT, 12, '0');
    -- Check if it already exists
    done := NOT EXISTS(SELECT 1 FROM bookings WHERE appointment_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$;

-- Create trigger to auto-generate appointment_id on insert
CREATE OR REPLACE FUNCTION public.set_appointment_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.appointment_id IS NULL THEN
    NEW.appointment_id := public.generate_appointment_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_appointment_id ON public.bookings;
CREATE TRIGGER trigger_set_appointment_id
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_appointment_id();

-- Update existing bookings with appointment IDs
UPDATE public.bookings 
SET appointment_id = public.generate_appointment_id()
WHERE appointment_id IS NULL;

-- Add doctor_cabin_number column to doctors table
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS cabin_number TEXT;

-- Create medical-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for medical-documents bucket
CREATE POLICY "Users can upload their own medical documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own medical documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all medical documents
CREATE POLICY "Admins can view all medical documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-documents' 
  AND has_role(auth.uid(), 'admin')
);

-- Hospital owners can view documents of their patients
CREATE POLICY "Hospitals can view patient documents for their bookings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-documents' 
  AND EXISTS (
    SELECT 1 FROM bookings b
    JOIN hospitals h ON h.id = b.hospital_id
    WHERE h.user_id = auth.uid()
    AND (storage.foldername(name))[1] = b.user_id::text
  )
);

-- Add update policy for documents table to allow admin verification updates
CREATE POLICY "Admins can update document verification"
ON public.documents FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));