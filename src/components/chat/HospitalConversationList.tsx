import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Loader2 } from 'lucide-react';

interface Conversation {
  id: string;
  patient_id: string;
  hospital_id: string;
  status: string;
  last_message_at: string;
  patient: {
    full_name: string;
    patient_id: string | null;
  } | null;
  unread_count: number;
  last_message?: string;
}

interface HospitalConversationListProps {
  onSelect: (conversationId: string) => void;
  selectedId?: string;
}

export default function HospitalConversationList({ onSelect, selectedId }: HospitalConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitalAndConversations();
  }, [user]);

  useEffect(() => {
    if (hospitalId) {
      const channel = supabase
        .channel('hospital-conversations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `hospital_id=eq.${hospitalId}`,
          },
          () => {
            fetchConversations(hospitalId);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          () => {
            fetchConversations(hospitalId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [hospitalId]);

  const fetchHospitalAndConversations = async () => {
    if (!user) return;

    try {
      // Get hospital for this user
      const { data: hospital, error: hospitalError } = await supabase
        .from('hospitals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (hospitalError) throw hospitalError;
      if (!hospital) {
        setLoading(false);
        return;
      }

      setHospitalId(hospital.id);
      await fetchConversations(hospital.id);
    } catch (error) {
      console.error('Error fetching hospital:', error);
      setLoading(false);
    }
  };

  const fetchConversations = async (hId: string) => {
    try {
      // Fetch conversations for this hospital
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          patient_id,
          hospital_id,
          status,
          last_message_at,
          created_at
        `)
        .eq('hospital_id', hId)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (convError) throw convError;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get patient IDs
      const patientIds = [...new Set(conversationsData.map(c => c.patient_id))];
      
      // Fetch patient profiles and messages in parallel
      const [profilesResult, messagesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name, patient_id')
          .in('user_id', patientIds),
        supabase
          .from('messages')
          .select('id, conversation_id, is_read, sender_id, content, created_at')
          .in('conversation_id', conversationsData.map(c => c.id))
          .order('created_at', { ascending: false })
      ]);

      const profilesMap = new Map(
        profilesResult.data?.map(p => [p.user_id, p]) || []
      );

      // Group messages by conversation
      const messagesByConv = new Map<string, typeof messagesResult.data>();
      messagesResult.data?.forEach(m => {
        const existing = messagesByConv.get(m.conversation_id) || [];
        existing.push(m);
        messagesByConv.set(m.conversation_id, existing);
      });

      const conversationsWithDetails = conversationsData.map(conv => {
        const msgs = messagesByConv.get(conv.id) || [];
        const unreadCount = msgs.filter(m => !m.is_read && m.sender_id === conv.patient_id).length;
        const lastMsg = msgs[0];

        return {
          ...conv,
          patient: profilesMap.get(conv.patient_id) || null,
          unread_count: unreadCount,
          last_message: lastMsg?.content?.substring(0, 50) || undefined,
        };
      });

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hospitalId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No hospital profile</h3>
        <p className="text-sm text-muted-foreground">
          Please set up your hospital profile first
        </p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8 border rounded-lg bg-muted/10">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          When patients send inquiries and you start a chat, conversations will appear here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] border rounded-lg">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              selectedId === conversation.id
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {conversation.patient?.full_name?.substring(0, 2).toUpperCase() || 'PT'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">
                    {conversation.patient?.full_name || 'Unknown Patient'}
                  </h4>
                  {conversation.unread_count > 0 && (
                    <Badge variant="default" className="shrink-0">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
                {conversation.patient?.patient_id && (
                  <p className="text-xs text-muted-foreground font-mono mb-1">
                    {conversation.patient.patient_id}
                  </p>
                )}
                {conversation.last_message && (
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.last_message}...
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {conversation.last_message_at 
                    ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                    : 'No messages yet'
                  }
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
