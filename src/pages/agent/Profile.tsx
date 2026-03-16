import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const AgentProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    agency_name: '',
    contact_person: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    address: '',
    website: '',
    license_number: '',
    description: '',
  });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          agency_name: data.agency_name || '',
          contact_person: data.contact_person || '',
          phone: data.phone || '',
          email: data.email || '',
          country: data.country || '',
          city: data.city || '',
          address: data.address || '',
          website: data.website || '',
          license_number: data.license_number || '',
          description: data.description || '',
        });
      } else {
        // Pre-fill from user
        setForm(prev => ({ ...prev, email: user.email || '' }));
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.contact_person.trim() || !form.email.trim()) {
      toast({ title: 'Error', description: 'Contact person and email are required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    if (profile) {
      // Update
      const { error } = await supabase
        .from('agent_profiles')
        .update(form)
        .eq('id', profile.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Profile Updated' });
      }
    } else {
      // Create
      const { error } = await supabase
        .from('agent_profiles')
        .insert({ ...form, user_id: user.id });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Profile Created', description: 'Your profile is pending admin verification.' });
        // Reload
        const { data } = await supabase.from('agent_profiles').select('*').eq('user_id', user.id).single();
        setProfile(data);
      }
    }

    setSaving(false);
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) return <AgentLayout><div className="p-8 text-muted-foreground">Loading...</div></AgentLayout>;

  return (
    <AgentLayout>
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Agent Profile</h1>
          {profile && (
            <Badge variant={profile.verification_status === 'verified' ? 'default' : 'outline'}>
              {profile.verification_status}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agency Details</CardTitle>
            <CardDescription>Your agency or referral business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agency Name</Label>
                <Input value={form.agency_name} onChange={e => update('agency_name', e.target.value)} placeholder="Your Agency Name" />
              </div>
              <div className="space-y-2">
                <Label>Contact Person *</Label>
                <Input value={form.contact_person} onChange={e => update('contact_person', e.target.value)} placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="agent@agency.com" required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 234 567 8900" />
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
                <Label>Address</Label>
                <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main St" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://agency.com" />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input value={form.license_number} onChange={e => update('license_number', e.target.value)} placeholder="LIC-12345" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell us about your agency and experience in medical tourism..." rows={4} />
            </div>

            {profile && (
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <p className="text-sm text-muted-foreground">
                  Default Commission Rate: <span className="font-bold text-foreground">{profile.default_commission_rate}%</span>
                </p>
                {profile.negotiated_commission_rate && (
                  <p className="text-sm text-muted-foreground">
                    Negotiated Rate: <span className="font-bold text-foreground">{profile.negotiated_commission_rate}%</span>
                  </p>
                )}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AgentLayout>
  );
};

export default AgentProfile;
