import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Plane, User } from 'lucide-react';

interface VisaApplication {
  id: string;
  country_of_origin: string;
  passport_number: string;
  application_status: string;
  created_at: string;
  admin_notes: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function VisaApproval() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profile data separately
      const appsWithProfiles = await Promise.all(
        data.map(async (app) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', app.user_id)
            .single();
          
          return { ...app, profiles: profile };
        })
      );
      setApplications(appsWithProfiles as any);
      const notesObj: { [key: string]: string } = {};
      appsWithProfiles.forEach(app => {
        notesObj[app.id] = app.admin_notes || '';
      });
      setNotes(notesObj);
    }
  };

  const updateApplication = async (appId: string, status: 'approved' | 'rejected') => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('visa_applications')
        .update({
          application_status: status,
          admin_notes: notes[appId] || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appId);

      if (error) throw error;

      toast.success(`Visa application ${status}`);
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  const pendingApps = applications.filter(a => a.application_status === 'pending');

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plane className="h-5 w-5 text-primary" />
          <span>Visa Applications</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {pendingApps.length} applications pending approval
        </p>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No visa applications</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <p className="font-medium">{app.profiles?.full_name || 'Unknown'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.profiles?.email}</p>
                  </div>
                  <Badge
                    variant={
                      app.application_status === 'approved'
                        ? 'default'
                        : app.application_status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {app.application_status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span> {app.country_of_origin}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Passport:</span> {app.passport_number || 'N/A'}
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Applied:</span>{' '}
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Admin Notes</label>
                  <Textarea
                    value={notes[app.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                    placeholder="Add notes about this application..."
                    rows={2}
                  />
                </div>

                {app.application_status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateApplication(app.id, 'approved')}
                      disabled={loading}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateApplication(app.id, 'rejected')}
                      disabled={loading}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
