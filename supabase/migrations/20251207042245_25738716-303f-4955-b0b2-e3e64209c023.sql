-- Allow hospital owners to view inquiries for their hospital
CREATE POLICY "Hospital owners can view their inquiries"
ON public.inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hospitals
    WHERE hospitals.id = inquiries.hospital_id
    AND hospitals.user_id = auth.uid()
  )
);

-- Allow hospital owners to update inquiries for their hospital (to change status, etc.)
CREATE POLICY "Hospital owners can update their inquiries"
ON public.inquiries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM hospitals
    WHERE hospitals.id = inquiries.hospital_id
    AND hospitals.user_id = auth.uid()
  )
);