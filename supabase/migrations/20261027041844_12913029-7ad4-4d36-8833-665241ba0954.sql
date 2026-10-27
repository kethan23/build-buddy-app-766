-- ============================================================
-- Security hardening: protect authorization relationships and
-- financially/admin-significant fields from client-side edits
-- ============================================================

-- Internal marker so the automated commission trigger can bump the
-- agent's earned-total without tripping the profile protection below.
CREATE OR REPLACE FUNCTION public.commission_internal_marker()
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS _agent_commission_internal(flag int);
END $$;

-- 1. agent_profiles: verification/commission columns are admin-only
CREATE OR REPLACE FUNCTION public.protect_agent_profile_integrity()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_marker boolean := to_regclass('_agent_commission_internal') IS NOT NULL;
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.default_commission_rate IS DISTINCT FROM OLD.default_commission_rate
     OR NEW.negotiated_commission_rate IS DISTINCT FROM OLD.negotiated_commission_rate
     OR NEW.verified_by IS DISTINCT FROM OLD.verified_by
     OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.total_patients_referred IS DISTINCT FROM OLD.total_patients_referred
     OR (NOT v_marker AND NEW.total_commission_earned IS DISTINCT FROM OLD.total_commission_earned) THEN
    RAISE EXCEPTION 'Only administrators can change agent verification or commission settings';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_protect_agent_profile ON public.agent_profiles;
CREATE TRIGGER trg_protect_agent_profile BEFORE UPDATE ON public.agent_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_agent_profile_integrity();

-- 2. agent_patients: immutable patient linkage; link only the referred patient
CREATE OR REPLACE FUNCTION public.protect_agent_patient_link()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.patient_user_id IS DISTINCT FROM OLD.patient_user_id THEN
    RAISE EXCEPTION 'Referral patient linkage cannot be changed';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.patient_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = NEW.patient_user_id
        AND u.raw_user_meta_data->>'referred_by_agent' = NEW.agent_id::text
    ) THEN
      RAISE EXCEPTION 'Patient account can only be linked to the agent who referred their signup';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_protect_agent_patient_link ON public.agent_patients;
CREATE TRIGGER trg_protect_agent_patient_link BEFORE INSERT OR UPDATE ON public.agent_patients
FOR EACH ROW EXECUTE FUNCTION public.protect_agent_patient_link();

-- 3. conversations: participants immutable after creation
CREATE OR REPLACE FUNCTION public.protect_conversation_participants()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.patient_id IS DISTINCT FROM OLD.patient_id
     OR NEW.hospital_id IS DISTINCT FROM OLD.hospital_id THEN
    RAISE EXCEPTION 'Conversation participants cannot be changed';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_protect_conversation_participants ON public.conversations;
CREATE TRIGGER trg_protect_conversation_participants BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.protect_conversation_participants();

-- 4. conversations: hospital-created conversations must tie to a real inquiry
DROP POLICY IF EXISTS "Hospital owners can create conversations" ON public.conversations;
CREATE POLICY "Hospital owners can create conversations for their inquiries"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.hospitals h
          WHERE h.id = conversations.hospital_id AND h.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.inquiries i
          WHERE i.id = conversations.inquiry_id
            AND i.user_id = conversations.patient_id
            AND i.hospital_id = conversations.hospital_id)
);

-- 5. inquiry_messages: sender must belong to the inquiry
DROP POLICY IF EXISTS "Users can send messages to their inquiries" ON public.inquiry_messages;
CREATE POLICY "Users can send messages to their inquiries"
ON public.inquiry_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND (
    EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = inquiry_messages.inquiry_id AND i.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.inquiries i JOIN public.hospitals h ON h.id = i.hospital_id
               WHERE i.id = inquiry_messages.inquiry_id AND h.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 6. payments: only for your own booking (or admin)
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
CREATE POLICY "Users can create payments for their own bookings"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = payments.booking_id AND b.user_id = auth.uid())
);

-- 7. visa_applications: patient updates removed (admin-only, matches the UI)
DROP POLICY IF EXISTS "Users can update their own visa applications" ON public.visa_applications;

-- 8. bookings: patients cannot change booking status themselves
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- 9. agent_negotiation_messages: sender identity is enforced server-side
DROP POLICY IF EXISTS "Agents can send messages in their negotiations" ON public.agent_negotiation_messages;
CREATE POLICY "Agents can send messages in their negotiations"
ON public.agent_negotiation_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND sender_role = 'agent'
  AND EXISTS (SELECT 1 FROM public.agent_negotiations n JOIN public.agent_profiles a ON a.id = n.agent_id
              WHERE n.id = agent_negotiation_messages.negotiation_id AND a.user_id = auth.uid())
);

-- 10. agent_negotiations: agents cannot pre-approve their own rate
DROP POLICY IF EXISTS "Agents can create negotiations" ON public.agent_negotiations;
CREATE POLICY "Agents can create negotiations"
ON public.agent_negotiations FOR INSERT TO authenticated
WITH CHECK (
  status = 'pending'
  AND approved_rate IS NULL
  AND admin_response IS NULL
  AND EXISTS (SELECT 1 FROM public.agent_profiles a
              WHERE a.id = agent_negotiations.agent_id AND a.user_id = auth.uid())
);

-- 11. agent_patient_documents: document must belong to the same agent's referral
DROP POLICY IF EXISTS "Agents can manage documents for their patients" ON public.agent_patient_documents;
CREATE POLICY "Agents can manage documents for their patients"
ON public.agent_patient_documents FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.agent_profiles ap WHERE ap.id = agent_patient_documents.agent_id AND ap.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.agent_patients apr WHERE apr.id = agent_patient_documents.agent_patient_id AND apr.agent_id = agent_patient_documents.agent_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.agent_profiles ap WHERE ap.id = agent_patient_documents.agent_id AND ap.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.agent_patients apr WHERE apr.id = agent_patient_documents.agent_patient_id AND apr.agent_id = agent_patient_documents.agent_id)
);

-- 12. hospitals: approval/visibility columns are admin-only
CREATE OR REPLACE FUNCTION public.protect_hospital_integrity()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.rating IS DISTINCT FROM OLD.rating
     OR NEW.total_reviews IS DISTINCT FROM OLD.total_reviews THEN
    RAISE EXCEPTION 'Only administrators can change hospital verification or rating';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_protect_hospital_integrity ON public.hospitals;
CREATE TRIGGER trg_protect_hospital_integrity BEFORE UPDATE ON public.hospitals
FOR EACH ROW EXECUTE FUNCTION public.protect_hospital_integrity();

-- 13. create_hospital_profile: callers can only create their own hospital
CREATE OR REPLACE FUNCTION public.create_hospital_profile(p_user_id uuid, p_name text, p_email text, p_city text, p_country text, p_phone text, p_description text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_hospital_id uuid;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not allowed to create a hospital for another user';
  END IF;
  INSERT INTO public.hospitals (
    user_id, name, email, city, country, phone, description,
    verification_status, is_active
  ) VALUES (
    p_user_id, p_name, p_email, p_city, p_country, p_phone, p_description,
    'pending', false
  )
  RETURNING id INTO v_hospital_id;
  RETURN v_hospital_id;
END;
$function$;

-- 14. visa notifications: match the real 6-stage workflow; embassy-discretion wording
CREATE OR REPLACE FUNCTION public.notify_visa_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.workflow_stage IS DISTINCT FROM OLD.workflow_stage THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Visa Application Update',
      CASE NEW.workflow_stage
        WHEN 'documents_uploaded' THEN 'Your visa documents have been uploaded for review'
        WHEN 'admin_verification' THEN 'Your documents are being verified by our team'
        WHEN 'hospital_letter_verified' THEN 'Your hospital invitation letter has been verified'
        WHEN 'visa_support_approved' THEN 'Your visa support documents have been approved and issued. Final visa approval is decided solely by the embassy'
        WHEN 'sent_to_embassy' THEN 'Your application has been submitted to the embassy. The final decision rests with the embassy'
        WHEN 'completed' THEN 'Your visa assistance journey is complete. Final visa decisions are made by the embassy'
        ELSE 'Your visa application status has been updated'
      END,
      'visa',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 15. commission trigger: mark its session so the profile protection allows the earned-total bump
CREATE OR REPLACE FUNCTION public.auto_create_agent_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_agent_patient RECORD;
  v_agent_profile RECORD;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
BEGIN
  PERFORM public.commission_internal_marker();
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    SELECT ap.* INTO v_agent_patient
    FROM agent_patients ap
    WHERE ap.patient_user_id = NEW.user_id
    LIMIT 1;

    IF v_agent_patient.id IS NOT NULL THEN
      SELECT * INTO v_agent_profile
      FROM agent_profiles
      WHERE id = v_agent_patient.agent_id;

      v_commission_rate := COALESCE(v_agent_profile.negotiated_commission_rate, v_agent_profile.default_commission_rate, 5.0);
      v_commission_amount := COALESCE(NEW.total_amount, 0) * v_commission_rate / 100;

      IF NOT EXISTS (SELECT 1 FROM agent_commissions WHERE booking_id = NEW.id) THEN
        INSERT INTO agent_commissions (
          agent_id, agent_patient_id, booking_id,
          treatment_amount, commission_rate, commission_amount,
          status
        ) VALUES (
          v_agent_patient.agent_id, v_agent_patient.id, NEW.id,
          COALESCE(NEW.total_amount, 0), v_commission_rate, v_commission_amount,
          'pending'
        );

        UPDATE agent_profiles
        SET total_commission_earned = COALESCE(total_commission_earned, 0) + v_commission_amount,
            updated_at = now()
        WHERE id = v_agent_patient.agent_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 16. Trigger/helper functions are not directly callable from the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_agent_commission() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_hospital_new_inquiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_patient_booking_confirmed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_patient_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_patient_payment_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_visa_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_appointment_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_inquiry_first_response() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_patient_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_checklist_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_conversation_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_visa_stage_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_agent_patient_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_appointment_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_patient_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_agent_profile_integrity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_agent_patient_link() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_conversation_participants() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_hospital_integrity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.commission_internal_marker() FROM PUBLIC, anon, authenticated;