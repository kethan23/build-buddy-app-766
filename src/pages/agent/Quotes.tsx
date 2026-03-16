import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Send } from 'lucide-react';

const AgentQuotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ patient_id: '', hospital_id: '', message: '' });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setAgentProfile(profile);

      if (profile) {
        const { data: pts } = await supabase
          .from('agent_patients')
          .select('*')
          .eq('agent_id', profile.id);
        setPatients(pts || []);

        // Get patient user IDs for inquiry lookup
        const userIds = (pts || []).filter(p => p.patient_user_id).map(p => p.patient_user_id);
        if (userIds.length > 0) {
          const { data: inqs } = await supabase
            .from('inquiries')
            .select('*, hospitals(name)')
            .in('user_id', userIds)
            .order('created_at', { ascending: false });
          setInquiries(inqs || []);
        }
      }

      // Get verified hospitals for quote requests
      const { data: hosps } = await supabase
        .from('hospitals')
        .select('id, name, city')
        .eq('verification_status', 'verified')
        .eq('is_active', true);
      setHospitals(hosps || []);

      setLoading(false);
    };
    fetch();
  }, [user]);

  const submitQuote = async () => {
    if (!quoteForm.patient_id || !quoteForm.hospital_id || !quoteForm.message.trim()) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const patient = patients.find(p => p.id === quoteForm.patient_id);
    if (!patient?.patient_user_id) {
      toast({ title: 'Error', description: 'Patient must have a login account to submit quotes', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('inquiries').insert({
      user_id: patient.patient_user_id,
      hospital_id: quoteForm.hospital_id,
      treatment_type: patient.preferred_treatment || 'General Consultation',
      message: `[Agent Quote Request - ${agentProfile?.id}]\n${quoteForm.message}`,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Update patient status
    await supabase
      .from('agent_patients')
      .update({ status: 'inquiry_sent' })
      .eq('id', patient.id);

    setDialogOpen(false);
    setQuoteForm({ patient_id: '', hospital_id: '', message: '' });
    toast({ title: 'Quote Requested', description: 'The hospital will respond to the inquiry.' });

    // Refresh inquiries
    const userIds = patients.filter(p => p.patient_user_id).map(p => p.patient_user_id);
    if (userIds.length > 0) {
      const { data: inqs } = await supabase
        .from('inquiries')
        .select('*, hospitals(name)')
        .in('user_id', userIds)
        .order('created_at', { ascending: false });
      setInquiries(inqs || []);
    }
  };

  if (loading) return <AgentLayout><div className="p-8 text-muted-foreground">Loading...</div></AgentLayout>;

  return (
    <AgentLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Quote Requests</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><FileText className="mr-2 h-4 w-4" /> Request Quote</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Quote on Behalf of Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={quoteForm.patient_id} onValueChange={v => setQuoteForm(p => ({ ...p, patient_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name} ({p.agent_patient_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hospital</Label>
                  <Select value={quoteForm.hospital_id} onValueChange={v => setQuoteForm(p => ({ ...p, hospital_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select hospital" /></SelectTrigger>
                    <SelectContent>
                      {hospitals.map(h => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name} - {h.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={quoteForm.message}
                    onChange={e => setQuoteForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe the treatment needed, medical history, and any special requirements..."
                    rows={4}
                  />
                </div>
                <Button onClick={submitQuote} className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Submit Quote Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {inquiries.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">No quotes yet. Request a quote for your patients.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {inquiries.map(inq => {
              const patient = patients.find(p => p.patient_user_id === inq.user_id);
              return (
                <Card key={inq.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">
                          {patient?.full_name || 'Patient'} → {(inq as any).hospitals?.name || 'Hospital'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Treatment: {inq.treatment_type} · {patient?.agent_patient_id}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">{inq.message.replace(/\[Agent.*\]\n/, '')}</p>
                      </div>
                      <Badge variant={inq.status === 'responded' ? 'default' : 'outline'}>
                        {inq.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AgentLayout>
  );
};

export default AgentQuotes;
