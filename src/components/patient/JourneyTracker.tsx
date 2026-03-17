import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileSearch, Plane, MapPin, Hospital, Stethoscope, Heart, CheckCircle, Lock, ShieldCheck } from 'lucide-react';

const STAGES = [
  { key: 'inquiry', label: 'Inquiry', icon: FileSearch, statusKey: 'inquiry_status', notesKey: 'inquiry_notes' },
  { key: 'visa', label: 'Visa', icon: Plane, statusKey: 'visa_status', notesKey: 'visa_notes' },
  { key: 'travel', label: 'Travel', icon: MapPin, statusKey: 'travel_status', notesKey: 'travel_notes' },
  { key: 'hospital', label: 'Hospital', icon: Hospital, statusKey: 'hospital_status', notesKey: 'hospital_notes' },
  { key: 'treatment', label: 'Treatment', icon: Stethoscope, statusKey: 'treatment_status', notesKey: 'treatment_notes' },
  { key: 'recovery', label: 'Recovery', icon: Heart, statusKey: 'recovery_status', notesKey: 'recovery_notes' },
];

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
};

export function JourneyTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracking, setTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpSending, setOtpSending] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpTrackingId, setOtpTrackingId] = useState<string | null>(null);
  const [verified, setVerified] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) loadTracking();
  }, [user]);

  const loadTracking = async () => {
    const { data } = await supabase
      .from('patient_journey_tracking')
      .select('*')
      .eq('patient_id', user?.id)
      .order('created_at', { ascending: false });
    setTracking(data || []);
    setLoading(false);
  };

  const requestOtp = async (trackingId: string) => {
    setOtpSending(true);
    try {
      const res = await supabase.functions.invoke('send-tracking-otp', {
        body: { tracking_id: trackingId },
      });
      if (res.error) throw new Error(res.error.message);
      setOtpTrackingId(trackingId);
      toast({ title: 'OTP Sent', description: 'Check your email or phone for the verification code' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setOtpSending(false);
  };

  const verifyOtp = async () => {
    if (!otpTrackingId || !otpInput) return;
    try {
      const res = await supabase.functions.invoke('verify-tracking-otp', {
        body: { tracking_id: otpTrackingId, otp: otpInput },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.verified) {
        setVerified((prev) => new Set(prev).add(otpTrackingId));
        setOtpTrackingId(null);
        setOtpInput('');
        toast({ title: 'Verified', description: 'You can now update your journey status' });
        await loadTracking();
      } else {
        toast({ title: 'Invalid OTP', description: 'Please try again', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'on_hold': return 'bg-orange-500';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading journey data...</div>;
  }

  if (tracking.length === 0) {
    return (
      <Card className="premium-card">
        <CardContent className="p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Journey Tracking</h3>
          <p className="text-muted-foreground">Your journey tracking will appear here once your agent sets it up.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tracking.map((track) => {
        const isVerified = verified.has(track.id) || track.otp_verified;
        return (
          <Card key={track.id} className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Treatment Journey
                </span>
                {isVerified ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <ShieldCheck className="h-3 w-3 mr-1" /> OTP Verified
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => requestOtp(track.id)}
                    disabled={otpSending}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    {otpSending ? 'Sending...' : 'Verify to Update'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OTP Input */}
              {otpTrackingId === track.id && !isVerified && (
                <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
                  <Input
                    placeholder="Enter OTP code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    maxLength={6}
                    className="max-w-[200px]"
                  />
                  <Button onClick={verifyOtp} size="sm">Verify</Button>
                </div>
              )}

              {/* Pipeline Progress */}
              <div className="flex items-center justify-between">
                {STAGES.map((stage, idx) => {
                  const status = track[stage.statusKey] || 'not_started';
                  const isCompleted = status === 'completed';
                  const isActive = status === 'in_progress';
                  const Icon = stage.icon;
                  return (
                    <div key={stage.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isActive ? 'bg-primary text-primary-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <span className={`text-[10px] sm:text-xs mt-1 font-medium text-center ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                      {idx < STAGES.length - 1 && (
                        <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stage Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STAGES.map((stage) => {
                  const status = track[stage.statusKey] || 'not_started';
                  const notes = track[stage.notesKey];
                  const Icon = stage.icon;
                  return (
                    <div key={stage.key} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          {stage.label}
                        </span>
                        <Badge variant={getStatusBadge(status) as any} className="text-[10px]">
                          {STATUS_LABELS[status] || status}
                        </Badge>
                      </div>
                      {notes && (
                        <p className="text-xs text-muted-foreground">{notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground text-right">
                Last updated: {new Date(track.updated_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
