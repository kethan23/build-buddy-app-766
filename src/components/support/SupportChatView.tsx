import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, ArrowLeft, User, Shield, Loader2,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SupportMessage {
  id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
}

interface SupportChatViewProps {
  ticketId: string;
  onBack: () => void;
}

export default function SupportChatView({ ticketId, onBack }: SupportChatViewProps) {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicket();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTicket = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (!error && data) setTicket(data);
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`user-support-messages:${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `ticket_id=eq.${ticketId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as SupportMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('support_messages').insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_role: role || 'patient',
        content: newMessage.trim()
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': 
        return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" />Open</Badge>;
      case 'in_progress': 
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
      case 'resolved': 
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Resolved</Badge>;
      default: 
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-lg">{ticket?.subject}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{ticket?.category}</Badge>
              </div>
            </div>
          </div>
          {ticket && getStatusBadge(ticket.status)}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[520px]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const isAdmin = message.sender_role === 'admin';

              return (
                <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-primary/10 text-primary'}>
                      {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isOwn ? 'items-end' : ''} max-w-[70%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {isAdmin ? 'MediConnect Executive' : 'You'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      isAdmin 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <Separator />

        {ticket?.status !== 'resolved' ? (
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
              />
              <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 text-center text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5 inline-block mr-2" />
            This ticket has been resolved. Need more help? Create a new ticket.
          </div>
        )}
      </CardContent>
    </>
  );
}
