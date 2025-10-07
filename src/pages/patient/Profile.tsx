import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMedicalHistory();
      loadDocuments();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    if (data) setProfile(data);
  };

  const loadMedicalHistory = async () => {
    const { data } = await supabase
      .from('medical_history')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setMedicalHistory(data || []);
  };

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  const saveProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    }
    setLoading(false);
  };

  const addMedicalHistory = async () => {
    const newEntry = {
      user_id: user?.id,
      condition: '',
      diagnosis_date: null,
      treatment: '',
      medications: '',
      allergies: '',
      notes: '',
    };
    
    const { data, error } = await supabase
      .from('medical_history')
      .insert([newEntry])
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setMedicalHistory([data, ...medicalHistory]);
    }
  };

  const updateMedicalHistory = async (id: string, field: string, value: any) => {
    const { error } = await supabase
      .from('medical_history')
      .update({ [field]: value })
      .eq('id', id);

    if (!error) {
      setMedicalHistory(medicalHistory.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    }
  };

  const deleteMedicalHistory = async (id: string) => {
    const { error } = await supabase
      .from('medical_history')
      .delete()
      .eq('id', id);

    if (!error) {
      setMedicalHistory(medicalHistory.filter(item => item.id !== id));
      toast({
        title: 'Deleted',
        description: 'Medical history entry deleted',
      });
    }
  };

  const profileCompleteness = Math.round(
    (Object.values(profile).filter(v => v !== null && v !== '').length /
      Object.keys(profile).length) * 100
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary">MediConnect</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Profile Management</h1>
          <p className="text-muted-foreground">Manage your personal information and medical history</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>
              {profileCompleteness}% complete - Fill in all fields to get better recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={profileCompleteness} className="w-full" />
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profile.date_of_birth || ''}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profile.gender || ''}
                      onValueChange={(value) => setProfile({ ...profile, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={profile.nationality || ''}
                      onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profile.country || ''}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Name</Label>
                      <Input
                        id="emergency_contact_name"
                        value={profile.emergency_contact_name || ''}
                        onChange={(e) => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        value={profile.emergency_contact_phone || ''}
                        onChange={(e) => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                      <Input
                        id="emergency_contact_relationship"
                        value={profile.emergency_contact_relationship || ''}
                        onChange={(e) => setProfile({ ...profile, emergency_contact_relationship: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={saveProfile} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
                <CardDescription>Keep track of your medical conditions and treatments</CardDescription>
                <Button onClick={addMedicalHistory} size="sm" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {medicalHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No medical history yet. Click "Add Entry" to start.
                  </p>
                ) : (
                  medicalHistory.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Condition</Label>
                            <Input
                              value={entry.condition}
                              onChange={(e) => updateMedicalHistory(entry.id, 'condition', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Diagnosis Date</Label>
                            <Input
                              type="date"
                              value={entry.diagnosis_date || ''}
                              onChange={(e) => updateMedicalHistory(entry.id, 'diagnosis_date', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Treatment</Label>
                            <Input
                              value={entry.treatment}
                              onChange={(e) => updateMedicalHistory(entry.id, 'treatment', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Medications</Label>
                            <Input
                              value={entry.medications}
                              onChange={(e) => updateMedicalHistory(entry.id, 'medications', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Allergies</Label>
                          <Input
                            value={entry.allergies}
                            onChange={(e) => updateMedicalHistory(entry.id, 'allergies', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={entry.notes}
                            onChange={(e) => updateMedicalHistory(entry.id, 'notes', e.target.value)}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMedicalHistory(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Entry
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Upload and manage your medical documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Document upload will be available soon
                  </p>
                  <Button disabled>Upload Documents</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your preferences and privacy settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings options will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
