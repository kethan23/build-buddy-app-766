-- Fix function search path for notify_visa_status_change (already has it but recreating for clarity)
-- Fix search path for update_visa_stage_timestamp
CREATE OR REPLACE FUNCTION public.update_visa_stage_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.workflow_stage IS DISTINCT FROM OLD.workflow_stage THEN
    NEW.stage_updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix search path for update_checklist_timestamp
CREATE OR REPLACE FUNCTION public.update_checklist_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;