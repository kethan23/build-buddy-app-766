import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, AlertCircle, TrendingUp, CheckCircle, XCircle, Settings, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { DocumentVerification } from '@/components/admin/DocumentVerification';
import { VisaApproval } from '@/components/admin/VisaApproval';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminDebugInfo } from '@/components/admin/AdminDebugInfo';
import { AppointmentExport } from '@/components/dashboard/AppointmentExport';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHospitals: 0,
    pendingVerifications: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    pendingInquiries: 0,
    pendingPayments: 0,
  });
  const [pendingHospitals, setPendingHospitals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    const fetchData = async () => {
      // Fetch hospitals
      const { data: hospitals, error: hospitalsError } = await supabase.from('hospitals').select('*');
      const pending = hospitals?.filter(h => h.verification_status === 'pending') || [];

      // Fetch users
      const { data: profiles } = await supabase.from('profiles').select('*');

      // Fetch bookings with related data
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          hospitals(name, address, city, country, logo_url)
        `)
        .order('created_at', { ascending: false });

      // Fetch inquiries
      const { data: inquiries } = await supabase.from('inquiries').select('*');
      const pendingInquiries = inquiries?.filter(i => i.status === 'pending').length || 0;

      // Fetch payments
      const { data: payments } = await supabase.from('payments').select('*');
      const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;

      // Process appointments with profile data
      const appointmentsWithProfiles = await Promise.all(
        (bookings || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, caretaker_name, caretaker_phone')
            .eq('user_id', booking.user_id)
            .single();
          
          return {
            ...booking,
            profile,
          };
        })
      );

      setAppointments(appointmentsWithProfiles);
      setFilteredAppointments(appointmentsWithProfiles);

      const pendingAppointments = bookings?.filter(b => b.status === 'pending').length || 0;

      setStats({
        totalHospitals: hospitals?.length || 0,
        pendingVerifications: pending.length,
        totalUsers: profiles?.length || 0,
        totalBookings: bookings?.length || 0,
        totalAppointments: bookings?.length || 0,
        pendingAppointments,
        pendingInquiries,
        pendingPayments,
      });

      setPendingHospitals(pending);
    };

    fetchData();
  }, []);

  const handleDateFilterChange = (fromDate: Date | undefined, toDate: Date | undefined) => {
    setDateFilter({ from: fromDate, to: toDate });
    
    let filtered = appointments;
    
    if (fromDate) {
      filtered = filtered.filter(apt => 
        apt.appointment_date && new Date(apt.appointment_date) >= fromDate
      );
    }
    
    if (toDate) {
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(apt => 
        apt.appointment_date && new Date(apt.appointment_date) <= endOfDay
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const exportAppointments = filteredAppointments.map(apt => ({
    appointment_id: apt.appointment_id || apt.id.slice(0, 12),
    patient_name: apt.profile?.full_name || 'Unknown',
    scheduled_date: apt.appointment_date 
      ? new Date(apt.appointment_date).toLocaleString() 
      : 'Not scheduled',
    caretaker_name: apt.profile?.caretaker_name,
    caretaker_phone: apt.profile?.caretaker_phone,
    hospital_name: apt.hospitals?.name || 'N/A',
    hospital_address: apt.hospitals 
      ? `${apt.hospitals.address || ''}, ${apt.hospitals.city || ''}, ${apt.hospitals.country || ''}`.trim()
      : 'N/A',
    treatment_name: apt.treatment_name,
    status: apt.status,
    total_amount: apt.total_amount,
    currency: apt.currency,
  }));

  const platformData = [
    { month: 'Jan', hospitals: 10, users: 150 },
    { month: 'Feb', hospitals: 15, users: 220 },
    { month: 'Mar', hospitals: 22, users: 350 },
    { month: 'Apr', hospitals: 28, users: 480 },
    { month: 'May', hospitals: 35, users: 620 },
    { month: 'Jun', hospitals: 42, users: 780 },
  ];

  const handleVerification = async (hospitalId: string, status: 'verified' | 'rejected') => {
    const { error } = await supabase
      .from('hospitals')
      .update({ verification_status: status })
      .eq('id', hospitalId);

    if (!error) {
      setPendingHospitals(prev => prev.filter(h => h.id !== hospitalId));
      setStats(prev => ({ ...prev, pendingVerifications: prev.pendingVerifications - 1 }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AdminDebugInfo />
        
        <h1 className="text-3xl font-bold mb-8 gradient-text">Admin Dashboard</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="visa">Visa Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalHospitals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingAppointments} pending
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingInquiries}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Verifications */}
            {pendingHospitals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Hospital Verifications</CardTitle>
                  <CardDescription>
                    Review and approve hospital registrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingHospitals.map((hospital) => (
                    <div key={hospital.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{hospital.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {hospital.city}, {hospital.country}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerification(hospital.id, 'verified')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerification(hospital.id, 'rejected')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage platform operations</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="h-20" 
                  onClick={() => navigate('/admin/hospitals')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Hospitals
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Platform Growth Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>Hospital and user growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="hospitals" stroke="hsl(var(--primary))" name="Hospitals" />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--accent))" name="Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                  <CardDescription>New registrations per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="hsl(var(--primary))" name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Appointments</CardTitle>
                    <CardDescription>View and export appointment data</CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <DateRangeFilter onFilterChange={handleDateFilterChange} />
                    <AppointmentExport 
                      appointments={exportAppointments}
                      role="admin"
                      pendingInquiriesCount={stats.pendingInquiries}
                      pendingPaymentsCount={stats.pendingPayments}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No appointments found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.slice(0, 20).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{apt.profile?.full_name || 'Unknown Patient'}</p>
                            <Badge variant="outline" className="text-xs">
                              ID: {apt.appointment_id || apt.id.slice(0, 12)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {apt.treatment_name} • {apt.hospitals?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.appointment_date 
                              ? new Date(apt.appointment_date).toLocaleString()
                              : 'Date TBD'}
                          </p>
                        </div>
                        <Badge className={apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                         apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}>
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentVerification />
          </TabsContent>

          <TabsContent value="visa" className="space-y-6">
            <VisaApproval />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Platform analytics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed analytics available in <Button variant="link" onClick={() => navigate('/admin/analytics')}>Analytics Page</Button>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
