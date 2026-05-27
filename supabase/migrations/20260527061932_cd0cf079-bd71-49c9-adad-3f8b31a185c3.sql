
-- 1. Privilege escalation fix: remove open INSERT policy on user_roles
DROP POLICY IF EXISTS "Allow trigger to insert user roles" ON public.user_roles;

-- 2. Hospital-images: scope DELETE/UPDATE to the owner of the specific hospital folder
DROP POLICY IF EXISTS "Hospital owners can delete their images" ON storage.objects;
DROP POLICY IF EXISTS "Hospital owners can update their images" ON storage.objects;

CREATE POLICY "Hospital owners can delete their images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'hospital-images'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.hospitals h
      WHERE h.user_id = auth.uid()
        AND h.id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Hospital owners can update their images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'hospital-images'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.hospitals h
      WHERE h.user_id = auth.uid()
        AND h.id::text = (storage.foldername(name))[1]
    )
  )
);

-- Also scope the INSERT policy (defense-in-depth)
DROP POLICY IF EXISTS "Hospital owners can upload their images" ON storage.objects;
CREATE POLICY "Hospital owners can upload their images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'hospital-images'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.hospitals h
      WHERE h.user_id = auth.uid()
        AND h.id::text = (storage.foldername(name))[1]
    )
  )
);

-- 3. Medical-documents: fix broken hospital view policies (use object path, not hospital name)
DROP POLICY IF EXISTS "Hospital can view chat documents from patients" ON storage.objects;
DROP POLICY IF EXISTS "Hospitals can view patient documents for their bookings" ON storage.objects;
DROP POLICY IF EXISTS "Patients can view chat documents in their conversations" ON storage.objects;

CREATE POLICY "Hospital can view chat documents from patients"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.hospitals h ON h.id = c.hospital_id
    WHERE h.user_id = auth.uid()
      AND (storage.foldername(name))[1] = c.patient_id::text
  )
);

CREATE POLICY "Hospitals can view patient documents for their bookings"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.hospitals h ON h.id = b.hospital_id
    WHERE h.user_id = auth.uid()
      AND (storage.foldername(name))[1] = b.user_id::text
  )
);

CREATE POLICY "Patients can view chat documents in their conversations"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. OTP exposure: revoke column read on otp fields from authenticated users
REVOKE SELECT (otp_code, otp_expires_at) ON public.patient_journey_tracking FROM authenticated;
REVOKE SELECT (otp_code, otp_expires_at) ON public.patient_journey_tracking FROM anon;
