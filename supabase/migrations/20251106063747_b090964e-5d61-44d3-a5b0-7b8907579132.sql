-- Add visa workflow stages and enhanced tracking
ALTER TABLE visa_applications 
ADD COLUMN IF NOT EXISTS workflow_stage text DEFAULT 'documents_uploaded' CHECK (workflow_stage IN ('documents_uploaded', 'admin_verification', 'hospital_letter_verified', 'visa_support_approved', 'sent_to_embassy', 'completed')),
ADD COLUMN IF NOT EXISTS stage_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS visa_support_document_url text,
ADD COLUMN IF NOT EXISTS patient_documents_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hospital_letter_verified boolean DEFAULT false;

-- Add document verification checklist
CREATE TABLE IF NOT EXISTS visa_document_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_application_id uuid REFERENCES visa_applications(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('passport', 'medical_reports', 'treatment_letter', 'photographs', 'flight_booking')),
  is_uploaded boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamp with time zone,
  verification_notes text,
  document_id uuid REFERENCES documents(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE visa_document_checklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visa_document_checklist
CREATE POLICY "Admins can manage document checklist"
ON visa_document_checklist FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own document checklist"
ON visa_document_checklist FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM visa_applications 
    WHERE visa_applications.id = visa_document_checklist.visa_application_id 
    AND visa_applications.user_id = auth.uid()
  )
);

-- Add visa workflow audit log
CREATE TABLE IF NOT EXISTS visa_workflow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_application_id uuid REFERENCES visa_applications(id) ON DELETE CASCADE NOT NULL,
  stage text NOT NULL,
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) NOT NULL,
  notes text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE visa_workflow_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visa_workflow_logs
CREATE POLICY "Admins can view all workflow logs"
ON visa_workflow_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own workflow logs"
ON visa_workflow_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM visa_applications 
    WHERE visa_applications.id = visa_workflow_logs.visa_application_id 
    AND visa_applications.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert workflow logs"
ON visa_workflow_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add hospital visa support documents category
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS visa_application_id uuid REFERENCES visa_applications(id);

-- Function to update workflow stage timestamp
CREATE OR REPLACE FUNCTION update_visa_stage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.workflow_stage IS DISTINCT FROM OLD.workflow_stage THEN
    NEW.stage_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workflow stage updates
DROP TRIGGER IF EXISTS visa_stage_update_trigger ON visa_applications;
CREATE TRIGGER visa_stage_update_trigger
BEFORE UPDATE ON visa_applications
FOR EACH ROW
EXECUTE FUNCTION update_visa_stage_timestamp();

-- Update trigger for checklist
CREATE OR REPLACE FUNCTION update_checklist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS checklist_update_trigger ON visa_document_checklist;
CREATE TRIGGER checklist_update_trigger
BEFORE UPDATE ON visa_document_checklist
FOR EACH ROW
EXECUTE FUNCTION update_checklist_timestamp();