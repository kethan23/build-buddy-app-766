-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  established_year INTEGER,
  bed_capacity INTEGER,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  working_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hospital_specialties table
CREATE TABLE public.hospital_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  specialty_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER,
  photo_url TEXT,
  bio TEXT,
  languages JSONB,
  consultation_fee DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create treatment_packages table
CREATE TABLE public.treatment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  duration_days INTEGER,
  recovery_days INTEGER,
  inclusions JSONB,
  exclusions JSONB,
  is_active BOOLEAN DEFAULT true,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hospital_gallery table
CREATE TABLE public.hospital_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hospital_certifications table
CREATE TABLE public.hospital_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_body TEXT,
  issue_date DATE,
  expiry_date DATE,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_logs table for audit trail
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals
CREATE POLICY "Anyone can view verified hospitals"
  ON public.hospitals FOR SELECT
  USING (verification_status = 'verified' AND is_active = true);

CREATE POLICY "Hospital owners can view their hospital"
  ON public.hospitals FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Hospital owners can update their hospital"
  ON public.hospitals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Hospital owners can insert their hospital"
  ON public.hospitals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all hospitals"
  ON public.hospitals FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for hospital_specialties
CREATE POLICY "Anyone can view specialties of verified hospitals"
  ON public.hospital_specialties FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = hospital_specialties.hospital_id
    AND hospitals.verification_status = 'verified'
  ));

CREATE POLICY "Hospital owners can manage their specialties"
  ON public.hospital_specialties FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = hospital_specialties.hospital_id
    AND hospitals.user_id = auth.uid()
  ));

-- RLS Policies for doctors
CREATE POLICY "Anyone can view doctors of verified hospitals"
  ON public.doctors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = doctors.hospital_id
    AND hospitals.verification_status = 'verified'
  ));

CREATE POLICY "Hospital owners can manage their doctors"
  ON public.doctors FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = doctors.hospital_id
    AND hospitals.user_id = auth.uid()
  ));

-- RLS Policies for treatment_packages
CREATE POLICY "Anyone can view packages of verified hospitals"
  ON public.treatment_packages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = treatment_packages.hospital_id
    AND hospitals.verification_status = 'verified'
  ) AND is_active = true);

CREATE POLICY "Hospital owners can manage their packages"
  ON public.treatment_packages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = treatment_packages.hospital_id
    AND hospitals.user_id = auth.uid()
  ));

-- RLS Policies for appointments
CREATE POLICY "Patients can view their appointments"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Hospital owners can view their appointments"
  ON public.appointments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = appointments.hospital_id
    AND hospitals.user_id = auth.uid()
  ));

CREATE POLICY "Hospital owners can manage their appointments"
  ON public.appointments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = appointments.hospital_id
    AND hospitals.user_id = auth.uid()
  ));

CREATE POLICY "Patients can insert appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- RLS Policies for hospital_gallery
CREATE POLICY "Anyone can view gallery of verified hospitals"
  ON public.hospital_gallery FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = hospital_gallery.hospital_id
    AND hospitals.verification_status = 'verified'
  ));

CREATE POLICY "Hospital owners can manage their gallery"
  ON public.hospital_gallery FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = hospital_gallery.hospital_id
    AND hospitals.user_id = auth.uid()
  ));

-- RLS Policies for hospital_certifications
CREATE POLICY "Anyone can view certifications of verified hospitals"
  ON public.hospital_certifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = hospital_certifications.hospital_id
    AND hospitals.verification_status = 'verified'
  ));

CREATE POLICY "Hospital owners can manage their certifications"
  ON public.hospital_certifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.hospitals
    WHERE hospitals.id = hospital_certifications.hospital_id
    AND hospitals.user_id = auth.uid()
  ));

-- RLS Policies for admin_logs
CREATE POLICY "Admins can view all logs"
  ON public.admin_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update inquiries table to link to hospitals
ALTER TABLE public.inquiries
  ADD CONSTRAINT inquiries_hospital_id_fkey
  FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE CASCADE;

-- Update bookings table to link to hospitals
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_hospital_id_fkey
  FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE CASCADE;

-- Add hospital role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hospital';

-- Create triggers for updated_at
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_treatment_packages_updated_at
  BEFORE UPDATE ON public.treatment_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();