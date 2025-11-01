import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PackageDialog } from '@/components/hospital/PackageDialog';
import { useToast } from '@/hooks/use-toast';

const HospitalPackages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [hospital, setHospital] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setHospital(hospitalData);

      if (hospitalData) {
        const { data: packagesData } = await supabase
          .from('treatment_packages')
          .select('*')
          .eq('hospital_id', hospitalData.id)
          .order('created_at', { ascending: false });

        setPackages(packagesData || []);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    const { error } = await supabase.from('treatment_packages').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Success', description: 'Package deleted successfully' });
      setPackages(packages.filter(p => p.id !== id));
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Treatment Packages</h1>
              <p className="text-muted-foreground">
                Manage your hospital's treatment packages and pricing
              </p>
            </div>
            {hospital && (
              <PackageDialog
                hospitalId={hospital.id}
                onSuccess={() => {
                  const fetchData = async () => {
                    const { data } = await supabase
                      .from('treatment_packages')
                      .select('*')
                      .eq('hospital_id', hospital.id)
                      .order('created_at', { ascending: false });
                    setPackages(data || []);
                  };
                  fetchData();
                }}
              />
            )}
          </div>

          {packages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first treatment package to start attracting patients
                </p>
                {hospital && (
                  <PackageDialog
                    hospitalId={hospital.id}
                    onSuccess={() => {
                      const fetchData = async () => {
                        const { data } = await supabase
                          .from('treatment_packages')
                          .select('*')
                          .eq('hospital_id', hospital.id)
                          .order('created_at', { ascending: false });
                        setPackages(data || []);
                      };
                      fetchData();
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pkg.name}</CardTitle>
                        <CardDescription>{pkg.category}</CardDescription>
                      </div>
                      <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {pkg.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold">
                          {pkg.currency} {pkg.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pkg.duration_days} days treatment
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {hospital && (
                        <PackageDialog
                          hospitalId={hospital.id}
                          package_={pkg}
                          onSuccess={() => {
                            const fetchData = async () => {
                              const { data } = await supabase
                                .from('treatment_packages')
                                .select('*')
                                .eq('hospital_id', hospital.id)
                                .order('created_at', { ascending: false });
                              setPackages(data || []);
                            };
                            fetchData();
                          }}
                        />
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDelete(pkg.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalPackages;
