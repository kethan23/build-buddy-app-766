import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, Clock, CheckCircle, AlertCircle, 
  Plus, ArrowRight, Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CreateSupportTicket from '@/components/support/CreateSupportTicket';
import SupportChatView from '@/components/support/SupportChatView';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function MySupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Support Tickets</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your support requests
            </p>
          </div>
          <CreateSupportTicket 
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            }
            onCreated={fetchTickets}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Tickets</CardTitle>
              <CardDescription>
                {tickets.filter(t => t.status !== 'resolved').length} open, {tickets.filter(t => t.status === 'resolved').length} resolved
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-1 p-2">
                  {tickets.map((ticket) => (
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
                          <p className="text-sm font-medium truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                            <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                  {tickets.length === 0 && (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">No tickets yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Need help? Create a support ticket
                      </p>
                      <CreateSupportTicket onCreated={fetchTickets} />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat View */}
          <Card className="lg:col-span-2">
            {selectedTicket ? (
              <SupportChatView 
                ticketId={selectedTicket}
                onBack={() => setSelectedTicket(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Ticket</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a ticket from the list to view the conversation with our support team.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
