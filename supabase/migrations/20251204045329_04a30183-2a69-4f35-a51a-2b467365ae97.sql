-- Create storage bucket for hospital images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hospital-images', 'hospital-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for hospital images
CREATE POLICY "Anyone can view hospital images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hospital-images');

CREATE POLICY "Hospital owners can upload their images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hospital-images' 
  AND auth.uid() IS NOT NULL
  AND (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Hospital owners can update their images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hospital-images' 
  AND auth.uid() IS NOT NULL
  AND (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Hospital owners can delete their images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hospital-images' 
  AND auth.uid() IS NOT NULL
  AND (
    EXISTS (
      SELECT 1 FROM public.hospitals 
      WHERE user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Add delete policy for hospitals (admin only)
CREATE POLICY "Admins can delete hospitals"
ON public.hospitals FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add delete cascade for hospital gallery
CREATE POLICY "Hospital owners can delete their gallery images"
ON public.hospital_gallery FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.hospitals 
    WHERE hospitals.id = hospital_gallery.hospital_id 
    AND hospitals.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);