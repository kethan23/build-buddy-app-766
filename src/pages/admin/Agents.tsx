import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Eye, Users, DollarSign, MessageSquare } from 'lucide-react';

const AdminAgents = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [agentPatients, setAgentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [negDetailOpen, setNegDetailOpen] = useState(false);
  const [selectedNeg, setSelectedNeg] = useState<any>(null);
  const [negMessages, setNegMessages] = useState<any[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [approveRate, setApproveRate] = useState('');

  useEffect(() => {
    fetchAgents();
    fetchNegotiations();
  }, []);

  const fetchAgents = async () => {
    const { data } = await supabase
      .from('agent_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setAgents(data || []);
    setLoading(false);
  };

  const fetchNegotiations = async () => {
    const { data } = await supabase
      .from('agent_negotiations')
      .select('*, agent_profiles(contact_person, agency_name)')
      .order('created_at', { ascending: false });
    setNegotiations(data || []);
  };

  const updateAgentStatus = async (agentId: string, status: string) => {
    const { error } = await supabase
      .from('agent_profiles')
      .update({
        verification_status: status,
        is_active: status === 'verified',
        verified_at: status === 'verified' ? new Date().toISOString() : null,
      })
      .eq('id', agentId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Agent ${status}` });
      fetchAgents();
    }
  };

  const viewAgentDetails = async (agent: any) => {
    setSelectedAgent(agent);
    const { data } = await supabase
      .from('agent_patients')
      .select('*')
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false });
    setAgentPatients(data || []);
    setDetailOpen(true);
  };

  const openNegotiation = async (neg: any) => {
    setSelectedNeg(neg);
    const { data } = await supabase
      .from('agent_negotiation_messages')
      .select('*')
      .eq('negotiation_id', neg.id)
      .order('created_at', { ascending: true });
    setNegMessages(data || []);
    setNegDetailOpen(true);
  };

  const sendAdminMessage = async () => {
    if (!adminMessage.trim() || !selectedNeg) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('agent_negotiation_messages').insert({
      negotiation_id: selectedNeg.id,
      sender_id: user.id,
      sender_role: 'admin',
      content: adminMessage,
    });

    setAdminMessage('');
    const { data } = await supabase
      .from('agent_negotiation_messages')
      .select('*')
      .eq('negotiation_id', selectedNeg.id)
      .order('created_at', { ascending: true });
    setNegMessages(data || []);
  };

  const resolveNegotiation = async () => {
    if (!selectedNeg) return;
    const rate = approveRate ? Number(approveRate) : null;

    await supabase
      .from('agent_negotiations')
      .update({ status: 'resolved', approved_rate: rate })
      .eq('id', selectedNeg.id);

    if (rate) {
      await supabase
        .from('agent_profiles')
        .update({ negotiated_commission_rate: rate })
        .eq('id', selectedNeg.agent_id);
    }

    toast({ title: 'Negotiation Resolved' });
    setNegDetailOpen(false);
    fetchNegotiations();
    fetchAgents();
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="p-8 text-muted-foreground">Loading...</div></div>;

  const pendingAgents = agents.filter(a => a.verification_status === 'pending');
  const verifiedAgents = agents.filter(a => a.verification_status === 'verified');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Agent Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div><p className="text-xl font-bold">{agents.length}</p><p className="text-xs text-muted-foreground">Total Agents</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-success" />
            <div><p className="text-xl font-bold">{verifiedAgents.length}</p><p className="text-xs text-muted-foreground">Verified</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Eye className="h-5 w-5 text-warning" />
            <div><p className="text-xl font-bold">{pendingAgents.length}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-accent" />
            <div><p className="text-xl font-bold">{negotiations.filter(n => n.status === 'open').length}</p><p className="text-xs text-muted-foreground">Open Negotiations</p></div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="agents">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="negotiations">Negotiations ({negotiations.filter(n => n.status !== 'resolved').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Patients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map(agent => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.contact_person}</TableCell>
                        <TableCell>{agent.agency_name || '-'}</TableCell>
                        <TableCell>{agent.country || '-'}</TableCell>
                        <TableCell>{agent.negotiated_commission_rate || agent.default_commission_rate}%</TableCell>
                        <TableCell>{agent.total_patients_referred}</TableCell>
                        <TableCell>
                          <Badge variant={agent.verification_status === 'verified' ? 'default' : 'outline'}>
                            {agent.verification_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => viewAgentDetails(agent)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            {agent.verification_status === 'pending' && (
                              <>
                                <Button size="sm" variant="default" onClick={() => updateAgentStatus(agent.id, 'verified')}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => updateAgentStatus(agent.id, 'rejected')}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {agent.verification_status === 'verified' && (
                              <Button size="sm" variant="outline" onClick={() => updateAgentStatus(agent.id, 'suspended')}>
                                Suspend
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="negotiations">
            <div className="space-y-3">
              {negotiations.map(neg => (
                <Card key={neg.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openNegotiation(neg)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{neg.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {neg.agent_profiles?.contact_person} ({neg.agent_profiles?.agency_name}) · Requested: {neg.requested_rate}%
                      </p>
                    </div>
                    <Badge variant={neg.status === 'resolved' ? 'default' : 'outline'}>{neg.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedAgent?.contact_person} - Details</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Agency:</span> {selectedAgent.agency_name || '-'}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedAgent.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedAgent.phone || '-'}</div>
                <div><span className="text-muted-foreground">Country:</span> {selectedAgent.country || '-'}</div>
                <div><span className="text-muted-foreground">License:</span> {selectedAgent.license_number || '-'}</div>
                <div><span className="text-muted-foreground">Commission:</span> {selectedAgent.negotiated_commission_rate || selectedAgent.default_commission_rate}%</div>
              </div>
              {selectedAgent.description && (
                <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
              )}
              <h3 className="font-semibold">Patients ({agentPatients.length})</h3>
              {agentPatients.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
                  <div>
                    <p className="font-medium">{p.full_name}</p>
                    <p className="text-muted-foreground">{p.agent_patient_id} · {p.medical_condition || 'No condition'}</p>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Negotiation Dialog */}
      <Dialog open={negDetailOpen} onOpenChange={setNegDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedNeg?.subject}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-3 py-4">
            {negMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender_role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-foreground' : 'bg-muted text-foreground'
                }`}>
                  <p className="text-xs opacity-70 mb-1">{msg.sender_role === 'admin' ? 'Admin' : 'Agent'}</p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedNeg?.status !== 'resolved' && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex gap-2">
                <Input value={adminMessage} onChange={e => setAdminMessage(e.target.value)} placeholder="Reply..."
                  onKeyDown={e => e.key === 'Enter' && sendAdminMessage()} />
                <Button onClick={sendAdminMessage} size="sm">Send</Button>
              </div>
              <div className="flex gap-2 items-center">
                <Input value={approveRate} onChange={e => setApproveRate(e.target.value)} placeholder="Approve rate %" type="number" className="w-32" />
                <Button onClick={resolveNegotiation} size="sm" variant="default">Resolve</Button>
                <Button onClick={() => {
                  supabase.from('agent_negotiations').update({ status: 'rejected' }).eq('id', selectedNeg.id).then(() => {
                    setNegDetailOpen(false);
                    fetchNegotiations();
                    toast({ title: 'Negotiation Rejected' });
                  });
                }} size="sm" variant="destructive">Reject</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminAgents;
