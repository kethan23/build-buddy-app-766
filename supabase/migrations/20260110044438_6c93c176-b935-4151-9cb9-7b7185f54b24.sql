-- Phase 1: Extend visa_applications table with additional fields
ALTER TABLE public.visa_applications
ADD COLUMN IF NOT EXISTS embassy_appointment_date timestamptz,
ADD COLUMN IF NOT EXISTS expected_decision_date date,
ADD COLUMN IF NOT EXISTS visa_type text DEFAULT 'medical_visa',
ADD COLUMN IF NOT EXISTS number_of_attendants integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_arrival_date date,
ADD COLUMN IF NOT EXISTS estimated_departure_date date,
ADD COLUMN IF NOT EXISTS accommodation_needed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS airport_pickup_needed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS treatment_details text,
ADD COLUMN IF NOT EXISTS hospital_name text;

-- Create visa_attendants table for companion/attendant information
CREATE TABLE IF NOT EXISTS public.visa_attendants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visa_application_id uuid NOT NULL REFERENCES public.visa_applications(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  relationship text NOT NULL,
  passport_number text,
  passport_expiry date,
  date_of_birth date,
  nationality text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create visa_country_requirements table for dynamic country-based requirements
CREATE TABLE IF NOT EXISTS public.visa_country_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code text NOT NULL,
  country_name text NOT NULL,
  visa_type text NOT NULL DEFAULT 'medical_visa',
  required_documents jsonb DEFAULT '[]'::jsonb,
  processing_time_days integer DEFAULT 15,
  validity_days integer DEFAULT 90,
  extension_available boolean DEFAULT true,
  fees_usd numeric(10,2) DEFAULT 0,
  special_notes text,
  embassy_info jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(country_code, visa_type)
);

-- Enable RLS on new tables
ALTER TABLE public.visa_attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_country_requirements ENABLE ROW LEVEL SECURITY;

-- RLS policies for visa_attendants
CREATE POLICY "Users can view their own visa attendants"
ON public.visa_attendants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.visa_applications va
    WHERE va.id = visa_application_id AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create attendants for their visa applications"
ON public.visa_attendants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.visa_applications va
    WHERE va.id = visa_application_id AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own visa attendants"
ON public.visa_attendants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.visa_applications va
    WHERE va.id = visa_application_id AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own visa attendants"
ON public.visa_attendants FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.visa_applications va
    WHERE va.id = visa_application_id AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all visa attendants"
ON public.visa_attendants FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all visa attendants"
ON public.visa_attendants FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for visa_country_requirements (public read, admin write)
CREATE POLICY "Anyone can view active country requirements"
ON public.visa_country_requirements FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all country requirements"
ON public.visa_country_requirements FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage country requirements"
ON public.visa_country_requirements FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on visa_attendants
CREATE TRIGGER handle_visa_attendants_updated_at
  BEFORE UPDATE ON public.visa_attendants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger for updated_at on visa_country_requirements
CREATE TRIGGER handle_visa_country_requirements_updated_at
  BEFORE UPDATE ON public.visa_country_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some default country requirements for common medical tourism source countries
INSERT INTO public.visa_country_requirements (country_code, country_name, visa_type, required_documents, processing_time_days, validity_days, fees_usd, special_notes)
VALUES
  ('US', 'United States', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof", "travel_insurance"]', 10, 180, 100, 'US citizens can apply for e-Medical Visa online'),
  ('GB', 'United Kingdom', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof", "travel_insurance"]', 10, 180, 100, 'UK citizens eligible for e-Medical Visa'),
  ('AE', 'United Arab Emirates', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof"]', 7, 90, 80, 'Fast-track processing available'),
  ('SA', 'Saudi Arabia', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof", "travel_insurance"]', 10, 90, 80, 'Medical attendant visa available for companions'),
  ('NG', 'Nigeria', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof", "travel_insurance", "bank_statement"]', 15, 90, 100, 'In-person interview may be required'),
  ('KE', 'Kenya', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof", "travel_insurance"]', 12, 90, 80, 'e-Visa available for Kenyan citizens'),
  ('BD', 'Bangladesh', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof"]', 7, 90, 50, 'Fast processing for medical emergencies'),
  ('AF', 'Afghanistan', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof", "travel_insurance", "police_clearance"]', 20, 90, 80, 'Additional security clearance may be required'),
  ('IQ', 'Iraq', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof", "travel_insurance"]', 15, 90, 80, 'Embassy interview required'),
  ('UZ', 'Uzbekistan', 'medical_visa', '["passport", "passport_photo", "medical_reports", "hospital_invitation", "financial_proof"]', 10, 90, 60, 'e-Medical Visa available')
ON CONFLICT (country_code, visa_type) DO NOTHING;

-- Create notification trigger for visa application status changes
CREATE OR REPLACE FUNCTION public.notify_visa_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Notify when workflow stage changes
  IF NEW.workflow_stage IS DISTINCT FROM OLD.workflow_stage THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Visa Application Update',
      CASE NEW.workflow_stage
        WHEN 'documents_submitted' THEN 'Your visa documents have been submitted for review'
        WHEN 'documents_verified' THEN 'Your documents have been verified successfully'
        WHEN 'hospital_letter_pending' THEN 'Waiting for hospital invitation letter'
        WHEN 'hospital_letter_received' THEN 'Hospital invitation letter has been received'
        WHEN 'embassy_submission' THEN 'Your application has been submitted to the embassy'
        WHEN 'embassy_appointment' THEN 'Embassy appointment scheduled for ' || COALESCE(TO_CHAR(NEW.embassy_appointment_date, 'DD Mon YYYY'), 'TBD')
        WHEN 'under_review' THEN 'Your visa application is under review'
        WHEN 'approved' THEN 'Congratulations! Your visa has been approved'
        WHEN 'rejected' THEN 'Unfortunately, your visa application was not approved. Please check the details.'
        ELSE 'Your visa application status has been updated'
      END,
      'visa',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for visa status notifications
DROP TRIGGER IF EXISTS notify_visa_status_trigger ON public.visa_applications;
CREATE TRIGGER notify_visa_status_trigger
  AFTER UPDATE ON public.visa_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_visa_status_change();