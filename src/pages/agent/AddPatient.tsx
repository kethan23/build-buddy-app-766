import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Key } from 'lucide-react';

const AddPatient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createLogin, setCreateLogin] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    country: '',
    city: '',
    nationality: '',
    passport_number: '',
    medical_condition: '',
    medical_notes: '',
    preferred_treatment: '',
    preferred_city: '',
    budget_min: '',
    budget_max: '',
    login_password: '',
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('agent_profiles')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.verification_status === 'verified') setAgentId(data.id);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId || !user) return;

    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: 'Error', description: 'Name and email are required', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      let patientUserId: string | null = null;

      // Create patient user account if login is enabled
      if (createLogin && form.login_password.length >= 6) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.login_password,
          options: {
            data: {
              full_name: form.full_name,
              role: 'patient',
              referred_by_agent: agentId,
            },
          },
        });

        if (signUpError) throw signUpError;
        patientUserId = signUpData.user?.id || null;
      }

      // Create agent patient record
      const { error } = await supabase
        .from('agent_patients')
        .insert({
          agent_id: agentId,
          patient_user_id: patientUserId,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || null,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          country: form.country || null,
          city: form.city || null,
          nationality: form.nationality || null,
          passport_number: form.passport_number || null,
          medical_condition: form.medical_condition || null,
          medical_notes: form.medical_notes || null,
          preferred_treatment: form.preferred_treatment || null,
          preferred_city: form.preferred_city || null,
          budget_min: form.budget_min ? Number(form.budget_min) : null,
          budget_max: form.budget_max ? Number(form.budget_max) : null,
          login_email: createLogin ? form.email : null,
          login_password_set: createLogin && form.login_password.length >= 6,
        });

      if (error) throw error;

      toast({ title: 'Patient Added', description: `${form.full_name} has been registered successfully.` });
      navigate('/agent/patients');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <AgentLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Add New Patient</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Basic details about the patient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Patient full name" required />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="patient@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={v => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input value={form.nationality} onChange={e => update('nationality', e.target.value)} placeholder="American" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={form.country} onChange={e => update('country', e.target.value)} placeholder="United States" />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="New York" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Passport Number</Label>
                  <Input value={form.passport_number} onChange={e => update('passport_number', e.target.value)} placeholder="AB1234567" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Information</CardTitle>
              <CardDescription>Treatment needs and medical details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Medical Condition</Label>
                <Input value={form.medical_condition} onChange={e => update('medical_condition', e.target.value)} placeholder="e.g., Heart condition, Knee problem" />
              </div>
              <div className="space-y-2">
                <Label>Medical Notes</Label>
                <Textarea value={form.medical_notes} onChange={e => update('medical_notes', e.target.value)} placeholder="Previous treatments, medications, allergies..." rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Treatment</Label>
                  <Input value={form.preferred_treatment} onChange={e => update('preferred_treatment', e.target.value)} placeholder="e.g., Knee Replacement" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred City (India)</Label>
                  <Select value={form.preferred_city} onValueChange={v => update('preferred_city', v)}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Kolkata">Kolkata</SelectItem>
                      <SelectItem value="Any">Any City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget Min ($)</Label>
                  <Input type="number" value={form.budget_min} onChange={e => update('budget_min', e.target.value)} placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>Budget Max ($)</Label>
                  <Input type="number" value={form.budget_max} onChange={e => update('budget_max', e.target.value)} placeholder="20000" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5" /> Patient Login Access
              </CardTitle>
              <CardDescription>Create login credentials so the patient can access their own portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={createLogin} onCheckedChange={setCreateLogin} />
                <Label>Create patient login account</Label>
              </div>
              {createLogin && (
                <div className="space-y-2">
                  <Label>Password (min 6 characters)</Label>
                  <Input
                    type="password"
                    value={form.login_password}
                    onChange={e => update('login_password', e.target.value)}
                    placeholder="Set initial password"
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    The patient will use <strong>{form.email}</strong> and this password to log in.
                    They can change it later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="min-w-[200px]">
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? 'Adding Patient...' : 'Add Patient'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/agent/patients')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AgentLayout>
  );
};

export default AddPatient;
