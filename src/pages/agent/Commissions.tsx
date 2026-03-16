import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const AgentCommissions = () => {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ pending: 0, paid: 0, total: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data } = await supabase
          .from('agent_commissions')
          .select('*, agent_patients(full_name, agent_patient_id)')
          .eq('agent_id', profile.id)
          .order('created_at', { ascending: false });

        setCommissions(data || []);

        const pending = (data || []).filter(c => c.status === 'pending' || c.status === 'approved')
          .reduce((s, c) => s + Number(c.commission_amount), 0);
        const paid = (data || []).filter(c => c.status === 'paid')
          .reduce((s, c) => s + Number(c.commission_amount), 0);
        setTotals({ pending, paid, total: pending + paid });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'approved': return <TrendingUp className="h-4 w-4 text-primary" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  if (loading) return <AgentLayout><div className="p-8 text-muted-foreground">Loading...</div></AgentLayout>;

  return (
    <AgentLayout>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Commissions</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10"><DollarSign className="h-6 w-6 text-success" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totals.paid.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10"><Clock className="h-6 w-6 text-warning" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totals.pending.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totals.total.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Lifetime Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Commission History</CardTitle></CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No commissions yet.</p>
            ) : (
              <div className="space-y-3">
                {commissions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      {statusIcon(c.status)}
                      <div>
                        <p className="font-medium text-foreground">
                          {c.agent_patients?.full_name || 'Patient'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {c.agent_patients?.agent_patient_id} · Treatment: ${Number(c.treatment_amount).toLocaleString()} · Rate: {c.commission_rate}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${Number(c.commission_amount).toLocaleString()}</p>
                      <Badge variant={c.status === 'paid' ? 'default' : 'outline'}>{c.status}</Badge>
                    </div>
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

export default AgentCommissions;
