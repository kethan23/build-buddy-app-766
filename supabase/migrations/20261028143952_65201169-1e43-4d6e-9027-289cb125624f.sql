REVOKE SELECT ON public.newsletter_subscribers FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.link_visa_document_to_checklist() FROM anon, authenticated, PUBLIC;