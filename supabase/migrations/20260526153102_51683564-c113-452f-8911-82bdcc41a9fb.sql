
-- Wave 2 & 3 supporting tables

-- 1. Treatment cost estimator (seed data)
CREATE TABLE public.treatment_cost_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_key text NOT NULL UNIQUE,
  treatment_name text NOT NULL,
  india_avg_usd numeric NOT NULL,
  us_avg_usd numeric NOT NULL,
  uk_avg_usd numeric,
  uae_avg_usd numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.treatment_cost_estimates TO anon, authenticated;
GRANT ALL ON public.treatment_cost_estimates TO service_role;
ALTER TABLE public.treatment_cost_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cost estimates are public" ON public.treatment_cost_estimates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage cost estimates" ON public.treatment_cost_estimates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.treatment_cost_estimates (treatment_key, treatment_name, india_avg_usd, us_avg_usd, uk_avg_usd, uae_avg_usd) VALUES
('heart-bypass', 'Heart Bypass Surgery (CABG)', 7000, 123000, 40000, 44000),
('knee-replacement', 'Knee Replacement', 6000, 50000, 22000, 18000),
('hip-replacement', 'Hip Replacement', 7000, 40000, 20000, 19000),
('hair-transplant', 'Hair Transplant', 2000, 15000, 8000, 6500),
('ivf-cycle', 'IVF Treatment (1 cycle)', 3500, 20000, 8500, 9000),
('liver-transplant', 'Liver Transplant', 36000, 300000, 175000, 165000),
('spine-surgery', 'Spinal Fusion', 8500, 100000, 38000, 33000),
('dental-implant', 'Dental Implant (per tooth)', 800, 4500, 2500, 1800),
('cosmetic-rhinoplasty', 'Rhinoplasty', 3500, 9000, 6500, 5500),
('cancer-chemotherapy', 'Cancer Chemotherapy (per cycle)', 1500, 12000, 6000, 5000);

-- 2. Per-hospital medical data consent
CREATE TABLE public.medical_data_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'medical_documents',
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (patient_id, hospital_id, scope)
);
GRANT SELECT, INSERT, UPDATE ON public.medical_data_consents TO authenticated;
GRANT ALL ON public.medical_data_consents TO service_role;
ALTER TABLE public.medical_data_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own consents" ON public.medical_data_consents FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Patients grant/revoke own consents" ON public.medical_data_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients update own consents" ON public.medical_data_consents FOR UPDATE TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Hospital owners view consents granted to them" ON public.medical_data_consents FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.hospitals h WHERE h.id = medical_data_consents.hospital_id AND h.user_id = auth.uid()));
CREATE POLICY "Admins view all consents" ON public.medical_data_consents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Hospital quick replies
CREATE TABLE public.hospital_quick_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  label text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_quick_replies TO authenticated;
GRANT ALL ON public.hospital_quick_replies TO service_role;
ALTER TABLE public.hospital_quick_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hospital owners manage own quick replies" ON public.hospital_quick_replies FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.hospitals h WHERE h.id = hospital_quick_replies.hospital_id AND h.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.hospitals h WHERE h.id = hospital_quick_replies.hospital_id AND h.user_id = auth.uid()));

-- 4. Notification preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  booking_updates boolean NOT NULL DEFAULT true,
  message_alerts boolean NOT NULL DEFAULT true,
  visa_updates boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification prefs" ON public.notification_preferences FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Inquiry first-response tracking
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS first_response_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_inquiry_first_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inquiry public.inquiries%ROWTYPE;
  v_is_hospital_user boolean;
BEGIN
  SELECT * INTO v_inquiry FROM public.inquiries WHERE id = NEW.inquiry_id;
  IF v_inquiry.id IS NULL OR v_inquiry.first_response_at IS NOT NULL THEN
    RETURN NEW;
  END IF;
  -- check sender is the hospital owner for this inquiry
  SELECT EXISTS (
    SELECT 1 FROM public.hospitals h
    WHERE h.id = v_inquiry.hospital_id AND h.user_id = NEW.sender_id
  ) INTO v_is_hospital_user;
  IF v_is_hospital_user THEN
    UPDATE public.inquiries SET first_response_at = NEW.created_at WHERE id = v_inquiry.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inquiry_first_response ON public.inquiry_messages;
CREATE TRIGGER trg_inquiry_first_response
AFTER INSERT ON public.inquiry_messages
FOR EACH ROW EXECUTE FUNCTION public.set_inquiry_first_response();
