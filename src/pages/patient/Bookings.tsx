import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, DollarSign, FileText, Sparkles, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AppointmentExport } from '@/components/dashboard/AppointmentExport';
import { ScrollReveal } from '@/hooks/useScrollAnimation';

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadBookings();
      loadProfile();
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

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hospitals(name, address, city, country, logo_url)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading bookings',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setBookings(data || []);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning/15 text-warning-foreground border border-warning/30',
      confirmed: 'bg-success/15 text-foreground border border-success/30',
      in_progress: 'bg-primary/15 text-primary border border-primary/30',
      completed: 'bg-success/15 text-foreground border border-success/30',
      cancelled: 'bg-destructive/15 text-destructive border border-destructive/30',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const exportAppointments = bookings.map(booking => ({
    appointment_id: booking.appointment_id || booking.id.slice(0, 12),
    patient_name: profile?.full_name || 'Unknown',
    scheduled_date: booking.appointment_date
      ? new Date(booking.appointment_date).toLocaleString()
      : 'Not scheduled',
    caretaker_name: profile?.caretaker_name,
    caretaker_phone: profile?.caretaker_phone,
    hospital_name: booking.hospitals?.name || 'N/A',
    hospital_address: booking.hospitals
      ? `${booking.hospitals.address || ''}, ${booking.hospitals.city || ''}, ${booking.hospitals.country || ''}`.trim()
      : 'N/A',
    treatment_name: booking.treatment_name,
    status: booking.status,
    total_amount: booking.total_amount,
    currency: booking.currency,
  }));

  return (
    <div className="min-h-screen relative">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary">MediConnect</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="section-badge w-fit mb-3">
                <Package className="h-4 w-4" />
                Treatment Bookings
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">My Bookings</h1>
              <p className="text-muted-foreground">View and manage your treatment bookings and appointments</p>
            </div>
            {bookings.length > 0 && (
              <AppointmentExport
                appointments={exportAppointments}
                role="patient"
              />
            )}
          </div>
        </ScrollReveal>

        {bookings.length === 0 ? (
          <ScrollReveal delay={150}>
            <div className="elegant-card">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Start by creating an inquiry and accepting a quote from a hospital to begin your medical journey.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate('/patient/inquiries')}>
                    View My Inquiries
                  </Button>
                  <Button className="btn-gradient text-white" onClick={() => navigate('/hospitals')}>
                    Browse Hospitals
                  </Button>
                </div>
              </CardContent>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <ScrollReveal key={booking.id} delay={index * 100} animation="fade-up">
                <div className="elegant-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="font-heading">{booking.treatment_name}</CardTitle>
                        </div>
                        <CardDescription>
                          <span className="font-medium text-primary">
                            Appointment ID: {booking.appointment_id || booking.id.slice(0, 12)}
                          </span>
                          {booking.appointment_date && ` • ${new Date(booking.appointment_date).toLocaleDateString()}`}
                        </CardDescription>
                        {booking.hospitals && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Hospital: {booking.hospitals.name}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {booking.notes && (
                        <p className="text-sm text-muted-foreground">{booking.notes}</p>
                      )}

                      <div className="flex items-center justify-between py-3 border-t border-border/50">
                        <div className="flex items-center text-sm">
                          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mr-2">
                            <DollarSign className="h-4 w-4 text-success" />
                          </div>
                          <span className="font-semibold">
                            {booking.total_amount
                              ? `${booking.currency} ${booking.total_amount.toLocaleString()}`
                              : 'Price TBD'}
                          </span>
                        </div>
                        {booking.appointment_date && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(booking.appointment_date).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="h-4 w-4" />
                          View Details
                        </Button>
                        {booking.status === 'confirmed' && (
                          <Button size="sm" className="btn-gradient text-white" onClick={() => navigate('/patient/payments')}>
                            View Payment
                          </Button>
                        )}
                        {booking.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            Modify Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
