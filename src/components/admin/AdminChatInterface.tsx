import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, ArrowLeft, User, Building2, Shield, 
  Paperclip, AlertTriangle, Loader2 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

interface ConversationInfo {
  patient_id: string;
  hospital_id: string;
  patient_name: string;
  hospital_name: string;
  patient_patient_id?: string;
  created_at: string;
}

interface AdminChatInterfaceProps {
  conversationId: string;
  onBack: () => void;
}

export default function AdminChatInterface({ conversationId, onBack }: AdminChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversationDetails();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversationDetails = async () => {
    try {
      const { data: conv, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const [patientRes, hospitalRes] = await Promise.all([
        supabase.from('profiles').select('full_name, patient_id').eq('user_id', conv.patient_id).single(),
        supabase.from('hospitals').select('name').eq('id', conv.hospital_id).single()
      ]);

      setConversationInfo({
        patient_id: conv.patient_id,
        hospital_id: conv.hospital_id,
        patient_name: patientRes.data?.full_name || 'Unknown Patient',
        hospital_name: hospitalRes.data?.name || 'Unknown Hospital',
        patient_patient_id: patientRes.data?.patient_id || undefined,
        created_at: conv.created_at
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`admin-messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_role: 'admin',
        content: newMessage.trim(),
        message_type: 'text'
      });

      if (error) throw error;
      setNewMessage('');
      toast.success('Message sent as MediConnect Executive');
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

  const getSenderInfo = (message: Message) => {
    if (message.sender_role === 'admin') {
      return { 
        name: 'MediConnect Executive', 
        icon: Shield, 
        color: 'bg-purple-100 text-purple-700',
        badgeColor: 'bg-purple-500'
      };
    }
    if (message.sender_id === conversationInfo?.patient_id) {
      return { 
        name: conversationInfo?.patient_name || 'Patient', 
        icon: User, 
        color: 'bg-blue-100 text-blue-700',
        badgeColor: 'bg-blue-500'
      };
    }
    return { 
      name: conversationInfo?.hospital_name || 'Hospital', 
      icon: Building2, 
      color: 'bg-green-100 text-green-700',
      badgeColor: 'bg-green-500'
    };
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
              <CardTitle className="text-lg">Conversation Overview</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">{conversationInfo?.patient_name}</span>
                </div>
                <span className="text-xs text-muted-foreground">↔</span>
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">{conversationInfo?.hospital_name}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[600px]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const senderInfo = getSenderInfo(message);
              const SenderIcon = senderInfo.icon;
              const isAdmin = message.sender_role === 'admin';

              return (
                <div key={message.id} className={`flex gap-3 ${isAdmin ? 'bg-purple-50/50 dark:bg-purple-950/20 -mx-4 px-4 py-2 rounded-lg' : ''}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={senderInfo.color}>
                      <SenderIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{senderInfo.name}</span>
                      {isAdmin && (
                        <Badge className="bg-purple-500 text-xs">Executive</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <div className={`rounded-lg px-4 py-2 inline-block ${
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

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700 dark:text-purple-300">
              Messages sent will appear as "MediConnect Executive"
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type your message as executive..."
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
      </CardContent>
    </>
  );
}
