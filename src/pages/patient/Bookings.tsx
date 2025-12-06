import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, DollarSign, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AppointmentExport } from '@/components/dashboard/AppointmentExport';

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
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-muted';
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">View and manage your treatment bookings and appointments</p>
          </div>
          {bookings.length > 0 && (
            <AppointmentExport 
              appointments={exportAppointments}
              role="patient"
            />
          )}
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start by creating an inquiry and accepting a quote from a hospital
              </p>
              <Button onClick={() => navigate('/patient/inquiries')}>
                View My Inquiries
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{booking.treatment_name}</CardTitle>
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
                    
                    <div className="flex items-center justify-between py-3 border-t">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">
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
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button size="sm" onClick={() => navigate('/patient/payments')}>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
