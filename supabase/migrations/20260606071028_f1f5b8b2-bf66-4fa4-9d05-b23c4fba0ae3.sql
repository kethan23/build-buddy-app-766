
-- Allow agents to view bookings of patients they manage
CREATE POLICY "Agents can view bookings for their referred patients"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.agent_patients ap
    JOIN public.agent_profiles agp ON agp.id = ap.agent_id
    WHERE agp.user_id = auth.uid()
      AND ap.patient_user_id = bookings.user_id
  )
);

-- Allow agents to view payments of patients they manage
CREATE POLICY "Agents can view payments for their referred patients"
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.agent_patients ap
    JOIN public.agent_profiles agp ON agp.id = ap.agent_id
    WHERE agp.user_id = auth.uid()
      AND ap.patient_user_id = payments.user_id
  )
);
