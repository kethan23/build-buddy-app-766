import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Plane, Hospital, CheckCircle } from 'lucide-react';

interface Booking {
  id: string;
  treatment_name: string;
  treatment_stage: string;
  status: string;
  created_at: string;
  hospital_id: string;
}

interface VisaApplication {
  id: string;
  application_status: string;
  country_of_origin: string;
  created_at: string;
}

const STAGE_PROGRESS = {
  pending: 25,
  in_review: 50,
  confirmed: 75,
  in_progress: 90,
  completed: 100,
};

const STAGE_LABELS = {
  pending: 'Pending Review',
  in_review: 'Under Review',
  confirmed: 'Confirmed',
  in_progress: 'Treatment in Progress',
  completed: 'Completed',
};

export function StatusTracking() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visaApplications, setVisaApplications] = useState<VisaApplication[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (bookingsData) setBookings(bookingsData);

    // Load visa applications
    const { data: visaData } = await supabase
      .from('visa_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (visaData) setVisaApplications(visaData);
  };

  return (
    <div className="space-y-6">
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hospital className="h-5 w-5 text-primary" />
            <span>Treatment Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bookings yet</p>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{booking.treatment_name}</h4>
                    <Badge variant={booking.treatment_stage === 'completed' ? 'default' : 'secondary'}>
                      {STAGE_LABELS[booking.treatment_stage as keyof typeof STAGE_LABELS]}
                    </Badge>
                  </div>
                  <Progress value={STAGE_PROGRESS[booking.treatment_stage as keyof typeof STAGE_PROGRESS]} />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Started: {new Date(booking.created_at).toLocaleDateString()}</span>
                    {booking.treatment_stage === 'completed' && (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-primary" />
            <span>Visa Applications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visaApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No visa applications yet</p>
          ) : (
            <div className="space-y-4">
              {visaApplications.map((visa) => (
                <div key={visa.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Visa for India</p>
                    <p className="text-sm text-muted-foreground">From: {visa.country_of_origin}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Applied: {new Date(visa.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      visa.application_status === 'approved'
                        ? 'default'
                        : visa.application_status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {visa.application_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
