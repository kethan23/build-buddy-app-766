
-- Revoke EXECUTE on SECURITY DEFINER trigger/internal functions from anon and authenticated.
-- These functions are only invoked by triggers, column defaults, or service_role code paths,
-- so end users should not be able to call them directly.

REVOKE EXECUTE ON FUNCTION public.generate_patient_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_appointment_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_agent_patient_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_conversation_timestamp() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_appointment_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_patient_id() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_agent_commission() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_hospital_new_inquiry() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_patient_booking_confirmed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_patient_new_message() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_patient_payment_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_visa_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_visa_stage_timestamp() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_checklist_timestamp() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_inquiry_first_response() FROM anon, authenticated;

-- has_role and create_hospital_profile are intentionally callable by signed-in users:
--   * has_role is used inside RLS policies
--   * create_hospital_profile is a client RPC used during hospital onboarding
