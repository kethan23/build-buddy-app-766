import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, Eye, FileCheck, Trash2, Power } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddHospitalDialog } from '@/components/admin/AddHospitalDialog';
import { AddPackageDialog } from '@/components/admin/AddPackageDialog';
import { HospitalReviewDialog } from '@/components/admin/HospitalReviewDialog';
import { AdminDebugInfo } from '@/components/admin/AdminDebugInfo';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    console.log('Admin fetching hospitals...');
    
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching hospitals:', error);
    } else {
      console.log('Fetched hospitals:', data);
      console.log('Total hospitals:', data?.length);
      console.log('Pending hospitals:', data?.filter(h => h.verification_status === 'pending').length);
    }

    setHospitals(data || []);
  };

  const openReviewDialog = (hospital: any) => {
    setSelectedHospital(hospital);
    setReviewDialogOpen(true);
  };

  const handleDeleteHospital = async (hospital: any) => {
    try {
      // Delete related data first
      await supabase.from('hospital_gallery').delete().eq('hospital_id', hospital.id);
      await supabase.from('hospital_certifications').delete().eq('hospital_id', hospital.id);
      await supabase.from('hospital_specialties').delete().eq('hospital_id', hospital.id);
      await supabase.from('doctors').delete().eq('hospital_id', hospital.id);
      await supabase.from('treatment_packages').delete().eq('hospital_id', hospital.id);

      // Delete the hospital
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', hospital.id);

      if (error) throw error;

      toast.success(`Hospital "${hospital.name}" deleted successfully`);
      fetchHospitals();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete hospital');
    }
  };

  const handleToggleActive = async (hospital: any) => {
    try {
      const newStatus = !hospital.is_active;
      const { error } = await supabase
        .from('hospitals')
        .update({ is_active: newStatus })
        .eq('id', hospital.id);

      if (error) throw error;

      toast.success(`Hospital "${hospital.name}" ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchHospitals();
    } catch (error: any) {
      console.error('Toggle active error:', error);
      toast.error(error.message || 'Failed to update hospital status');
    }
  };

  const filterHospitals = (status?: string) => {
    let filtered = hospitals;
    
    if (status) {
      filtered = filtered.filter(h => h.verification_status === status);
    }

    if (searchQuery) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.country?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const HospitalList = ({ status }: { status?: string }) => {
    const filtered = filterHospitals(status);

    return (
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hospitals found
          </div>
        ) : (
          filtered.map((hospital) => (
            <Card key={hospital.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{hospital.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {hospital.city}, {hospital.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(hospital.verification_status)}
                    <Badge className={hospital.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}>
                      {hospital.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {hospital.description || 'No description available'}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openReviewDialog(hospital)}
                  >
                    <FileCheck className="mr-2 h-4 w-4" />
                    Review & {hospital.verification_status === 'pending' ? 'Approve' : 'View'}
                  </Button>
                  
                  {hospital.verification_status === 'verified' && (
                    <Button
                      size="sm"
                      variant={hospital.is_active ? "secondary" : "default"}
                      onClick={() => handleToggleActive(hospital)}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {hospital.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{hospital.name}"? This action cannot be undone
                          and will remove all associated data including doctors, packages, and images.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteHospital(hospital)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <AdminDebugInfo />
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Hospital Management</h1>
              <p className="text-muted-foreground">
                Review and manage hospital registrations
              </p>
            </div>
            <div className="flex gap-2">
              <AddHospitalDialog onSuccess={fetchHospitals} />
              <AddPackageDialog onSuccess={() => {}} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hospitals by name, city, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hospitals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterHospitals('verified').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterHospitals('pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterHospitals('rejected').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <HospitalList />
            </TabsContent>
            <TabsContent value="pending">
              <HospitalList status="pending" />
            </TabsContent>
            <TabsContent value="verified">
              <HospitalList status="verified" />
            </TabsContent>
            <TabsContent value="rejected">
              <HospitalList status="rejected" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <HospitalReviewDialog
        hospital={selectedHospital}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onSuccess={fetchHospitals}
      />
    </div>
  );
};

export default AdminHospitals;
