import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingForm } from '@/components/patient/OnboardingForm';
import { DocumentUpload } from '@/components/patient/DocumentUpload';
import { StatusTracking } from '@/components/patient/StatusTracking';
import { VisaProgressTracker } from '@/components/patient/VisaProgressTracker';
import { JourneyTracker } from '@/components/patient/JourneyTracker';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/patient/dashboard/DashboardHeader';
import { QuickActions } from '@/components/patient/dashboard/QuickActions';
import { RecentInquiries } from '@/components/patient/dashboard/RecentInquiries';
import { UpcomingAppointments } from '@/components/patient/dashboard/UpcomingAppointments';

const Dashboard = () => {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative">
        {/* Decorative background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 left-0 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <DashboardHeader profileName={profile?.full_name} />

          <Tabs defaultValue="overview" className="space-y-6">
            <ScrollReveal delay={100}>
              <TabsList className="glass-card border-0 p-1.5 w-full max-w-3xl grid grid-cols-5 gap-1">
                {['overview', 'journey', 'onboarding', 'documents', 'status', 'visa'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                  >
                    {tab === 'onboarding' ? 'Profile' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollReveal>

            <TabsContent value="overview" className="space-y-8">
              <QuickActions navigate={navigate} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScrollReveal delay={200} animation="slide-left">
                  <RecentInquiries inquiries={inquiries} navigate={navigate} />
                </ScrollReveal>
                <ScrollReveal delay={300} animation="slide-right">
                  <UpcomingAppointments bookings={bookings} navigate={navigate} />
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
