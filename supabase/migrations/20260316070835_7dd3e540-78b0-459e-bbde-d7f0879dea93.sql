
-- Add 'agent' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';

-- Agent profiles table
CREATE TABLE public.agent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  agency_name text,
  contact_person text NOT NULL,
  phone text,
  email text NOT NULL,
  country text,
  city text,
  address text,
  website text,
  license_number text,
  description text,
  logo_url text,
  default_commission_rate numeric DEFAULT 5.0,
  negotiated_commission_rate numeric,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  is_active boolean DEFAULT false,
  verified_by uuid,
  verified_at timestamptz,
  total_patients_referred integer DEFAULT 0,
  total_commission_earned numeric DEFAULT 0,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- Generate agent patient ID
CREATE OR REPLACE FUNCTION public.generate_agent_patient_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_id TEXT;
  done BOOL;
BEGIN
  done := FALSE;
  WHILE NOT done LOOP
    new_id := 'AGP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    done := NOT EXISTS(SELECT 1 FROM agent_patients WHERE agent_patient_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$;

-- Agent patients (patients created by agents)
CREATE TABLE public.agent_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
  patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_patient_id text UNIQUE DEFAULT public.generate_agent_patient_id(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  gender text,
  country text,
  city text,
  nationality text,
  passport_number text,
  medical_condition text,
  medical_notes text,
  preferred_treatment text,
  preferred_city text,
  budget_min numeric,
  budget_max numeric,
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'inquiry_sent', 'quote_received', 'booked', 'in_treatment', 'completed', 'cancelled')),
  login_email text,
  login_password_set boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_patients ENABLE ROW LEVEL SECURITY;

-- Agent commissions
CREATE TABLE public.agent_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
  agent_patient_id uuid REFERENCES public.agent_patients(id),
  booking_id uuid REFERENCES public.bookings(id),
  treatment_amount numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 5.0,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed', 'cancelled')),
  payment_date timestamptz,
  payment_reference text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_commissions ENABLE ROW LEVEL SECURITY;

-- Agent negotiation messages (for commission negotiation with admin)
CREATE TABLE public.agent_negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'rejected')),
  requested_rate numeric,
  approved_rate numeric,
  admin_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_negotiations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.agent_negotiation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id uuid NOT NULL REFERENCES public.agent_negotiations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('agent', 'admin')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_negotiation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_profiles
CREATE POLICY "Agents can view their own profile" ON public.agent_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agents can update their own profile" ON public.agent_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Agents can insert their own profile" ON public.agent_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all agent profiles" ON public.agent_profiles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for agent_patients
CREATE POLICY "Agents can view their own patients" ON public.agent_patients FOR SELECT USING (EXISTS (SELECT 1 FROM agent_profiles WHERE agent_profiles.id = agent_patients.agent_id AND agent_profiles.user_id = auth.uid()));
CREATE POLICY "Agents can create patients" ON public.agent_patients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM agent_profiles WHERE agent_profiles.id = agent_patients.agent_id AND agent_profiles.user_id = auth.uid()));
CREATE POLICY "Agents can update their patients" ON public.agent_patients FOR UPDATE USING (EXISTS (SELECT 1 FROM agent_profiles WHERE agent_profiles.id = agent_patients.agent_id AND agent_profiles.user_id = auth.uid()));
CREATE POLICY "Admins can manage all agent patients" ON public.agent_patients FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Hospital owners can view agent patients for their inquiries" ON public.agent_patients FOR SELECT USING (EXISTS (SELECT 1 FROM inquiries i JOIN hospitals h ON h.id = i.hospital_id WHERE i.user_id = agent_patients.patient_user_id AND h.user_id = auth.uid()));

-- RLS Policies for agent_commissions
CREATE POLICY "Agents can view their own commissions" ON public.agent_commissions FOR SELECT USING (EXISTS (SELECT 1 FROM agent_profiles WHERE agent_profiles.id = agent_commissions.agent_id AND agent_profiles.user_id = auth.uid()));
CREATE POLICY "Admins can manage all commissions" ON public.agent_commissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for agent_negotiations
CREATE POLICY "Agents can view their own negotiations" ON public.agent_negotiations FOR SELECT USING (EXISTS (SELECT 1 FROM agent_profiles WHERE agent_profiles.id = agent_negotiations.agent_id AND agent_profiles.user_id = auth.uid()));
CREATE POLICY "Agents can create negotiations" ON public.agent_negotiations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM agent_profiles WHERE agent_profiles.id = agent_negotiations.agent_id AND agent_profiles.user_id = auth.uid()));
CREATE POLICY "Admins can manage all negotiations" ON public.agent_negotiations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for agent_negotiation_messages
CREATE POLICY "Agents can view messages in their negotiations" ON public.agent_negotiation_messages FOR SELECT USING (EXISTS (SELECT 1 FROM agent_negotiations n JOIN agent_profiles a ON a.id = n.agent_id WHERE n.id = agent_negotiation_messages.negotiation_id AND a.user_id = auth.uid()));
CREATE POLICY "Agents can send messages in their negotiations" ON public.agent_negotiation_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM agent_negotiations n JOIN agent_profiles a ON a.id = n.agent_id WHERE n.id = agent_negotiation_messages.negotiation_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins can manage all negotiation messages" ON public.agent_negotiation_messages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_agent_profiles_updated_at BEFORE UPDATE ON public.agent_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_agent_patients_updated_at BEFORE UPDATE ON public.agent_patients FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_agent_commissions_updated_at BEFORE UPDATE ON public.agent_commissions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_agent_negotiations_updated_at BEFORE UPDATE ON public.agent_negotiations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Update handle_new_user to support agent role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'patient'::app_role
  );
  
  -- Prevent admin role assignment via signup
  IF user_role = 'admin' THEN
    user_role := 'patient'::app_role;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;
