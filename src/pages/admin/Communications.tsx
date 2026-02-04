import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, Users, Building2, Search, 
  Clock, AlertCircle, CheckCircle, Filter 
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import AdminChatInterface from '@/components/admin/AdminChatInterface';
import SupportTicketChat from '@/components/admin/SupportTicketChat';

interface Conversation {
  id: string;
  patient_id: string;
  hospital_id: string;
  status: string;
  last_message_at: string;
  created_at: string;
  patient?: { full_name: string; patient_id: string };
  hospital?: { name: string };
  message_count?: number;
}

interface SupportTicket {
  id: string;
  user_id: string;
  user_role: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: { full_name: string };
}

export default function AdminCommunications() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (activeTab === 'conversations') {
      fetchConversations();
    } else {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(count)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch patient and hospital names separately
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const [patientRes, hospitalRes] = await Promise.all([
            supabase.from('profiles').select('full_name, patient_id').eq('user_id', conv.patient_id).single(),
            supabase.from('hospitals').select('name').eq('id', conv.hospital_id).single()
          ]);
          
          return {
            ...conv,
            patient: patientRes.data || { full_name: 'Unknown', patient_id: '' },
            hospital: hospitalRes.data || { name: 'Unknown' },
            message_count: conv.messages?.[0]?.count || 0
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user names
      const ticketsWithUsers = await Promise.all(
        (data || []).map(async (ticket) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', ticket.user_id)
            .single();
          
          return {
            ...ticket,
            user: userData || { full_name: 'Unknown' }
          };
        })
      );

      setTickets(ticketsWithUsers);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.hospital?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Communications Center</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage all platform communications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Patient-Hospital Chats
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Support Tickets
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value="conversations" className="mt-0">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">All Conversations</CardTitle>
                <CardDescription>
                  {filteredConversations.length} active conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedConversation === conv.id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex -space-x-2">
                            <Avatar className="h-8 w-8 border-2 border-background">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {conv.patient?.full_name?.substring(0, 2).toUpperCase() || 'PA'}
                              </AvatarFallback>
                            </Avatar>
                            <Avatar className="h-8 w-8 border-2 border-background">
                              <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                {conv.hospital?.name?.substring(0, 2).toUpperCase() || 'HO'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {conv.patient?.full_name}
                              </p>
                              <Badge variant="outline" className="text-xs ml-2">
                                {conv.message_count}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.hospital?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat View */}
            <Card className="lg:col-span-2">
              {selectedConversation ? (
                <AdminChatInterface 
                  conversationId={selectedConversation}
                  onBack={() => setSelectedConversation(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[700px] text-center p-8">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Conversation</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a patient-hospital conversation from the list to view messages 
                    and intervene if needed.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-0">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Ticket List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Support Tickets</CardTitle>
                <CardDescription>
                  {filteredTickets.filter(t => t.status !== 'resolved').length} open tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-2">
                    {filteredTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedTicket === ticket.id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getStatusIcon(ticket.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">{ticket.subject}</p>
                              <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {ticket.user?.full_name} • {ticket.user_role}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredTickets.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No support tickets found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Ticket Chat */}
            <Card className="lg:col-span-2">
              {selectedTicket ? (
                <SupportTicketChat 
                  ticketId={selectedTicket}
                  onBack={() => setSelectedTicket(null)}
                  onStatusChange={fetchTickets}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[700px] text-center p-8">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Ticket</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a support ticket from the list to view and respond to user inquiries.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
