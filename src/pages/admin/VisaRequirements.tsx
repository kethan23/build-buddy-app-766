import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Globe, Clock, DollarSign, Loader2 } from 'lucide-react';

interface CountryRequirement {
  id: string;
  country_code: string;
  country_name: string;
  visa_type: string;
  required_documents: string[];
  processing_time_days: number;
  validity_days: number;
  extension_available: boolean;
  fees_usd: number;
  special_notes: string | null;
  is_active: boolean;
}

const DOCUMENT_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'passport_photo', label: 'Passport Photo' },
  { value: 'medical_reports', label: 'Medical Reports' },
  { value: 'hospital_invitation', label: 'Hospital Invitation' },
  { value: 'financial_proof', label: 'Financial Proof' },
  { value: 'travel_insurance', label: 'Travel Insurance' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'police_clearance', label: 'Police Clearance' },
];

export default function AdminVisaRequirements() {
  const [requirements, setRequirements] = useState<CountryRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    country_code: '',
    country_name: '',
    visa_type: 'medical_visa',
    required_documents: [] as string[],
    processing_time_days: 15,
    validity_days: 90,
    extension_available: true,
    fees_usd: 0,
    special_notes: '',
    is_active: true,
  });

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visa_country_requirements')
      .select('*')
      .order('country_name');

    if (data && !error) {
      setRequirements(data.map(r => ({
        id: r.id,
        country_code: r.country_code,
        country_name: r.country_name,
        visa_type: r.visa_type,
        processing_time_days: r.processing_time_days ?? 15,
        validity_days: r.validity_days ?? 90,
        extension_available: r.extension_available ?? true,
        fees_usd: Number(r.fees_usd) || 0,
        special_notes: r.special_notes,
        is_active: r.is_active ?? true,
        required_documents: Array.isArray(r.required_documents) ? (r.required_documents as string[]) : []
      })));
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      country_code: '',
      country_name: '',
      visa_type: 'medical_visa',
      required_documents: [],
      processing_time_days: 15,
      validity_days: 90,
      extension_available: true,
      fees_usd: 0,
      special_notes: '',
      is_active: true,
    });
    setEditingId(null);
  };

  const openEditDialog = (req: CountryRequirement) => {
    setFormData({
      country_code: req.country_code,
      country_name: req.country_name,
      visa_type: req.visa_type,
      required_documents: req.required_documents,
      processing_time_days: req.processing_time_days,
      validity_days: req.validity_days,
      extension_available: req.extension_available,
      fees_usd: req.fees_usd,
      special_notes: req.special_notes || '',
      is_active: req.is_active,
    });
    setEditingId(req.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.country_code || !formData.country_name) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('visa_country_requirements')
          .update({
            ...formData,
            special_notes: formData.special_notes || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Country requirements updated');
      } else {
        const { error } = await supabase
          .from('visa_country_requirements')
          .insert({
            ...formData,
            special_notes: formData.special_notes || null,
          });

        if (error) throw error;
        toast.success('Country requirements added');
      }

      setDialogOpen(false);
      resetForm();
      loadRequirements();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country requirement?')) return;

    const { error } = await supabase
      .from('visa_country_requirements')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted successfully');
      loadRequirements();
    }
  };

  const toggleDocument = (doc: string) => {
    setFormData(prev => ({
      ...prev,
      required_documents: prev.required_documents.includes(doc)
        ? prev.required_documents.filter(d => d !== doc)
        : [...prev.required_documents, doc],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Visa Country Requirements</h1>
            <p className="text-muted-foreground mt-2">
              Manage visa requirements for different countries
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Add Country
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Country Requirements' : 'Add Country Requirements'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country Code *</Label>
                    <Input
                      value={formData.country_code}
                      onChange={e => setFormData(prev => ({ ...prev, country_code: e.target.value.toUpperCase() }))}
                      placeholder="US, GB, AE..."
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country Name *</Label>
                    <Input
                      value={formData.country_name}
                      onChange={e => setFormData(prev => ({ ...prev, country_name: e.target.value }))}
                      placeholder="United States"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Processing Time (days)</Label>
                    <Input
                      type="number"
                      value={formData.processing_time_days}
                      onChange={e => setFormData(prev => ({ ...prev, processing_time_days: parseInt(e.target.value) || 15 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Validity (days)</Label>
                    <Input
                      type="number"
                      value={formData.validity_days}
                      onChange={e => setFormData(prev => ({ ...prev, validity_days: parseInt(e.target.value) || 90 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fee (USD)</Label>
                    <Input
                      type="number"
                      value={formData.fees_usd}
                      onChange={e => setFormData(prev => ({ ...prev, fees_usd: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required Documents</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOCUMENT_OPTIONS.map(doc => (
                      <Badge
                        key={doc.value}
                        variant={formData.required_documents.includes(doc.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDocument(doc.value)}
                      >
                        {doc.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Notes</Label>
                  <Textarea
                    value={formData.special_notes}
                    onChange={e => setFormData(prev => ({ ...prev, special_notes: e.target.value }))}
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.extension_available}
                      onCheckedChange={checked => setFormData(prev => ({ ...prev, extension_available: checked }))}
                    />
                    <Label>Extension Available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? 'Update' : 'Add'} Country
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="premium-card">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">Loading requirements...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Processing</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{req.country_name}</p>
                            <p className="text-xs text-muted-foreground">{req.country_code}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {req.processing_time_days} days
                        </span>
                      </TableCell>
                      <TableCell>{req.validity_days} days</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          {req.fees_usd}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {req.required_documents.length} docs
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.is_active ? "default" : "secondary"}>
                          {req.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(req)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(req.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
