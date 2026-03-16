import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Eye, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AgentPatients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setAgentId(profile.id);
        const { data } = await supabase
          .from('agent_patients')
          .select('*')
          .eq('agent_id', profile.id)
          .order('created_at', { ascending: false });
        setPatients(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.agent_patient_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'booked': case 'in_treatment': return 'default';
      case 'quote_received': return 'secondary';
      default: return 'outline';
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: 'Copied', description: `Patient ID ${id} copied to clipboard` });
  };

  if (loading) {
    return <AgentLayout><div className="p-8 text-muted-foreground">Loading...</div></AgentLayout>;
  }

  return (
    <AgentLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
          <Button asChild>
            <Link to="/agent/patients/new"><UserPlus className="mr-2 h-4 w-4" /> Add Patient</Link>
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No patients found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground text-lg">{patient.full_name}</h3>
                        <Badge variant={statusColor(patient.status)}>
                          {patient.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded">{patient.agent_patient_id}</span>
                        <button onClick={() => copyId(patient.agent_patient_id)} className="hover:text-foreground">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                        <span>{patient.email}</span>
                        {patient.phone && <span>{patient.phone}</span>}
                        {patient.country && <span>{patient.country}</span>}
                      </div>
                      {patient.medical_condition && (
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">Condition:</span>{' '}
                          <span className="text-foreground">{patient.medical_condition}</span>
                        </p>
                      )}
                      {patient.preferred_treatment && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Treatment:</span>{' '}
                          <span className="text-foreground">{patient.preferred_treatment}</span>
                        </p>
                      )}
                      {(patient.budget_min || patient.budget_max) && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Budget:</span>{' '}
                          <span className="text-foreground">
                            ${patient.budget_min?.toLocaleString() || '0'} - ${patient.budget_max?.toLocaleString() || '∞'}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={patient.login_password_set ? 'default' : 'outline'} className="text-xs">
                        {patient.login_password_set ? 'Login Active' : 'No Login'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AgentLayout>
  );
};

export default AgentPatients;
