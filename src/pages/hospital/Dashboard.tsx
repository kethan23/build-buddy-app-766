import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Users, DollarSign, Activity, MessageSquare, TrendingUp, Settings, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { TreatmentStageManager } from '@/components/hospital/TreatmentStageManager';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInquiries: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingInquiries: 0,
  });
  const [hospital, setHospital] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch hospital data
      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setHospital(hospitalData);

      if (hospitalData) {
        // Fetch inquiries
        const { data: inquiries } = await supabase
          .from('inquiries')
          .select('*')
          .eq('hospital_id', hospitalData.id);

        // Fetch bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('hospital_id', hospitalData.id);

        // Calculate stats
        const totalRevenue = bookings?.reduce((sum, booking) => 
          sum + (Number(booking.total_amount) || 0), 0) || 0;
        
        const pendingInquiries = inquiries?.filter(i => i.status === 'pending').length || 0;

        setStats({
          totalInquiries: inquiries?.length || 0,
          totalBookings: bookings?.length || 0,
          totalRevenue,
          pendingInquiries,
        });

        // Fetch bookings with patient info for display
        const { data: bookingsWithProfiles } = await supabase
          .from('bookings')
          .select('*')
          .eq('hospital_id', hospitalData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (bookingsWithProfiles) {
          const bookingsWithProfileData = await Promise.all(
            bookingsWithProfiles.map(async (booking) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email, phone')
                .eq('user_id', booking.user_id)
                .single();
              
              return { ...booking, profiles: profile };
            })
          );
          setBookings(bookingsWithProfileData);
        }
      }
    };

    fetchData();
  }, [user]);

  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 },
  ];

  const inquiryData = [
    { day: 'Mon', count: 15 },
    { day: 'Tue', count: 22 },
    { day: 'Wed', count: 18 },
    { day: 'Thu', count: 25 },
    { day: 'Fri', count: 20 },
    { day: 'Sat', count: 12 },
    { day: 'Sun', count: 10 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Hospital Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {hospital?.name || 'Hospital'}
              </p>
            </div>
            {hospital?.verification_status === 'pending' && (
              <Badge variant="outline" className="bg-yellow-100">
                Verification Pending
              </Badge>
            )}
            {hospital?.verification_status === 'verified' && (
              <Badge variant="outline" className="bg-green-100">
                Verified
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingInquiries} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hospital?.rating || '0.00'}</div>
                <p className="text-xs text-muted-foreground">
                  {hospital?.total_reviews || 0} reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue for the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inquiries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inquiry Trends</CardTitle>
                  <CardDescription>Daily inquiries for the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={inquiryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your hospital operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20" 
                onClick={() => navigate('/hospital/profile')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Profile
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => navigate('/hospital/packages')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Manage Packages
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => navigate('/hospital/inquiries')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Patient Inquiries
              </Button>
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => navigate('/hospital/appointments')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Patient Bookings Management */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Recent Patient Bookings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.profiles?.full_name || 'Unknown Patient'}</p>
                          <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
                          <p className="text-sm text-muted-foreground">{booking.profiles?.phone}</p>
                        </div>
                        <Badge variant="outline">{booking.treatment_name}</Badge>
                      </div>
                      <TreatmentStageManager 
                        bookingId={booking.id} 
                        currentStage={booking.treatment_stage}
                        onUpdate={() => window.location.reload()}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalDashboard;

