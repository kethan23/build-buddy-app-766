import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface VisaSupportUploadProps {
  bookingId: string;
  patientName: string;
  treatmentName: string;
}

export function VisaSupportUpload({ bookingId, patientName, treatmentName }: VisaSupportUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    doctorDesignation: '',
    treatmentPurpose: '',
    treatmentDuration: '',
    stayDuration: '',
    additionalNotes: ''
  });

  const generateInvitationLetter = async () => {
    if (!user) return;
    
    setUploading(true);
    try {
      // Get hospital details
      const { data: hospital } = await supabase
        .from('hospitals')
        .select('name, address, city, state, country, phone, email')
        .eq('user_id', user.id)
        .single();

      if (!hospital) {
        toast.error('Hospital information not found');
        return;
      }

      // Generate letter content
      const letterContent = `
MEDICAL VISA SUPPORT LETTER

${hospital.name}
${hospital.address}
${hospital.city}, ${hospital.state}, ${hospital.country}
Phone: ${hospital.phone}
Email: ${hospital.email}

Date: ${new Date().toLocaleDateString()}

To Whom It May Concern,

RE: MEDICAL VISA SUPPORT FOR ${patientName.toUpperCase()}

This is to certify that ${patientName} has been scheduled for medical treatment at our facility.

TREATMENT DETAILS:
Treatment: ${treatmentName}
Purpose: ${formData.treatmentPurpose}
Duration: ${formData.treatmentDuration}
Recommended Stay: ${formData.stayDuration}

ATTENDING PHYSICIAN:
Name: ${formData.doctorName}
Designation: ${formData.doctorDesignation}

${formData.additionalNotes ? `ADDITIONAL NOTES:\n${formData.additionalNotes}\n\n` : ''}

We kindly request that ${patientName} be granted a medical visa to receive treatment at our facility. We assure full cooperation and will provide all necessary medical care during their stay.

For any queries, please contact us at the above-mentioned contact details.

Sincerely,

${hospital.name}
Medical Administration

---
This is an official document from ${hospital.name}. For verification, please contact: ${hospital.phone}
      `.trim();

      // Store as document
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          document_type: 'visa_support_letter',
          category: 'visa',
          file_name: `visa_invitation_${patientName.replace(/\s+/g, '_')}.txt`,
          file_type: 'text/plain',
          file_url: `data:text/plain;base64,${btoa(letterContent)}`,
          file_size: letterContent.length,
          description: `Visa invitation letter for ${patientName}`
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create notification for patient
      const { data: booking } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('id', bookingId)
        .single();

      if (booking) {
        await supabase.from('notifications').insert({
          user_id: booking.user_id,
          title: 'Visa Support Letter Available',
          message: `Your visa support letter has been prepared by ${hospital.name}. Please check your documents.`,
          type: 'document',
          related_id: docData.id
        });
      }

      toast.success('Visa support letter generated successfully');
      
      // Reset form
      setFormData({
        doctorName: '',
        doctorDesignation: '',
        treatmentPurpose: '',
        treatmentDuration: '',
        stayDuration: '',
        additionalNotes: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate letter');
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = formData.doctorName && formData.doctorDesignation && 
                      formData.treatmentPurpose && formData.treatmentDuration && 
                      formData.stayDuration;

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Generate Visa Support Letter
        </CardTitle>
        <CardDescription>
          Create an official invitation letter for patient visa application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-primary" />
            <span className="font-medium">Letter will include:</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>Hospital letterhead and contact information</li>
            <li>Patient name: {patientName}</li>
            <li>Treatment details: {treatmentName}</li>
            <li>Attending physician information</li>
            <li>Duration of treatment and recommended stay</li>
          </ul>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="doctorName">Doctor's Name *</Label>
              <Input
                id="doctorName"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <Label htmlFor="doctorDesignation">Designation *</Label>
              <Input
                id="doctorDesignation"
                value={formData.doctorDesignation}
                onChange={(e) => setFormData({ ...formData, doctorDesignation: e.target.value })}
                placeholder="Senior Consultant, Cardiology"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="treatmentPurpose">Purpose of Visit *</Label>
            <Textarea
              id="treatmentPurpose"
              value={formData.treatmentPurpose}
              onChange={(e) => setFormData({ ...formData, treatmentPurpose: e.target.value })}
              placeholder="Medical Treatment for..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="treatmentDuration">Treatment Duration *</Label>
              <Input
                id="treatmentDuration"
                value={formData.treatmentDuration}
                onChange={(e) => setFormData({ ...formData, treatmentDuration: e.target.value })}
                placeholder="2 weeks"
              />
            </div>
            <div>
              <Label htmlFor="stayDuration">Recommended Stay *</Label>
              <Input
                id="stayDuration"
                value={formData.stayDuration}
                onChange={(e) => setFormData({ ...formData, stayDuration: e.target.value })}
                placeholder="3 weeks including recovery"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>
        </div>

        <Button
          onClick={generateInvitationLetter}
          disabled={!isFormValid || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Generating Letter...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Generate & Submit Letter
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          * This letter will be automatically sent to the patient and admin for visa processing
        </p>
      </CardContent>
    </Card>
  );
}
