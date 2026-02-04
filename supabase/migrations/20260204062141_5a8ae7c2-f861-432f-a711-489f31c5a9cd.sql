-- Add sender_role to messages for proper identification
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'patient';

-- Update existing messages with correct sender roles based on conversation context
UPDATE public.messages m
SET sender_role = CASE 
  WHEN EXISTS (
    SELECT 1 FROM conversations c 
    JOIN hospitals h ON c.hospital_id = h.id 
    WHERE c.id = m.conversation_id AND h.user_id = m.sender_id
  ) THEN 'hospital'
  WHEN EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = m.sender_id AND ur.role = 'admin'
  ) THEN 'admin'
  ELSE 'patient'
END;

-- Create admin conversation access policy
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
CREATE POLICY "Admins can view all conversations"
  ON public.conversations
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create admin message access policies
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages"
  ON public.messages
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can send messages" ON public.messages;
CREATE POLICY "Admins can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a support tickets table for direct admin communication
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'patient',
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create support ticket messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Support ticket policies for users
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Support message policies
CREATE POLICY "Users can view messages for their tickets"
  ON public.support_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t 
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their tickets"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.support_tickets t 
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all support messages"
  ON public.support_messages
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can send support messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updating support ticket timestamp
CREATE TRIGGER update_support_ticket_timestamp
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON public.support_messages(ticket_id);