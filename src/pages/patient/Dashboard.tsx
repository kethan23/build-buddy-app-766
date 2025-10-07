import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Calendar, Bell, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary">MediConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/patient/profile')}>
                Profile
              </Button>
              <Button variant="ghost" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome back, {profile?.full_name || 'Patient'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your medical journey and connect with world-class healthcare providers.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/patient/search')}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Search className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-sm font-medium">Search Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Find the perfect hospital for your treatment</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/patient/inquiries')}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-sm font-medium">View Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Track your hospital inquiries</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/patient/bookings')}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-sm font-medium">Book Consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Schedule appointments and treatments</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
          <Card>
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
          <Card>
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

        {/* Progress Tracking */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Your Medical Journey Progress
            </CardTitle>
            <CardDescription>Complete your profile to get personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile Completion</span>
                <span className="text-sm font-medium">
                  {profile ? (
                    <>
                      {Math.round(
                        (Object.values(profile).filter(v => v !== null && v !== '').length /
                          Object.keys(profile).length) * 100
                      )}%
                    </>
                  ) : '0%'}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ 
                    width: profile 
                      ? `${Math.round(
                          (Object.values(profile).filter(v => v !== null && v !== '').length /
                            Object.keys(profile).length) * 100
                        )}%`
                      : '0%'
                  }}
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/patient/profile')}
              >
                Complete Your Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
