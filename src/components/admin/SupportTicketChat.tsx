import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  file_url?: string;
  file_name?: string;
  created_at: string;
}

interface Ticket {
  id: string;
  user_id: string;
  user_role: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  user_name?: string;
}

interface SupportTicketChatProps {
  ticketId: string;
  onBack: () => void;
  onStatusChange: () => void;
}

export default function SupportTicketChat({ ticketId, onBack, onStatusChange }: SupportTicketChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicketDetails();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTicketDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', data.user_id)
        .single();

      setTicket({
        ...data,
        user_name: userData?.full_name || 'Unknown User'
      });
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
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
      .channel(`support-messages:${ticketId}`)
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

  const updateTicketStatus = async (newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
      
      setTicket(prev => prev ? { ...prev, status: newStatus } : null);
      onStatusChange();
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('support_messages').insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_role: 'admin',
        content: newMessage.trim()
      });

      if (error) throw error;
      setNewMessage('');

      // Update ticket status to in_progress if it was open
      if (ticket?.status === 'open') {
        await updateTicketStatus('in_progress');
      }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[700px]">
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
                <span className="text-xs text-muted-foreground">{ticket?.user_name}</span>
                <Badge variant="outline" className="text-xs capitalize">{ticket?.user_role}</Badge>
                <Badge variant="outline" className="text-xs">{ticket?.category}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(ticket?.priority || 'normal')}>
              {ticket?.priority}
            </Badge>
            <Select value={ticket?.status} onValueChange={updateTicketStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[600px]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            )}
            {messages.map((message) => {
              const isAdmin = message.sender_role === 'admin';

              return (
                <div key={message.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                      {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isAdmin ? 'items-end' : ''} max-w-[70%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {isAdmin ? 'MediConnect Executive' : ticket?.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      isAdmin 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' 
                        : 'bg-muted'
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
                placeholder="Type your response..."
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
          <div className="p-4 bg-muted text-center text-muted-foreground">
            This ticket has been resolved
          </div>
        )}
      </CardContent>
    </>
  );
}
