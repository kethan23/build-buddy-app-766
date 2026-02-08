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
import { VisaStatusCard } from '@/components/patient/VisaStatusCard';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Calendar, Bell, Plane, Sparkles, ArrowRight } from 'lucide-react';

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
      pending: 'bg-warning/15 text-warning-foreground border border-warning/30',
      responded: 'bg-info/15 text-foreground border border-info/30',
      accepted: 'bg-success/15 text-foreground border border-success/30',
      rejected: 'bg-destructive/15 text-destructive border border-destructive/30',
      confirmed: 'bg-success/15 text-foreground border border-success/30',
      in_progress: 'bg-primary/15 text-primary border border-primary/30',
      completed: 'bg-success/15 text-foreground border border-success/30',
      cancelled: 'bg-destructive/15 text-destructive border border-destructive/30',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const quickActions = [
    { icon: Search, title: 'Search Hospitals', desc: 'Find the perfect hospital for your treatment', path: '/patient/search' },
    { icon: FileText, title: 'View Inquiries', desc: 'Track your hospital inquiries', path: '/patient/inquiries' },
    { icon: Calendar, title: 'Book Consultation', desc: 'Schedule appointments and treatments', path: '/patient/bookings' },
    { icon: Bell, title: 'Notifications', desc: 'Stay updated on your journey', path: null },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Premium header */}
          <ScrollReveal>
            <div className="mb-8">
              <div className="section-badge w-fit mb-3">
                <Sparkles className="h-4 w-4" />
                Patient Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Patient Dashboard</h1>
              <p className="text-muted-foreground">Manage your medical journey and connect with world-class healthcare providers.</p>
            </div>
          </ScrollReveal>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass-card border-0 p-1 w-full max-w-3xl grid grid-cols-5">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
              <TabsTrigger value="onboarding" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Profile</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Documents</TabsTrigger>
              <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Status</TabsTrigger>
              <TabsTrigger value="visa" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Visa</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Welcome */}
              <ScrollReveal>
                <div className="elegant-card p-6 md:p-8">
                  <h2 className="text-2xl font-heading font-semibold mb-2">
                    Welcome back, {profile?.full_name || 'Patient'}! 👋
                  </h2>
                  <p className="text-muted-foreground">
                    Your medical journey is in good hands. Browse hospitals, manage inquiries, and track your bookings all in one place.
                  </p>
                </div>
              </ScrollReveal>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <ScrollReveal key={action.title} delay={index * 100} animation="scale-in">
                      <Card
                        className="group cursor-pointer border-0 bg-card/80 backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:-translate-y-1 h-full"
                        onClick={() => action.path && navigate(action.path)}
                      >
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </CardContent>
                      </Card>
                    </ScrollReveal>
                  );
                })}
                <ScrollReveal delay={400} animation="scale-in">
                  <VisaStatusCard />
                </ScrollReveal>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScrollReveal delay={100} animation="slide-left">
                  <div className="elegant-card h-full">
                    <CardHeader>
                      <CardTitle className="font-heading">Recent Inquiries</CardTitle>
                      <CardDescription>Your latest hospital inquiries and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {inquiries.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                              No inquiries yet. Start by searching for hospitals!
                            </p>
                            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/patient/search')}>
                              Search Hospitals
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ) : (
                          inquiries.map((inquiry) => (
                            <div key={inquiry.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
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
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={200} animation="slide-right">
                  <div className="elegant-card h-full">
                    <CardHeader>
                      <CardTitle className="font-heading">Upcoming Appointments</CardTitle>
                      <CardDescription>Your scheduled consultations and treatments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bookings.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                              No upcoming appointments. Book a consultation to get started!
                            </p>
                            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/hospitals')}>
                              Browse Hospitals
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ) : (
                          bookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
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
                  </div>
                </ScrollReveal>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
