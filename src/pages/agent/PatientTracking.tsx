import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FileSearch, Plane, MapPin, Hospital, Stethoscope, Heart, CheckCircle } from 'lucide-react';

const STAGES = [
  { key: 'inquiry', label: 'Inquiry', icon: FileSearch, statusKey: 'inquiry_status', notesKey: 'inquiry_notes' },
  { key: 'visa', label: 'Visa', icon: Plane, statusKey: 'visa_status', notesKey: 'visa_notes' },
  { key: 'travel', label: 'Travel', icon: MapPin, statusKey: 'travel_status', notesKey: 'travel_notes' },
  { key: 'hospital', label: 'Hospital', icon: Hospital, statusKey: 'hospital_status', notesKey: 'hospital_notes' },
  { key: 'treatment', label: 'Treatment', icon: Stethoscope, statusKey: 'treatment_status', notesKey: 'treatment_notes' },
  { key: 'recovery', label: 'Recovery', icon: Heart, statusKey: 'recovery_status', notesKey: 'recovery_notes' },
];

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

const AgentPatientTracking = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setAgentId(profile.id);
        const { data: p } = await supabase
          .from('agent_patients')
          .select('*')
          .eq('id', patientId)
          .eq('agent_id', profile.id)
          .single();
        setPatient(p);

        const { data: t } = await supabase
          .from('patient_journey_tracking')
          .select('*')
          .eq('agent_patient_id', patientId)
          .single();

        if (t) {
          setTracking(t);
          setEditData(t);
        } else if (p) {
          // Auto-create tracking record
          const { data: newT } = await supabase
            .from('patient_journey_tracking')
            .insert({
              patient_id: p.patient_user_id || user.id,
              agent_patient_id: patientId,
              current_stage: 'inquiry',
            })
            .select()
            .single();
          if (newT) {
            setTracking(newT);
            setEditData(newT);
          }
        }
      }
      setLoading(false);
    };
    init();
  }, [user, patientId]);

  const handleSave = async () => {
    if (!tracking) return;
    setSaving(true);

    // Determine current stage based on statuses
    let currentStage = 'inquiry';
    for (const stage of STAGES) {
      if (editData[stage.statusKey] === 'completed') {
        const nextIdx = STAGES.indexOf(stage) + 1;
        if (nextIdx < STAGES.length) currentStage = STAGES[nextIdx].key;
      }
    }

    const updateData: Record<string, any> = { current_stage: currentStage };
    STAGES.forEach((s) => {
      updateData[s.statusKey] = editData[s.statusKey];
      updateData[s.notesKey] = editData[s.notesKey];
    });

    const { error } = await supabase
      .from('patient_journey_tracking')
      .update(updateData)
      .eq('id', tracking.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Journey tracking updated' });
      setTracking({ ...tracking, ...updateData });
    }
    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'on_hold': return 'bg-orange-500';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return <AgentLayout><div className="p-8 text-muted-foreground">Loading...</div></AgentLayout>;
  }

  return (
    <AgentLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/agent/patients')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Journey Tracking: {patient?.full_name}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">{patient?.agent_patient_id}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Pipeline Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              {STAGES.map((stage, idx) => {
                const status = editData[stage.statusKey] || 'not_started';
                const isCompleted = status === 'completed';
                const isActive = status === 'in_progress';
                const Icon = stage.icon;
                return (
                  <div key={stage.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {stage.label}
                      </span>
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stage Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const status = editData[stage.statusKey] || 'not_started';
            return (
              <Card key={stage.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {stage.label}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={status}
                    onValueChange={(v) => setEditData({ ...editData, [stage.statusKey]: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder={`Notes for ${stage.label.toLowerCase()}...`}
                    value={editData[stage.notesKey] || ''}
                    onChange={(e) => setEditData({ ...editData, [stage.notesKey]: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AgentLayout>
  );
};

export default AgentPatientTracking;
