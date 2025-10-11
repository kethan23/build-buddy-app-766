import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CertificationManagerProps {
  hospitalId: string;
}

export function CertificationManager({ hospitalId }: CertificationManagerProps) {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    certification_name: '',
    issuing_body: '',
    issue_date: '',
    expiry_date: '',
  });

  useEffect(() => {
    fetchCertifications();
  }, [hospitalId]);

  const fetchCertifications = async () => {
    const { data } = await supabase
      .from('hospital_certifications')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('issue_date', { ascending: false });
    setCertifications(data || []);
  };

  const handleSubmit = async () => {
    if (!form.certification_name || !form.issuing_body) {
      toast({ title: 'Error', description: 'Certification name and issuing body are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('hospital_certifications').insert({
        hospital_id: hospitalId,
        certification_name: form.certification_name,
        issuing_body: form.issuing_body,
        issue_date: form.issue_date || null,
        expiry_date: form.expiry_date || null,
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Certification added successfully' });
      setForm({ certification_name: '', issuing_body: '', issue_date: '', expiry_date: '' });
      setOpen(false);
      fetchCertifications();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('hospital_certifications').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Success', description: 'Certification removed' });
      fetchCertifications();
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Certification name"
              value={form.certification_name}
              onChange={(e) => setForm({ ...form, certification_name: e.target.value })}
            />
            <Input
              placeholder="Issuing body"
              value={form.issuing_body}
              onChange={(e) => setForm({ ...form, issuing_body: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Issue Date</label>
                <Input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? 'Adding...' : 'Add Certification'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {certifications.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div className="space-y-1">
                  <h4 className="font-semibold">{cert.certification_name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuing_body}</p>
                  {cert.issue_date && (
                    <p className="text-xs text-muted-foreground">
                      Issued: {new Date(cert.issue_date).toLocaleDateString()}
                    </p>
                  )}
                  {cert.expiry_date && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
