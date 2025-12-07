-- Allow hospital owners to view profiles of patients who have inquiries with their hospital
CREATE POLICY "Hospital owners can view patient profiles for their inquiries"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM inquiries i
    JOIN hospitals h ON h.id = i.hospital_id
    WHERE i.user_id = profiles.user_id
    AND h.user_id = auth.uid()
  )
);