import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Plus, Send } from 'lucide-react';

const AgentNegotiations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedNeg, setSelectedNeg] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNeg, setNewNeg] = useState({ subject: '', requested_rate: '', message: '' });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setAgentProfile(profile);

      if (profile) {
        const { data } = await supabase
          .from('agent_negotiations')
          .select('*')
          .eq('agent_id', profile.id)
          .order('created_at', { ascending: false });
        setNegotiations(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const loadMessages = async (neg: any) => {
    setSelectedNeg(neg);
    const { data } = await supabase
      .from('agent_negotiation_messages')
      .select('*')
      .eq('negotiation_id', neg.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedNeg || !user) return;
    const { error } = await supabase.from('agent_negotiation_messages').insert({
      negotiation_id: selectedNeg.id,
      sender_id: user.id,
      sender_role: 'agent',
      content: newMessage.trim(),
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setNewMessage('');
      loadMessages(selectedNeg);
    }
  };

  const createNegotiation = async () => {
    if (!agentProfile || !newNeg.subject.trim()) return;
    const { data, error } = await supabase.from('agent_negotiations').insert({
      agent_id: agentProfile.id,
      subject: newNeg.subject,
      requested_rate: newNeg.requested_rate ? Number(newNeg.requested_rate) : null,
    }).select().single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Add initial message
    if (newNeg.message.trim() && user) {
      await supabase.from('agent_negotiation_messages').insert({
        negotiation_id: data.id,
        sender_id: user.id,
        sender_role: 'agent',
        content: newNeg.message,
      });
    }

    setDialogOpen(false);
    setNewNeg({ subject: '', requested_rate: '', message: '' });
    // Refresh
    const { data: updated } = await supabase
      .from('agent_negotiations')
      .select('*')
      .eq('agent_id', agentProfile.id)
      .order('created_at', { ascending: false });
    setNegotiations(updated || []);
    toast({ title: 'Negotiation Started', description: 'An admin will respond shortly.' });
  };

  if (loading) return <AgentLayout><div className="p-8 text-muted-foreground">Loading...</div></AgentLayout>;

  return (
    <AgentLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Commission Negotiations</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Negotiation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Commission Negotiation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={newNeg.subject} onChange={e => setNewNeg(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Request higher commission rate" />
                </div>
                <div className="space-y-2">
                  <Label>Requested Commission Rate (%)</Label>
                  <Input type="number" value={newNeg.requested_rate} onChange={e => setNewNeg(p => ({ ...p, requested_rate: e.target.value }))} placeholder="10" min="1" max="50" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={newNeg.message} onChange={e => setNewNeg(p => ({ ...p, message: e.target.value }))} placeholder="Explain why you'd like a different rate..." rows={3} />
                </div>
                <Button onClick={createNegotiation} className="w-full">Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Negotiations List */}
          <div className="space-y-3">
            {negotiations.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No negotiations yet.</CardContent></Card>
            ) : negotiations.map(neg => (
              <Card
                key={neg.id}
                className={`cursor-pointer transition-colors ${selectedNeg?.id === neg.id ? 'border-primary' : 'hover:border-muted-foreground/30'}`}
                onClick={() => loadMessages(neg)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{neg.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {neg.requested_rate}%
                        {neg.approved_rate && ` · Approved: ${neg.approved_rate}%`}
                      </p>
                    </div>
                    <Badge variant={neg.status === 'resolved' ? 'default' : 'outline'}>{neg.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            {selectedNeg ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg">{selectedNeg.subject}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_role === 'agent' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_role === 'agent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-xs opacity-70 mb-1">{msg.sender_role === 'admin' ? 'MediConnect Admin' : 'You'}</p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                {selectedNeg.status !== 'resolved' && selectedNeg.status !== 'rejected' && (
                  <div className="p-4 border-t border-border flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Select a negotiation to view messages</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AgentLayout>
  );
};

export default AgentNegotiations;
