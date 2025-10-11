-- Fix critical security issue: Remove unrestricted notification INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create database triggers for automated notifications

-- 1. Notify hospital when new inquiry is received
CREATE OR REPLACE FUNCTION notify_hospital_new_inquiry()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hospital_owner_id UUID;
BEGIN
  -- Get hospital owner user_id
  SELECT user_id INTO v_hospital_owner_id
  FROM hospitals
  WHERE id = NEW.hospital_id;
  
  IF v_hospital_owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      v_hospital_owner_id,
      'New Patient Inquiry',
      'You have received a new inquiry for ' || NEW.treatment_type,
      'inquiry',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_hospital_new_inquiry
AFTER INSERT ON inquiries
FOR EACH ROW
EXECUTE FUNCTION notify_hospital_new_inquiry();

-- 2. Notify patient when booking is confirmed
CREATE OR REPLACE FUNCTION notify_patient_booking_confirmed()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Booking Confirmed',
      'Your booking for ' || NEW.treatment_name || ' has been confirmed',
      'booking',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_patient_booking_confirmed
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_patient_booking_confirmed();

-- 3. Notify patient when new message is received
CREATE OR REPLACE FUNCTION notify_patient_new_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_patient_id UUID;
  v_conversation_hospital_id UUID;
  v_recipient_id UUID;
BEGIN
  -- Get conversation details
  SELECT patient_id, hospital_id INTO v_conversation_patient_id, v_conversation_hospital_id
  FROM conversations
  WHERE id = NEW.conversation_id;
  
  -- Determine recipient (opposite of sender)
  IF NEW.sender_id = v_conversation_patient_id THEN
    -- Message from patient to hospital, notify hospital owner
    SELECT user_id INTO v_recipient_id
    FROM hospitals
    WHERE id = v_conversation_hospital_id;
  ELSE
    -- Message from hospital to patient, notify patient
    v_recipient_id := v_conversation_patient_id;
  END IF;
  
  IF v_recipient_id IS NOT NULL AND v_recipient_id != NEW.sender_id THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      v_recipient_id,
      'New Message',
      substring(NEW.content, 1, 100),
      'message',
      NEW.conversation_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_patient_new_message();

-- 4. Notify patient when payment status changes
CREATE OR REPLACE FUNCTION notify_patient_payment_status()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'completed' THEN 'Payment Successful'
        WHEN NEW.status = 'failed' THEN 'Payment Failed'
        ELSE 'Payment Status Updated'
      END,
      CASE 
        WHEN NEW.status = 'completed' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' was processed successfully'
        WHEN NEW.status = 'failed' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' failed. Please try again'
        ELSE 'Your payment status has been updated to: ' || NEW.status
      END,
      'payment',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_payment_status
AFTER UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION notify_patient_payment_status();