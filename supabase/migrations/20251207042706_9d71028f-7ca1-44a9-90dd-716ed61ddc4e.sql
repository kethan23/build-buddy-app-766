-- Allow hospital owners to create conversations with patients
CREATE POLICY "Hospital owners can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hospitals
    WHERE hospitals.id = conversations.hospital_id
    AND hospitals.user_id = auth.uid()
  )
);