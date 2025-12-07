-- Drop the existing check constraint and recreate with 'quote' type included
ALTER TABLE public.messages DROP CONSTRAINT messages_message_type_check;

ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check 
CHECK (message_type = ANY (ARRAY['text'::text, 'file'::text, 'image'::text, 'video'::text, 'quote'::text]));