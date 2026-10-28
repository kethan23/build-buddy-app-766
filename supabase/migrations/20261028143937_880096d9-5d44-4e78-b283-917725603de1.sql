-- Newsletter subscribers (anonymous marketing signups)
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to the newsletter"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Auto-link patient-uploaded visa documents to the admin verification checklist
CREATE OR REPLACE FUNCTION public.link_visa_document_to_checklist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.visa_application_id IS NOT NULL THEN
    UPDATE public.visa_document_checklist
      SET is_uploaded = true,
          document_id = NEW.id,
          updated_at = now()
      WHERE visa_application_id = NEW.visa_application_id
        AND document_type = NEW.document_type;

    IF NOT FOUND THEN
      INSERT INTO public.visa_document_checklist (
        visa_application_id, document_type, is_uploaded, document_id
      ) VALUES (
        NEW.visa_application_id, COALESCE(NEW.document_type, 'other'), true, NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_link_visa_document_checklist
AFTER INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.link_visa_document_to_checklist();