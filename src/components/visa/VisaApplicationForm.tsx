import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, Plane, Users, FileText, CheckCircle, 
  ArrowLeft, ArrowRight, Upload, AlertCircle, Loader2 
} from 'lucide-react';

interface CountryRequirement {
  id: string;
  country_code: string;
  country_name: string;
  required_documents: string[];
  processing_time_days: number;
  validity_days: number;
  fees_usd: number;
  special_notes: string | null;
}

interface Attendant {
  full_name: string;
  relationship: string;
  passport_number: string;
  passport_expiry: string;
  date_of_birth: string;
  nationality: string;
}

interface FormData {
  // Step 1: Personal Info
  country_of_origin: string;
  passport_number: string;
  passport_expiry: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  // Step 2: Travel Details
  estimated_arrival_date: string;
  estimated_departure_date: string;
  accommodation_needed: boolean;
  airport_pickup_needed: boolean;
  visa_type: string;
  treatment_details: string;
  // Step 3: Attendants
  number_of_attendants: number;
  attendants: Attendant[];
  // Consent
  consent_given: boolean;
}

const STEPS = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Travel Details', icon: Plane },
  { id: 3, title: 'Attendants', icon: Users },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Review & Submit', icon: CheckCircle },
];

const DOCUMENT_LABELS: Record<string, string> = {
  passport: 'Passport (Front & Back)',
  passport_photo: 'Passport-size Photograph',
  medical_reports: 'Medical Reports',
  hospital_invitation: 'Hospital Invitation Letter',
  financial_proof: 'Financial Proof (Bank Statement)',
  travel_insurance: 'Travel Insurance',
  bank_statement: 'Bank Statement (Last 6 months)',
  police_clearance: 'Police Clearance Certificate',
};

export function VisaApplicationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<CountryRequirement[]>([]);
  const [selectedCountryReqs, setSelectedCountryReqs] = useState<CountryRequirement | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    country_of_origin: '',
    passport_number: '',
    passport_expiry: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    estimated_arrival_date: '',
    estimated_departure_date: '',
    accommodation_needed: false,
    airport_pickup_needed: false,
    visa_type: 'medical_visa',
    treatment_details: '',
    number_of_attendants: 0,
    attendants: [],
    consent_given: false,
  });

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (formData.country_of_origin) {
      const country = countries.find(c => c.country_code === formData.country_of_origin);
      setSelectedCountryReqs(country || null);
    }
  }, [formData.country_of_origin, countries]);

  const loadCountries = async () => {
    const { data, error } = await supabase
      .from('visa_country_requirements')
      .select('*')
      .eq('is_active', true)
      .order('country_name');

    if (data && !error) {
      setCountries(data.map(c => ({
        id: c.id,
        country_code: c.country_code,
        country_name: c.country_name,
        processing_time_days: c.processing_time_days ?? 15,
        validity_days: c.validity_days ?? 90,
        fees_usd: Number(c.fees_usd) || 0,
        special_notes: c.special_notes,
        required_documents: Array.isArray(c.required_documents) 
          ? (c.required_documents as string[]) 
          : []
      })));
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAttendant = () => {
    if (formData.attendants.length < 3) {
      setFormData(prev => ({
        ...prev,
        attendants: [...prev.attendants, {
          full_name: '',
          relationship: '',
          passport_number: '',
          passport_expiry: '',
          date_of_birth: '',
          nationality: '',
        }],
        number_of_attendants: prev.number_of_attendants + 1,
      }));
    }
  };

  const updateAttendant = (index: number, field: keyof Attendant, value: string) => {
    setFormData(prev => {
      const updated = [...prev.attendants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, attendants: updated };
    });
  };

  const removeAttendant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendants: prev.attendants.filter((_, i) => i !== index),
      number_of_attendants: prev.number_of_attendants - 1,
    }));
  };

  const handleDocumentUpload = async (docType: string, file: File) => {
    if (!user) return;
    
    setUploading(docType);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/visa-docs/${docType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadedDocs(prev => ({ ...prev, [docType]: true }));
      toast.success(`${DOCUMENT_LABELS[docType] || docType} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.country_of_origin && formData.passport_number && formData.passport_expiry);
      case 2:
        return !!(formData.estimated_arrival_date && formData.estimated_departure_date);
      case 3:
        return formData.attendants.every(a => a.full_name && a.relationship);
      case 4:
        const required = selectedCountryReqs?.required_documents || [];
        return required.every(doc => uploadedDocs[doc]);
      case 5:
        return formData.consent_given;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const submitApplication = async () => {
    if (!user || !formData.consent_given) return;

    setLoading(true);
    try {
      // Create visa application
      const { data: application, error: appError } = await supabase
        .from('visa_applications')
        .insert({
          user_id: user.id,
          country_of_origin: formData.country_of_origin,
          passport_number: formData.passport_number,
          passport_expiry: formData.passport_expiry,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          estimated_arrival_date: formData.estimated_arrival_date,
          estimated_departure_date: formData.estimated_departure_date,
          accommodation_needed: formData.accommodation_needed,
          airport_pickup_needed: formData.airport_pickup_needed,
          visa_type: formData.visa_type,
          treatment_details: formData.treatment_details,
          number_of_attendants: formData.number_of_attendants,
          workflow_stage: 'documents_uploaded',
          application_status: 'pending',
          destination_country: 'India',
        })
        .select()
        .single();

      if (appError) throw appError;

      // Add attendants if any
      if (formData.attendants.length > 0 && application) {
        const attendantsData = formData.attendants.map(a => ({
          visa_application_id: application.id,
          ...a,
        }));

        const { error: attendantError } = await supabase
          .from('visa_attendants')
          .insert(attendantsData);

        if (attendantError) throw attendantError;
      }

      // Create initial workflow log
      if (application) {
        await supabase
          .from('visa_workflow_logs')
          .insert({
            visa_application_id: application.id,
            stage: 'documents_uploaded',
            action: 'application_submitted',
            notes: 'Visa application submitted by patient',
            performed_by: user.id,
          });
      }

      toast.success('Visa application submitted successfully!');
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              currentStep >= step.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <step.icon className="h-5 w-5" />
          </div>
          <span className={`ml-2 text-sm font-medium hidden md:block ${
            currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {step.title}
          </span>
          {idx < STEPS.length - 1 && (
            <div className={`w-8 md:w-16 h-1 mx-2 rounded ${
              currentStep > step.id ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country of Origin *</Label>
          <Select value={formData.country_of_origin} onValueChange={v => updateFormData('country_of_origin', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.country_code} value={country.country_code}>
                  {country.country_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visa_type">Visa Type *</Label>
          <Select value={formData.visa_type} onValueChange={v => updateFormData('visa_type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medical_visa">Medical Visa</SelectItem>
              <SelectItem value="medical_attendant_visa">Medical Attendant Visa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="passport_number">Passport Number *</Label>
          <Input
            id="passport_number"
            value={formData.passport_number}
            onChange={e => updateFormData('passport_number', e.target.value)}
            placeholder="Enter passport number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passport_expiry">Passport Expiry Date *</Label>
          <Input
            id="passport_expiry"
            type="date"
            value={formData.passport_expiry}
            onChange={e => updateFormData('passport_expiry', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emergency_name">Emergency Contact Name</Label>
          <Input
            id="emergency_name"
            value={formData.emergency_contact_name}
            onChange={e => updateFormData('emergency_contact_name', e.target.value)}
            placeholder="Emergency contact name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
          <Input
            id="emergency_phone"
            value={formData.emergency_contact_phone}
            onChange={e => updateFormData('emergency_contact_phone', e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      {selectedCountryReqs && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Visa Requirements for {selectedCountryReqs.country_name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Processing time: ~{selectedCountryReqs.processing_time_days} days | 
                  Validity: {selectedCountryReqs.validity_days} days | 
                  Fee: ${selectedCountryReqs.fees_usd} USD
                </p>
                {selectedCountryReqs.special_notes && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedCountryReqs.special_notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="arrival">Estimated Arrival Date *</Label>
          <Input
            id="arrival"
            type="date"
            value={formData.estimated_arrival_date}
            onChange={e => updateFormData('estimated_arrival_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="departure">Estimated Departure Date *</Label>
          <Input
            id="departure"
            type="date"
            value={formData.estimated_departure_date}
            onChange={e => updateFormData('estimated_departure_date', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment_details">Treatment Details</Label>
        <Textarea
          id="treatment_details"
          value={formData.treatment_details}
          onChange={e => updateFormData('treatment_details', e.target.value)}
          placeholder="Describe your planned treatment or procedure..."
          rows={4}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Travel Assistance Required</Label>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="accommodation"
            checked={formData.accommodation_needed}
            onCheckedChange={checked => updateFormData('accommodation_needed', checked)}
          />
          <Label htmlFor="accommodation" className="font-normal cursor-pointer">
            I need help with accommodation arrangements
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="airport"
            checked={formData.airport_pickup_needed}
            onCheckedChange={checked => updateFormData('airport_pickup_needed', checked)}
          />
          <Label htmlFor="airport" className="font-normal cursor-pointer">
            I need airport pickup/transfer service
          </Label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Accompanying Attendants</h3>
          <p className="text-sm text-muted-foreground">Add up to 3 attendants traveling with you</p>
        </div>
        <Button
          variant="outline"
          onClick={addAttendant}
          disabled={formData.attendants.length >= 3}
        >
          <Users className="h-4 w-4 mr-2" />
          Add Attendant
        </Button>
      </div>

      {formData.attendants.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No attendants added yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Attendant" to include a companion</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {formData.attendants.map((attendant, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Attendant {idx + 1}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => removeAttendant(idx)}>
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={attendant.full_name}
                      onChange={e => updateAttendant(idx, 'full_name', e.target.value)}
                      placeholder="Full name as in passport"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship *</Label>
                    <Select 
                      value={attendant.relationship}
                      onValueChange={v => updateAttendant(idx, 'relationship', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="relative">Other Relative</SelectItem>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Passport Number</Label>
                    <Input
                      value={attendant.passport_number}
                      onChange={e => updateAttendant(idx, 'passport_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passport Expiry</Label>
                    <Input
                      type="date"
                      value={attendant.passport_expiry}
                      onChange={e => updateAttendant(idx, 'passport_expiry', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={attendant.date_of_birth}
                      onChange={e => updateAttendant(idx, 'date_of_birth', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-1">Required Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload all required documents based on your country requirements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(selectedCountryReqs?.required_documents || ['passport', 'passport_photo', 'medical_reports']).map(docType => (
          <Card key={docType} className={uploadedDocs[docType] ? 'border-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {uploadedDocs[docType] ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{DOCUMENT_LABELS[docType] || docType}</p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedDocs[docType] ? 'Uploaded' : 'Required'}
                    </p>
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    id={`doc-${docType}`}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(docType, file);
                    }}
                  />
                  <Button
                    variant={uploadedDocs[docType] ? "outline" : "default"}
                    size="sm"
                    disabled={uploading === docType}
                    onClick={() => document.getElementById(`doc-${docType}`)?.click()}
                  >
                    {uploading === docType ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : uploadedDocs[docType] ? (
                      'Replace'
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" /> Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Document Guidelines</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• All documents must be clear and readable</li>
                <li>• Passport must be valid for at least 6 months</li>
                <li>• Photos must meet passport photo specifications</li>
                <li>• Accepted formats: PDF, JPG, PNG (max 10MB)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-1">Review Your Application</h3>
        <p className="text-sm text-muted-foreground">
          Please review all information before submitting
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Country:</span> {countries.find(c => c.country_code === formData.country_of_origin)?.country_name}</p>
            <p><span className="text-muted-foreground">Passport:</span> {formData.passport_number}</p>
            <p><span className="text-muted-foreground">Expiry:</span> {formData.passport_expiry}</p>
            <p><span className="text-muted-foreground">Visa Type:</span> {formData.visa_type.replace(/_/g, ' ')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Plane className="h-4 w-4" /> Travel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Arrival:</span> {formData.estimated_arrival_date}</p>
            <p><span className="text-muted-foreground">Departure:</span> {formData.estimated_departure_date}</p>
            <p><span className="text-muted-foreground">Accommodation:</span> {formData.accommodation_needed ? 'Yes' : 'No'}</p>
            <p><span className="text-muted-foreground">Airport Pickup:</span> {formData.airport_pickup_needed ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
      </div>

      {formData.attendants.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Attendants ({formData.attendants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.attendants.map((a, i) => (
                <Badge key={i} variant="secondary">
                  {a.full_name} ({a.relationship})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Documents Uploaded
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(uploadedDocs).filter(k => uploadedDocs[k]).map(doc => (
              <Badge key={doc} variant="outline" className="text-primary border-primary">
                <CheckCircle className="h-3 w-3 mr-1" />
                {DOCUMENT_LABELS[doc] || doc}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={formData.consent_given}
              onCheckedChange={checked => updateFormData('consent_given', checked)}
            />
            <Label htmlFor="consent" className="font-normal text-sm cursor-pointer">
              I confirm that all information provided is accurate. I understand that visa approval is 
              subject to embassy discretion and MediConnect does not guarantee visa issuance. I consent 
              to the processing of my personal data for visa assistance purposes.
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-xl">Visa Application</CardTitle>
        <CardDescription>
          Complete all steps to submit your medical visa application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}

        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submitApplication}
              disabled={!formData.consent_given || loading}
              className="btn-gradient"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit Application
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
