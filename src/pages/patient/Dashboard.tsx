import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingForm } from '@/components/patient/OnboardingForm';
import { DocumentUpload } from '@/components/patient/DocumentUpload';
import { StatusTracking } from '@/components/patient/StatusTracking';
import { VisaProgressTracker } from '@/components/patient/VisaProgressTracker';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Calendar, Bell, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadInquiries();
      loadBookings();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    setProfile(data);
  };

  const loadInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setInquiries(data || []);
  };

  const loadBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setBookings(data || []);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning',
      responded: 'bg-info',
      accepted: 'bg-success',
      rejected: 'bg-destructive',
      confirmed: 'bg-success',
      in_progress: 'bg-primary',
      completed: 'bg-success',
      cancelled: 'bg-destructive',
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 gradient-text">Patient Dashboard</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="onboarding">Profile</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="status">Status Tracking</TabsTrigger>
            <TabsTrigger value="visa">Visa</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome back, {profile?.full_name || 'Patient'}!
              </h2>
              <p className="text-muted-foreground">
                Manage your medical journey and connect with world-class healthcare providers.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="premium-card cursor-pointer hover-lift" onClick={() => navigate('/patient/search')}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Search className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-sm font-medium">Search Hospitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Find the perfect hospital for your treatment</p>
                </CardContent>
              </Card>

              <Card className="premium-card cursor-pointer hover-lift" onClick={() => navigate('/patient/inquiries')}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-sm font-medium">View Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Track your hospital inquiries</p>
                </CardContent>
              </Card>

              <Card className="premium-card cursor-pointer hover-lift" onClick={() => navigate('/patient/bookings')}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-sm font-medium">Book Consultation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Schedule appointments and treatments</p>
                </CardContent>
              </Card>

              <Card className="premium-card cursor-pointer hover-lift">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Bell className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Stay updated on your journey</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Inquiries */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle>Recent Inquiries</CardTitle>
                  <CardDescription>Your latest hospital inquiries and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inquiries.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No inquiries yet. Start by searching for hospitals!
                      </p>
                    ) : (
                      inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{inquiry.treatment_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(inquiry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                  {inquiries.length > 0 && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/patient/inquiries')}>
                      View All Inquiries
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled consultations and treatments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming appointments. Book a consultation to get started!
                      </p>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{booking.treatment_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.appointment_date 
                                ? new Date(booking.appointment_date).toLocaleDateString()
                                : 'Date TBD'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                  {bookings.length > 0 && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/patient/bookings')}>
                      View All Bookings
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="onboarding">
            <OnboardingForm onComplete={() => loadProfile()} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="status">
            <StatusTracking />
          </TabsContent>

          <TabsContent value="visa">
            <VisaProgressTracker />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
