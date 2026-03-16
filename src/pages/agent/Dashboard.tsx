import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, DollarSign, FileText, TrendingUp, UserPlus, AlertCircle } from 'lucide-react';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [stats, setStats] = useState({ patients: 0, pendingCommissions: 0, totalEarned: 0, activeQuotes: 0 });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Get agent profile
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setAgentProfile(profile);

      if (profile) {
        // Get patients
        const { data: patients, count } = await supabase
          .from('agent_patients')
          .select('*', { count: 'exact' })
          .eq('agent_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentPatients(patients || []);

        // Get commissions
        const { data: commissions } = await supabase
          .from('agent_commissions')
          .select('*')
          .eq('agent_id', profile.id);

        const pending = commissions?.filter(c => c.status === 'pending').length || 0;
        const earned = commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

        setStats({
          patients: count || 0,
          pendingCommissions: pending,
          totalEarned: earned,
          activeQuotes: patients?.filter(p => p.status === 'quote_received').length || 0,
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <AgentLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AgentLayout>
    );
  }

  // Show pending verification message
  if (agentProfile && agentProfile.verification_status !== 'verified') {
    return (
      <AgentLayout>
        <div className="p-8 max-w-2xl mx-auto mt-20">
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-warning mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Account Pending Verification</h2>
              <p className="text-muted-foreground">
                Your agent account is currently <Badge variant="outline" className="ml-1">{agentProfile.verification_status}</Badge>.
                A MediConnect admin will review and verify your account shortly.
              </p>
              <p className="text-sm text-muted-foreground">
                Once verified, you'll be able to add patients, request quotes, and track commissions.
              </p>
            </CardContent>
          </Card>
        </div>
      </AgentLayout>
    );
  }

  // No profile yet — prompt to create
  if (!agentProfile) {
    return (
      <AgentLayout>
        <div className="p-8 max-w-2xl mx-auto mt-20">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Complete Your Agent Profile</h2>
              <p className="text-muted-foreground">Set up your agent profile to start referring patients.</p>
              <Button asChild>
                <Link to="/agent/profile">Set Up Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {agentProfile.contact_person}
          </h1>
          <p className="text-muted-foreground mt-1">
            {agentProfile.agency_name && `${agentProfile.agency_name} · `}
            Commission Rate: {agentProfile.negotiated_commission_rate || agentProfile.default_commission_rate}%
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.patients}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${stats.totalEarned.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <FileText className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pendingCommissions}</p>
                <p className="text-sm text-muted-foreground">Pending Commissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeQuotes}</p>
                <p className="text-sm text-muted-foreground">Active Quotes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/agent/patients/new">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Patient
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/agent/negotiations">
              Negotiate Commission
            </Link>
          </Button>
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No patients yet. Add your first patient to get started.</p>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.agent_patient_id} · {patient.medical_condition || 'No condition specified'}
                      </p>
                    </div>
                    <Badge variant={
                      patient.status === 'completed' ? 'default' :
                      patient.status === 'booked' ? 'default' :
                      'secondary'
                    }>
                      {patient.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AgentLayout>
  );
};

export default AgentDashboard;
