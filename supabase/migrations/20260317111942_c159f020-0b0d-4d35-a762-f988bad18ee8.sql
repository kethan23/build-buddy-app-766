
-- Patient journey tracking table for linear pipeline
CREATE TABLE public.patient_journey_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  agent_patient_id uuid REFERENCES public.agent_patients(id) ON DELETE CASCADE,
  current_stage text NOT NULL DEFAULT 'inquiry',
  inquiry_status text DEFAULT 'pending',
  inquiry_notes text,
  visa_status text DEFAULT 'not_started',
  visa_notes text,
  travel_status text DEFAULT 'not_started',
  travel_notes text,
  hospital_status text DEFAULT 'not_started',
  hospital_notes text,
  treatment_status text DEFAULT 'not_started',
  treatment_notes text,
  recovery_status text DEFAULT 'not_started',
  recovery_notes text,
  updated_by uuid,
  otp_code text,
  otp_expires_at timestamp with time zone,
  otp_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.patient_journey_tracking ENABLE ROW LEVEL SECURITY;

-- Agent documents for patients
CREATE TABLE public.agent_patient_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
  agent_patient_id uuid NOT NULL REFERENCES public.agent_patients(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  file_type text,
  description text,
  category text DEFAULT 'medical',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.agent_patient_documents ENABLE ROW LEVEL SECURITY;

-- RLS for patient_journey_tracking
CREATE POLICY "Agents can manage tracking for their patients" ON public.patient_journey_tracking
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM agent_patients ap
  JOIN agent_profiles a ON a.id = ap.agent_id
  WHERE ap.id = patient_journey_tracking.agent_patient_id
  AND a.user_id = auth.uid()
));

CREATE POLICY "Patients can view their own tracking" ON public.patient_journey_tracking
FOR SELECT TO authenticated
USING (patient_id = auth.uid());

CREATE POLICY "Patients can update their own tracking after OTP" ON public.patient_journey_tracking
FOR UPDATE TO authenticated
USING (patient_id = auth.uid() AND otp_verified = true);

CREATE POLICY "Admins can manage all tracking" ON public.patient_journey_tracking
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS for agent_patient_documents
CREATE POLICY "Agents can manage documents for their patients" ON public.agent_patient_documents
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM agent_profiles WHERE id = agent_patient_documents.agent_id AND user_id = auth.uid()
));

CREATE POLICY "Patients can view their documents via agent_patients" ON public.agent_patient_documents
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM agent_patients WHERE id = agent_patient_documents.agent_patient_id AND patient_user_id = auth.uid()
));

CREATE POLICY "Admins can manage all agent documents" ON public.agent_patient_documents
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER handle_patient_journey_updated_at
  BEFORE UPDATE ON public.patient_journey_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
