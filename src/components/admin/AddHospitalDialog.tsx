import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, X, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';

const hospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required').max(200),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100),
  country: z.string().min(1, 'Country is required').max(100),
  postal_code: z.string().max(20),
  description: z.string().max(2000),
  bed_capacity: z.number().min(1).max(10000),
  established_year: z.number().min(1800).max(new Date().getFullYear()),
});

type Doctor = {
  name: string;
  specialty: string;
  qualification: string;
  experience_years: string;
  bio: string;
};

type Specialty = {
  specialty_name: string;
  description: string;
  doctors: Doctor[];
};

export const AddHospitalDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    description: '',
    bed_capacity: '',
    established_year: '',
    verification_status: 'verified',
  });

  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const addSpecialty = () => {
    setSpecialties([...specialties, { specialty_name: '', description: '', doctors: [] }]);
  };

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const updateSpecialty = (index: number, field: keyof Specialty, value: any) => {
    const updated = [...specialties];
    updated[index] = { ...updated[index], [field]: value };
    setSpecialties(updated);
  };

  const addDoctor = (specialtyIndex: number) => {
    const updated = [...specialties];
    updated[specialtyIndex].doctors.push({
      name: '',
      specialty: updated[specialtyIndex].specialty_name,
      qualification: '',
      experience_years: '',
      bio: '',
    });
    setSpecialties(updated);
  };

  const removeDoctor = (specialtyIndex: number, doctorIndex: number) => {
    const updated = [...specialties];
    updated[specialtyIndex].doctors = updated[specialtyIndex].doctors.filter((_, i) => i !== doctorIndex);
    setSpecialties(updated);
  };

  const updateDoctor = (specialtyIndex: number, doctorIndex: number, field: keyof Doctor, value: string) => {
    const updated = [...specialties];
    updated[specialtyIndex].doctors[doctorIndex] = {
      ...updated[specialtyIndex].doctors[doctorIndex],
      [field]: value,
    };
    setSpecialties(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = hospitalSchema.parse({
        ...formData,
        bed_capacity: parseInt(formData.bed_capacity),
        established_year: parseInt(formData.established_year),
      });

      // Create a dummy user for this hospital (admin-created)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: Math.random().toString(36).slice(-12) + 'A1!', // Random secure password
        options: {
          data: {
            full_name: validatedData.name,
            role: 'hospital',
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create hospital user account');
      }

      // Insert hospital data
      const { error: insertError } = await supabase.from('hospitals').insert({
        user_id: authData.user.id,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        postal_code: validatedData.postal_code,
        description: validatedData.description,
        bed_capacity: validatedData.bed_capacity,
        established_year: validatedData.established_year,
        verification_status: formData.verification_status,
      });

      if (insertError) throw insertError;

      // Get the hospital ID from the inserted data
      const { data: hospitalData, error: fetchError } = await supabase
        .from('hospitals')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      if (fetchError || !hospitalData) {
        throw new Error('Failed to retrieve hospital ID');
      }

      const hospitalId = hospitalData.id;

      // Insert specialties and doctors
      for (const specialty of specialties) {
        if (specialty.specialty_name.trim()) {
          const { error: specialtyError } = await supabase
            .from('hospital_specialties')
            .insert({
              hospital_id: hospitalId,
              specialty_name: specialty.specialty_name,
              description: specialty.description,
            });

          if (specialtyError) throw specialtyError;

          // Insert doctors for this specialty
          for (const doctor of specialty.doctors) {
            if (doctor.name.trim()) {
              const { error: doctorError } = await supabase
                .from('doctors')
                .insert({
                  hospital_id: hospitalId,
                  name: doctor.name,
                  specialty: doctor.specialty || specialty.specialty_name,
                  qualification: doctor.qualification,
                  experience_years: doctor.experience_years ? parseInt(doctor.experience_years) : null,
                  bio: doctor.bio,
                });

              if (doctorError) throw doctorError;
            }
          }
        }
      }

      toast.success('Hospital created successfully with specialties and doctors');
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        description: '',
        bed_capacity: '',
        established_year: '',
        verification_status: 'verified',
      });
      setSpecialties([]);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating hospital:', error);
      toast.error(error.message || 'Failed to create hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Hospital</DialogTitle>
          <DialogDescription>
            Create a new hospital account with specialties and doctors. A random secure password will be generated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hospital Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bed_capacity">Bed Capacity *</Label>
              <Input
                id="bed_capacity"
                type="number"
                value={formData.bed_capacity}
                onChange={(e) => setFormData({ ...formData, bed_capacity: e.target.value })}
                required
                min="1"
                max="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="established_year">Established Year *</Label>
              <Input
                id="established_year"
                type="number"
                value={formData.established_year}
                onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                required
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification_status">Verification Status</Label>
              <Select
                value={formData.verification_status}
                onValueChange={(value) => setFormData({ ...formData, verification_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              maxLength={500}
              rows={2}
            />
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

          <Separator className="my-6" />

          {/* Specialties and Doctors Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Specialties & Doctors</h3>
                <p className="text-sm text-muted-foreground">Add hospital specialties with specialized doctors</p>
              </div>
              <Button type="button" variant="premium" size="sm" onClick={addSpecialty}>
                <Plus className="mr-2 h-4 w-4" />
                Add Specialty
              </Button>
            </div>

            {specialties.map((specialty, specialtyIndex) => (
              <Card key={specialtyIndex} className="premium-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Specialty {specialtyIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecialty(specialtyIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Specialty Name *</Label>
                      <Input
                        value={specialty.specialty_name}
                        onChange={(e) => updateSpecialty(specialtyIndex, 'specialty_name', e.target.value)}
                        placeholder="e.g., Cardiology, Orthopedics"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={specialty.description}
                        onChange={(e) => updateSpecialty(specialtyIndex, 'description', e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>
                  </div>

                  {/* Doctors Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Specialized Doctors</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addDoctor(specialtyIndex)}
                      >
                        <UserPlus className="mr-2 h-3 w-3" />
                        Add Doctor
                      </Button>
                    </div>

                    {specialty.doctors.map((doctor, doctorIndex) => (
                      <div key={doctorIndex} className="glass-card p-4 space-y-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Doctor {doctorIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDoctor(specialtyIndex, doctorIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Doctor Name *</Label>
                            <Input
                              value={doctor.name}
                              onChange={(e) => updateDoctor(specialtyIndex, doctorIndex, 'name', e.target.value)}
                              placeholder="Dr. John Smith"
                              required
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Qualification</Label>
                            <Input
                              value={doctor.qualification}
                              onChange={(e) => updateDoctor(specialtyIndex, doctorIndex, 'qualification', e.target.value)}
                              placeholder="MBBS, MD"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Experience (Years)</Label>
                            <Input
                              type="number"
                              value={doctor.experience_years}
                              onChange={(e) => updateDoctor(specialtyIndex, doctorIndex, 'experience_years', e.target.value)}
                              placeholder="10"
                              min="0"
                              max="70"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Bio</Label>
                            <Textarea
                              value={doctor.bio}
                              onChange={(e) => updateDoctor(specialtyIndex, doctorIndex, 'bio', e.target.value)}
                              placeholder="Brief professional bio..."
                              rows={2}
                              className="resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Hospital'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
