import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { z } from 'zod';

const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required').max(200),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(2000),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day').optional(),
  recovery_days: z.number().min(0).optional(),
});

export const AddPackageDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    hospital_id: '',
    name: '',
    category: '',
    description: '',
    price: '',
    currency: 'USD',
    duration_days: '',
    recovery_days: '',
    inclusions: '',
    exclusions: '',
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    const { data } = await supabase
      .from('hospitals')
      .select('id, name')
      .eq('verification_status', 'verified')
      .order('name');
    setHospitals(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = packageSchema.parse({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : undefined,
        recovery_days: formData.recovery_days ? parseInt(formData.recovery_days) : undefined,
      });

      const inclusions = formData.inclusions
        .split('\n')
        .filter(i => i.trim())
        .map(i => i.trim());
      
      const exclusions = formData.exclusions
        .split('\n')
        .filter(e => e.trim())
        .map(e => e.trim());

      const { error } = await supabase.from('treatment_packages').insert({
        hospital_id: formData.hospital_id,
        name: validatedData.name,
        category: validatedData.category,
        description: validatedData.description,
        price: validatedData.price,
        currency: validatedData.currency,
        duration_days: validatedData.duration_days,
        recovery_days: validatedData.recovery_days,
        inclusions: inclusions.length > 0 ? inclusions : null,
        exclusions: exclusions.length > 0 ? exclusions : null,
        is_active: true,
      });

      if (error) throw error;

      toast.success('Treatment package created successfully');
      setOpen(false);
      setFormData({
        hospital_id: '',
        name: '',
        category: '',
        description: '',
        price: '',
        currency: 'USD',
        duration_days: '',
        recovery_days: '',
        inclusions: '',
        exclusions: '',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Error creating package:', error);
      toast.error(error.message || 'Failed to create package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Treatment Package</DialogTitle>
          <DialogDescription>
            Create a new treatment package for a hospital.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospital_id">Hospital *</Label>
            <Select
              value={formData.hospital_id}
              onValueChange={(value) => setFormData({ ...formData, hospital_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Cardiology, Orthopedics"
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_days">Duration (Days)</Label>
              <Input
                id="duration_days"
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recovery_days">Recovery (Days)</Label>
              <Input
                id="recovery_days"
                type="number"
                value={formData.recovery_days}
                onChange={(e) => setFormData({ ...formData, recovery_days: e.target.value })}
                min="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={2000}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inclusions">Inclusions (one per line)</Label>
            <Textarea
              id="inclusions"
              value={formData.inclusions}
              onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
              placeholder="Hospital stay&#10;Medication&#10;Post-op care"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exclusions">Exclusions (one per line)</Label>
            <Textarea
              id="exclusions"
              value={formData.exclusions}
              onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
              placeholder="Travel expenses&#10;Personal medication"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
