-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all inquiries
CREATE POLICY "Admins can view all inquiries"
ON public.inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all inquiries
CREATE POLICY "Admins can update all inquiries"
ON public.inquiries
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));