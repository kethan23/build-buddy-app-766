-- Allow hospitals to view documents from patients in their conversations
CREATE POLICY "Hospital can view chat documents from patients"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-documents' 
  AND EXISTS (
    SELECT 1 FROM conversations c
    JOIN hospitals h ON h.id = c.hospital_id
    WHERE h.user_id = auth.uid()
    AND (storage.foldername(name))[1] = c.patient_id::text
  )
);

-- Allow patients to view documents from hospitals in their conversations  
CREATE POLICY "Patients can view chat documents in their conversations"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1 FROM conversations c
    JOIN hospitals h ON h.id = c.hospital_id
    WHERE c.patient_id = auth.uid()
    AND (storage.foldername(name))[1] = h.user_id::text
  )
);

-- Allow hospital users to upload documents in chat
CREATE POLICY "Hospital users can upload chat documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'medical-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM hospitals WHERE user_id = auth.uid()
  )
);