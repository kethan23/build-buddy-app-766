import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Award, Image } from 'lucide-react';
import { DepartmentManager } from '@/components/hospital/DepartmentManager';
import { DoctorManager } from '@/components/hospital/DoctorManager';
import { CertificationManager } from '@/components/hospital/CertificationManager';
import { GalleryManager } from '@/components/hospital/GalleryManager';

const hospitalFormSchema = z.object({
  name: z.string().min(2, 'Hospital name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  address: z.string().min(5, 'Address is required').max(200),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2).max(100),
  postal_code: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255),
  website: z.string().url().optional().or(z.literal('')),
  established_year: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  bed_capacity: z.coerce.number().int().min(0).optional(),
});

const HospitalProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hospital, setHospital] = useState<any>(null);

  const form = useForm<z.infer<typeof hospitalFormSchema>>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      phone: '',
      email: '',
      website: '',
      established_year: undefined,
      bed_capacity: undefined,
    },
  });

  useEffect(() => {
    const fetchHospital = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setHospital(data);
        form.reset(data);
      }
    };

    fetchHospital();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof hospitalFormSchema>) => {
    if (!user) return;

    setLoading(true);
    try {
      if (hospital) {
        // Update existing hospital
        const { error } = await supabase
          .from('hospitals')
          .update(values)
          .eq('id', hospital.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Hospital profile updated successfully' });
      } else {
        // Create new hospital
        const { data, error } = await supabase
          .from('hospitals')
          .insert({
            user_id: user.id,
            name: values.name,
            email: values.email,
            description: values.description || null,
            address: values.address,
            city: values.city,
            state: values.state || null,
            country: values.country,
            postal_code: values.postal_code || null,
            phone: values.phone || null,
            website: values.website || null,
            established_year: values.established_year || null,
            bed_capacity: values.bed_capacity || null,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setHospital(data);
        toast({ title: 'Success', description: 'Hospital profile created successfully' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Hospital Profile</h1>
            <p className="text-muted-foreground">
              Manage your hospital information and settings
            </p>
          </div>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">
                <Building2 className="mr-2 h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="departments">
                <Users className="mr-2 h-4 w-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="certifications">
                <Award className="mr-2 h-4 w-4" />
                Certifications
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Image className="mr-2 h-4 w-4" />
                Gallery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your hospital's basic information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hospital Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input type="url" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="established_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Established Year</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bed_capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bed Capacity</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea rows={4} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h3 className="font-semibold">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="postal_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="departments">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Departments & Specialties</CardTitle>
                    <CardDescription>
                      Manage your hospital's departments and medical specialties
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hospital && <DepartmentManager hospitalId={hospital.id} />}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Medical Staff</CardTitle>
                    <CardDescription>
                      Add and manage doctors and medical professionals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hospital && <DoctorManager hospitalId={hospital.id} />}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="certifications">
              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Licenses</CardTitle>
                  <CardDescription>
                    Upload and manage your hospital's certifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hospital && <CertificationManager hospitalId={hospital.id} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>Hospital Gallery</CardTitle>
                  <CardDescription>
                    Upload and manage your hospital's photos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hospital && <GalleryManager hospitalId={hospital.id} />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalProfile;
