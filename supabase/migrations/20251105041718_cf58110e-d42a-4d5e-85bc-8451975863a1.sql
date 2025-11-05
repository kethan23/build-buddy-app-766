-- Add visa applications table
CREATE TABLE IF NOT EXISTS public.visa_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'in_review', 'approved', 'rejected')),
  country_of_origin TEXT NOT NULL,
  destination_country TEXT DEFAULT 'India',
  passport_number TEXT,
  passport_expiry DATE,
  travel_purpose TEXT DEFAULT 'medical_tourism',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add document categories to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' 
CHECK (category IN ('medical_report', 'travel_document', 'visa_document', 'prescription', 'lab_result', 'general'));

-- Add verification status to documents
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Add treatment stage to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS treatment_stage TEXT DEFAULT 'pending'
CHECK (treatment_stage IN ('pending', 'in_review', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- Add health condition to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS health_condition TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS medical_notes TEXT;

-- Enable RLS on visa_applications
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for visa_applications
CREATE POLICY "Users can view their own visa applications"
ON public.visa_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own visa applications"
ON public.visa_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visa applications"
ON public.visa_applications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all visa applications"
ON public.visa_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all visa applications"
ON public.visa_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update documents RLS to allow hospital access
CREATE POLICY "Hospital owners can view patient documents for their bookings"
ON public.documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.hospitals h ON h.id = b.hospital_id
    WHERE b.user_id = documents.user_id
    AND h.user_id = auth.uid()
  )
);

-- Update trigger for visa_applications
CREATE TRIGGER update_visa_applications_updated_at
BEFORE UPDATE ON public.visa_applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();