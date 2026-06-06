
-- 1. ai_chat_sessions: remove anonymous-row exposure
DROP POLICY IF EXISTS "Users can manage their own AI chat sessions" ON public.ai_chat_sessions;
CREATE POLICY "Users can manage their own AI chat sessions"
ON public.ai_chat_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. search_analytics: remove anonymous-row exposure
DROP POLICY IF EXISTS "Users can view their own search analytics" ON public.search_analytics;
CREATE POLICY "Users can view their own search analytics"
ON public.search_analytics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. storage.objects: fix broken hospital medical-documents policies (use object path, not hospital name)
DROP POLICY IF EXISTS "Hospital can view chat documents from patients" ON storage.objects;
CREATE POLICY "Hospital can view chat documents from patients"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1
    FROM conversations c
    JOIN hospitals h ON h.id = c.hospital_id
    WHERE h.user_id = auth.uid()
      AND (storage.foldername(name))[1] = (c.patient_id)::text
  )
);

DROP POLICY IF EXISTS "Hospitals can view patient documents for their bookings" ON storage.objects;
CREATE POLICY "Hospitals can view patient documents for their bookings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1
    FROM bookings b
    JOIN hospitals h ON h.id = b.hospital_id
    WHERE h.user_id = auth.uid()
      AND (storage.foldername(name))[1] = (b.user_id)::text
  )
);
