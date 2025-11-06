import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Plane, User, FileText, Download, Eye, AlertCircle } from 'lucide-react';

interface VisaApplication {
  id: string;
  user_id: string;
  country_of_origin: string;
  passport_number: string;
  application_status: string;
  workflow_stage: string;
  patient_documents_verified: boolean;
  hospital_letter_verified: boolean;
  stage_updated_at: string;
  created_at: string;
  admin_notes: string;
  rejection_reason?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface DocumentChecklistItem {
  id: string;
  document_type: string;
  is_uploaded: boolean;
  is_verified: boolean;
  verification_notes?: string;
  document_id?: string;
}

const WORKFLOW_STAGES = [
  { key: 'documents_uploaded', label: 'Documents Uploaded' },
  { key: 'admin_verification', label: 'Admin Verification' },
  { key: 'hospital_letter_verified', label: 'Hospital Letter Verified' },
  { key: 'visa_support_approved', label: 'Visa Support Approved' },
  { key: 'sent_to_embassy', label: 'Sent to Embassy' },
  { key: 'completed', label: 'Completed' }
];

const DOCUMENT_TYPES = [
  { key: 'passport', label: 'Passport Copy' },
  { key: 'medical_reports', label: 'Medical Reports' },
  { key: 'treatment_letter', label: 'Treatment Request Letter' },
  { key: 'photographs', label: 'Recent Photographs' },
  { key: 'flight_booking', label: 'Flight Booking' }
];

export function VisaApproval() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [checklist, setChecklist] = useState<{ [key: string]: DocumentChecklistItem[] }>({});
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
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
      const appsWithProfiles = await Promise.all(
        data.map(async (app) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', app.user_id)
            .single();
          
          // Load checklist for each application
          const { data: checklistData } = await supabase
            .from('visa_document_checklist')
            .select('*')
            .eq('visa_application_id', app.id);
          
          if (checklistData) {
            setChecklist(prev => ({ ...prev, [app.id]: checklistData }));
          }
          
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

  const verifyDocument = async (appId: string, docType: string, verified: boolean) => {
    setLoading(true);
    try {
      const checklistItem = checklist[appId]?.find(item => item.document_type === docType);
      
      if (checklistItem) {
        const { error } = await supabase
          .from('visa_document_checklist')
          .update({
            is_verified: verified,
            verified_by: user?.id,
            verified_at: new Date().toISOString()
          })
          .eq('id', checklistItem.id);

        if (error) throw error;
      }

      // Log the action
      await supabase.from('visa_workflow_logs').insert({
        visa_application_id: appId,
        stage: 'document_verification',
        action: verified ? 'document_verified' : 'document_rejected',
        performed_by: user?.id,
        notes: `${docType} ${verified ? 'verified' : 'rejected'}`
      });

      toast.success(`Document ${verified ? 'verified' : 'rejected'}`);
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflowStage = async (appId: string, stage: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('visa_applications')
        .update({ workflow_stage: stage })
        .eq('id', appId);

      if (error) throw error;

      await supabase.from('visa_workflow_logs').insert({
        visa_application_id: appId,
        stage,
        action: 'stage_updated',
        performed_by: user?.id,
        notes: `Workflow moved to ${stage}`
      });

      toast.success('Workflow stage updated');
      loadApplications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (appId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const updateData: any = {
        application_status: status,
        admin_notes: notes[appId] || '',
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved') {
        updateData.workflow_stage = 'visa_support_approved';
        updateData.verified_by = user?.id;
        updateData.verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('visa_applications')
        .update(updateData)
        .eq('id', appId);

      if (error) throw error;

      await supabase.from('visa_workflow_logs').insert({
        visa_application_id: appId,
        stage: 'final_decision',
        action: status,
        performed_by: user?.id,
        notes: notes[appId] || ''
      });

      // Send notification
      const app = applications.find(a => a.id === appId);
      if (app) {
        await supabase.from('notifications').insert({
          user_id: app.user_id,
          title: `Visa Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: status === 'approved' 
            ? 'Your visa application has been approved. You can now proceed with embassy submission.' 
            : `Your visa application has been rejected. Reason: ${notes[appId] || 'Please contact support'}`,
          type: 'visa',
          related_id: appId
        });
      }

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
          <span>Visa Applications & Verification</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {pendingApps.length} applications pending approval
        </p>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No visa applications</p>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-lg p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <p className="font-medium">{app.profiles?.full_name || 'Unknown'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.profiles?.email}</p>
                  </div>
                  <div className="flex gap-2">
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
                    <Badge variant="outline">
                      {WORKFLOW_STAGES.find(s => s.key === app.workflow_stage)?.label || app.workflow_stage}
                    </Badge>
                  </div>
                </div>

                {/* Workflow Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Workflow Progress</span>
                    <span className="text-muted-foreground">
                      {WORKFLOW_STAGES.findIndex(s => s.key === app.workflow_stage) + 1} of {WORKFLOW_STAGES.length}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {WORKFLOW_STAGES.map((stage, idx) => (
                      <div
                        key={stage.key}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          WORKFLOW_STAGES.findIndex(s => s.key === app.workflow_stage) >= idx
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(app.stage_updated_at).toLocaleString()}
                  </div>
                </div>

                <Separator />

                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Country:</span> {app.country_of_origin}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Passport:</span> {app.passport_number || 'N/A'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied:</span>{' '}
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Documents:</span>
                    {app.patient_documents_verified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>

                <Separator />

                {/* Document Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Document Verification Checklist</h4>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedApp(app.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Document Verification - {app.profiles?.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          {DOCUMENT_TYPES.map((docType) => {
                            const checklistItem = checklist[app.id]?.find(
                              item => item.document_type === docType.key
                            );
                            return (
                              <div key={docType.key} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-medium">{docType.label}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant={checklistItem?.is_uploaded ? 'default' : 'secondary'}>
                                      {checklistItem?.is_uploaded ? 'Uploaded' : 'Pending'}
                                    </Badge>
                                    {checklistItem?.is_verified && (
                                      <Badge variant="default">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {checklistItem?.is_uploaded && (
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      variant={checklistItem.is_verified ? 'outline' : 'default'}
                                      size="sm"
                                      onClick={() => verifyDocument(app.id, docType.key, true)}
                                      disabled={loading}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {checklistItem.is_verified ? 'Verified' : 'Verify'}
                                    </Button>
                                    <Button variant="outline" size="sm" disabled>
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Quick checklist summary */}
                  <div className="grid grid-cols-3 gap-2">
                    {DOCUMENT_TYPES.slice(0, 3).map((docType) => {
                      const item = checklist[app.id]?.find(i => i.document_type === docType.key);
                      return (
                        <div key={docType.key} className="flex items-center gap-2 text-xs">
                          <Checkbox 
                            checked={item?.is_verified || false} 
                            disabled 
                          />
                          <span className="truncate">{docType.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Stage Management */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Workflow Stage</label>
                  <select
                    value={app.workflow_stage}
                    onChange={(e) => updateWorkflowStage(app.id, e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                    disabled={loading}
                  >
                    {WORKFLOW_STAGES.map((stage) => (
                      <option key={stage.key} value={stage.key}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Admin Notes / Rejection Reason</label>
                  <Textarea
                    value={notes[app.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                    placeholder="Add notes about this application or reason for rejection..."
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                {app.application_status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => updateApplication(app.id, 'approved')}
                      disabled={loading}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve & Generate Visa Support
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateApplication(app.id, 'rejected')}
                      disabled={loading}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject Application
                    </Button>
                  </div>
                )}

                {app.application_status === 'approved' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Download className="h-4 w-4 mr-1" />
                      Download Visa Support Package
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateWorkflowStage(app.id, 'sent_to_embassy')}
                      disabled={loading}
                    >
                      Mark as Sent to Embassy
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
