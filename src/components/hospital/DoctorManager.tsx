import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, UserCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DoctorManagerProps {
  hospitalId: string;
}

export function DoctorManager({ hospitalId }: DoctorManagerProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    qualification: '',
    experience_years: '',
    bio: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, [hospitalId]);

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });
    setDoctors(data || []);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.specialty) {
      toast({ title: 'Error', description: 'Name and specialty are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('doctors').insert({
        hospital_id: hospitalId,
        name: form.name,
        specialty: form.specialty,
        qualification: form.qualification,
        experience_years: form.experience_years ? parseInt(form.experience_years) : null,
        bio: form.bio,
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Doctor added successfully' });
      setForm({ name: '', specialty: '', qualification: '', experience_years: '', bio: '' });
      setOpen(false);
      fetchDoctors();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Success', description: 'Doctor removed' });
      fetchDoctors();
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Doctor name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Specialty (e.g., Cardiologist)"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />
            <Input
              placeholder="Qualifications"
              value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Years of experience"
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
            />
            <Textarea
              placeholder="Bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? 'Adding...' : 'Add Doctor'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <UserCircle className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doctor.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {doctor.qualification && (
                <p className="text-sm"><strong>Qualification:</strong> {doctor.qualification}</p>
              )}
              {doctor.experience_years && (
                <p className="text-sm"><strong>Experience:</strong> {doctor.experience_years} years</p>
              )}
              {doctor.bio && (
                <p className="text-sm text-muted-foreground">{doctor.bio}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
