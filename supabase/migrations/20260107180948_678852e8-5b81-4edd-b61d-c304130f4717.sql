-- Add RLS policy for hospitals to view documents from patients who have inquiries
CREATE POLICY "Hospital owners can view documents for inquiry patients"
ON public.documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM inquiries i
    JOIN hospitals h ON h.id = i.hospital_id
    WHERE i.user_id = documents.user_id
    AND h.user_id = auth.uid()
  )
);