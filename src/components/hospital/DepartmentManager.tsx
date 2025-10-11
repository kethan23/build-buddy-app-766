import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface DepartmentManagerProps {
  hospitalId: string;
}

export function DepartmentManager({ hospitalId }: DepartmentManagerProps) {
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [newSpecialty, setNewSpecialty] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecialties();
  }, [hospitalId]);

  const fetchSpecialties = async () => {
    const { data } = await supabase
      .from('hospital_specialties')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });
    setSpecialties(data || []);
  };

  const handleAdd = async () => {
    if (!newSpecialty.name) {
      toast({ title: 'Error', description: 'Specialty name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('hospital_specialties').insert({
        hospital_id: hospitalId,
        specialty_name: newSpecialty.name,
        description: newSpecialty.description,
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Specialty added successfully' });
      setNewSpecialty({ name: '', description: '' });
      fetchSpecialties();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('hospital_specialties').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Success', description: 'Specialty removed' });
      fetchSpecialties();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Specialty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Specialty name (e.g., Cardiology)"
            value={newSpecialty.name}
            onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newSpecialty.description}
            onChange={(e) => setNewSpecialty({ ...newSpecialty, description: e.target.value })}
            rows={3}
          />
          <Button onClick={handleAdd} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Specialty
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {specialties.map((specialty) => (
          <Card key={specialty.id}>
            <CardContent className="p-4 flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold">{specialty.specialty_name}</h4>
                {specialty.description && (
                  <p className="text-sm text-muted-foreground">{specialty.description}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(specialty.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
