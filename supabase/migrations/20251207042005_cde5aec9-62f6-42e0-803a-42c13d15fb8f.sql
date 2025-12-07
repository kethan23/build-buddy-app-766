-- Drop the existing check constraint and recreate with 'inquiry' type included
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['booking'::text, 'message'::text, 'appointment'::text, 'payment'::text, 'system'::text, 'emergency'::text, 'inquiry'::text]));