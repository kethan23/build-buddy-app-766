import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plane, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface VisaApplication {
  id: string;
  workflow_stage: string;
  application_status: string;
  country_of_origin: string;
  created_at: string;
  stage_updated_at: string;
}

const WORKFLOW_STAGES = [
  'documents_uploaded',
  'admin_verification',
  'hospital_letter_verified',
  'visa_support_approved',
  'sent_to_embassy',
  'completed'
];

const STAGE_LABELS: Record<string, string> = {
  documents_uploaded: 'Documents Uploaded',
  admin_verification: 'Under Review',
  hospital_letter_verified: 'Hospital Verified',
  visa_support_approved: 'Support Approved',
  sent_to_embassy: 'At Embassy',
  completed: 'Completed',
  rejected: 'Rejected'
};

export function VisaStatusCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<VisaApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVisaStatus();
    }
  }, [user]);

  const loadVisaStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('visa_applications')
        .select('id, workflow_stage, application_status, country_of_origin, created_at, stage_updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      setApplication(data);
    } catch (error) {
      // No application found is not an error
      console.log('No visa application found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="premium-card">
        <CardContent className="p-6 flex items-center justify-center">
          <Clock className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card className="premium-card cursor-pointer hover-lift" onClick={() => navigate('/patient/visa-application')}>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Plane className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-sm font-medium">Visa Assistance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Need help with your medical visa? Apply now for comprehensive support.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Apply for Visa Support
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStageIndex = WORKFLOW_STAGES.indexOf(application.workflow_stage);
  const progress = application.application_status === 'rejected' 
    ? 0 
    : ((currentStageIndex + 1) / WORKFLOW_STAGES.length) * 100;

  const getStatusIcon = () => {
    if (application.application_status === 'approved' || application.workflow_stage === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (application.application_status === 'rejected') {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
    return <Clock className="h-5 w-5 text-primary" />;
  };

  const getStatusBadge = () => {
    if (application.application_status === 'approved' || application.workflow_stage === 'completed') {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
    if (application.application_status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="secondary">{STAGE_LABELS[application.workflow_stage] || 'Processing'}</Badge>;
  };

  return (
    <Card className="premium-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-sm font-medium">Visa Application</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">From: {application.country_of_origin}</span>
          <span className="text-muted-foreground">
            {new Date(application.stage_updated_at).toLocaleDateString()}
          </span>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate('/patient/dashboard')}
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
