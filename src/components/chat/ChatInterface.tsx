import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  is_read: boolean;
}

interface ChatInterfaceProps {
  conversationId: string;
  onVideoCall?: () => void;
}

interface ConversationInfo {
  patient_id: string;
  hospital_id: string;
  patient_name?: string;
  hospital_name?: string;
  patient_patient_id?: string;
}

export default function ChatInterface({ conversationId, onVideoCall }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversationInfo();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId]);

  const fetchConversationInfo = async () => {
    try {
      const { data: conv, error } = await supabase
        .from('conversations')
        .select('patient_id, hospital_id')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Fetch patient and hospital info in parallel
      const [patientResult, hospitalResult] = await Promise.all([
        supabase.from('profiles').select('full_name, patient_id').eq('user_id', conv.patient_id).single(),
        supabase.from('hospitals').select('name').eq('id', conv.hospital_id).single()
      ]);

      setConversationInfo({
        patient_id: conv.patient_id,
        hospital_id: conv.hospital_id,
        patient_name: patientResult.data?.full_name,
        hospital_name: hospitalResult.data?.name,
        patient_patient_id: patientResult.data?.patient_id || undefined,
      });
    } catch (error) {
      console.error('Error fetching conversation info:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text',
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  // Determine if current user is patient or hospital
  const isPatient = user?.id === conversationInfo?.patient_id;
  const otherPartyName = isPatient 
    ? conversationInfo?.hospital_name 
    : conversationInfo?.patient_name;

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div>
          <h3 className="font-semibold">{otherPartyName || 'Conversation'}</h3>
          {!isPatient && conversationInfo?.patient_patient_id && (
            <p className="text-xs text-muted-foreground font-mono">
              {conversationInfo.patient_patient_id}
            </p>
          )}
        </div>
        {onVideoCall && (
          <Button size="sm" variant="outline" onClick={onVideoCall}>
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            const senderName = isOwn 
              ? 'You' 
              : (message.sender_id === conversationInfo?.patient_id 
                  ? conversationInfo?.patient_name?.split(' ')[0] || 'Patient'
                  : conversationInfo?.hospital_name?.split(' ')[0] || 'Hospital');
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {senderName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-md ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.created_at), 'HH:mm')}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button size="icon" variant="outline" disabled>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
