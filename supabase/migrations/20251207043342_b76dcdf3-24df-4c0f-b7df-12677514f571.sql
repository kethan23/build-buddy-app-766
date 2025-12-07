-- Allow hospital owners to view bookings for their hospital
CREATE POLICY "Hospital owners can view their bookings"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hospitals
    WHERE hospitals.id = bookings.hospital_id
    AND hospitals.user_id = auth.uid()
  )
);

-- Allow hospital owners to update bookings for their hospital
CREATE POLICY "Hospital owners can update their bookings"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM hospitals
    WHERE hospitals.id = bookings.hospital_id
    AND hospitals.user_id = auth.uid()
  )
);

-- Allow admins to view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all bookings
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));