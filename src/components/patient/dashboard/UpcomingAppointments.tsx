import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface UpcomingAppointmentsProps {
  bookings: any[];
  navigate: NavigateFunction;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning-foreground border border-warning/30',
  confirmed: 'bg-success/15 text-foreground border border-success/30',
  in_progress: 'bg-primary/15 text-primary border border-primary/30',
  completed: 'bg-success/15 text-foreground border border-success/30',
  cancelled: 'bg-destructive/15 text-destructive border border-destructive/30',
};

export function UpcomingAppointments({ bookings, navigate }: UpcomingAppointmentsProps) {
  return (
    <div className="elegant-card h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading">Upcoming Appointments</CardTitle>
            <CardDescription className="text-xs">Your scheduled consultations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No upcoming appointments</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Book a consultation to get started!</p>
            <Button size="sm" className="btn-gradient text-primary-foreground" onClick={() => navigate('/hospitals')}>
              Browse Hospitals
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{booking.treatment_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {booking.appointment_date
                      ? new Date(booking.appointment_date).toLocaleDateString()
                      : 'Date TBD'}
                  </p>
                </div>
                <Badge className={statusColors[booking.status] || 'bg-muted text-muted-foreground'}>
                  {booking.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-3 hover:bg-primary/5" onClick={() => navigate('/patient/bookings')}>
              View All Bookings
            </Button>
          </div>
        )}
      </CardContent>
    </div>
  );
}
