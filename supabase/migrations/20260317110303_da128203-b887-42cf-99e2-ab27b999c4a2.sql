
-- Function to auto-create commission when booking is confirmed for agent-referred patient
CREATE OR REPLACE FUNCTION public.auto_create_agent_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_agent_patient RECORD;
  v_agent_profile RECORD;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
BEGIN
  -- Only trigger when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Check if the booking user is an agent-referred patient
    SELECT ap.* INTO v_agent_patient
    FROM agent_patients ap
    WHERE ap.patient_user_id = NEW.user_id
    LIMIT 1;

    IF v_agent_patient.id IS NOT NULL THEN
      -- Get agent profile for commission rate
      SELECT * INTO v_agent_profile
      FROM agent_profiles
      WHERE id = v_agent_patient.agent_id;

      -- Use negotiated rate if available, otherwise default
      v_commission_rate := COALESCE(v_agent_profile.negotiated_commission_rate, v_agent_profile.default_commission_rate, 5.0);

      -- Calculate commission amount
      v_commission_amount := COALESCE(NEW.total_amount, 0) * v_commission_rate / 100;

      -- Check if commission already exists for this booking
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

        -- Update agent totals
        UPDATE agent_profiles
        SET total_commission_earned = COALESCE(total_commission_earned, 0) + v_commission_amount,
            updated_at = now()
        WHERE id = v_agent_patient.agent_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS trg_auto_agent_commission ON bookings;
CREATE TRIGGER trg_auto_agent_commission
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_agent_commission();
