import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, AlertCircle, FileText, Plane, Building2 } from 'lucide-react';

interface VisaApplication {
  id: string;
  workflow_stage: string;
  application_status: string;
  patient_documents_verified: boolean;
  hospital_letter_verified: boolean;
  stage_updated_at: string;
  created_at: string;
  admin_notes?: string;
  rejection_reason?: string;
}

interface WorkflowLog {
  stage: string;
  action: string;
  notes?: string;
  created_at: string;
}

const WORKFLOW_STAGES = [
  { 
    key: 'documents_uploaded', 
    label: 'Documents Uploaded',
    icon: FileText,
    description: 'Your documents have been uploaded and are pending verification'
  },
  { 
    key: 'admin_verification', 
    label: 'Admin Verification',
    icon: AlertCircle,
    description: 'Admin is reviewing your documents'
  },
  { 
    key: 'hospital_letter_verified', 
    label: 'Hospital Letter Verified',
    icon: Building2,
    description: 'Hospital invitation letter has been verified'
  },
  { 
    key: 'visa_support_approved', 
    label: 'Visa Support Approved',
    icon: CheckCircle,
    description: 'Your visa support has been approved'
  },
  { 
    key: 'sent_to_embassy', 
    label: 'Sent to Embassy',
    icon: Plane,
    description: 'Documents sent to embassy for processing'
  },
  { 
    key: 'completed', 
    label: 'Completed',
    icon: CheckCircle,
    description: 'Visa process completed successfully'
  }
];

export function VisaProgressTracker() {
  const { user } = useAuth();
  const [application, setApplication] = useState<VisaApplication | null>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVisaApplication();
    }
  }, [user]);

  const loadVisaApplication = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get latest visa application
      const { data: appData, error: appError } = await supabase
        .from('visa_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (appError) throw appError;
      
      setApplication(appData);

      // Get workflow logs
      if (appData) {
        const { data: logsData } = await supabase
          .from('visa_workflow_logs')
          .select('*')
          .eq('visa_application_id', appData.id)
          .order('created_at', { ascending: false });
        
        if (logsData) {
          setLogs(logsData);
        }
      }
    } catch (error) {
      console.error('Error loading visa application:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="p-8 text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading visa status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card className="premium-card">
        <CardContent className="p-8 text-center">
          <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Visa Application Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete your booking first to start the visa application process
          </p>
          <Button variant="outline">View Bookings</Button>
        </CardContent>
      </Card>
    );
  }

  const currentStageIndex = WORKFLOW_STAGES.findIndex(s => s.key === application.workflow_stage);
  const currentStage = WORKFLOW_STAGES[currentStageIndex];

  return (
    <div className="space-y-6">
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visa Application Progress</CardTitle>
            <Badge
              variant={
                application.application_status === 'approved'
                  ? 'default'
                  : application.application_status === 'rejected'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {application.application_status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Current Stage</span>
              <span className="text-muted-foreground">
                Step {currentStageIndex + 1} of {WORKFLOW_STAGES.length}
              </span>
            </div>
            <div className="flex gap-1">
              {WORKFLOW_STAGES.map((stage, idx) => (
                <div
                  key={stage.key}
                  className={`h-3 flex-1 rounded-full transition-all ${
                    idx <= currentStageIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Stage Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              {currentStage && (
                <>
                  <currentStage.icon className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{currentStage.label}</h3>
                    <p className="text-sm text-muted-foreground">{currentStage.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date(application.stage_updated_at).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Document Verification Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Patient Documents</span>
              </div>
              {application.patient_documents_verified ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Pending</span>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">Hospital Letter</span>
              </div>
              {application.hospital_letter_verified ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {application.admin_notes && (
            <div className="border-l-4 border-primary pl-4 py-2">
              <p className="text-sm font-medium mb-1">Admin Notes</p>
              <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {application.application_status === 'rejected' && application.rejection_reason && (
            <div className="border-l-4 border-destructive pl-4 py-2 bg-destructive/10 rounded-r">
              <p className="text-sm font-medium mb-1 text-destructive">Rejection Reason</p>
              <p className="text-sm">{application.rejection_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {logs.length > 0 && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log, idx) => (
                <div key={idx}>
                  <div className="flex gap-3">
                    <div className="relative">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      {idx < logs.length - 1 && (
                        <div className="absolute top-4 left-1 w-px h-full bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium capitalize">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {log.stage.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground">{log.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {idx < logs.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
