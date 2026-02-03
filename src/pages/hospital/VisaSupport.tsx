import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Users, CheckCircle, Clock, AlertCircle, Download, Send, Plane } from 'lucide-react';

interface Booking {
  id: string;
  treatment_name: string;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
    nationality: string;
    country: string;
  };
}

interface VisaApplication {
  id: string;
  user_id: string;
  country_of_origin: string;
  workflow_stage: string;
  application_status: string;
  hospital_letter_verified: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
}

const HospitalVisaSupport = () => {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visaApplications, setVisaApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [letterForm, setLetterForm] = useState({
    doctorName: '',
    doctorDesignation: '',
    treatmentPurpose: '',
    treatmentDuration: '',
    stayDuration: '',
    additionalNotes: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get hospital info
      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!hospitalData) {
        setLoading(false);
        return;
      }
      
      setHospital(hospitalData);
      
      // Get bookings with patient profiles
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('hospital_id', hospitalData.id)
        .order('created_at', { ascending: false });
      
      if (bookingsData) {
        const bookingsWithProfiles = await Promise.all(
          bookingsData.map(async (booking) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email, phone, nationality, country')
              .eq('user_id', booking.user_id)
              .single();
            return { ...booking, profiles: profile };
          })
        );
        setBookings(bookingsWithProfiles);
      }
      
      // Get visa applications for patients who have bookings with this hospital
      const patientIds = bookingsData?.map(b => b.user_id) || [];
      if (patientIds.length > 0) {
        const { data: visaData } = await supabase
          .from('visa_applications')
          .select('*')
          .in('user_id', patientIds)
          .order('created_at', { ascending: false });
        
        if (visaData) {
          const visaWithProfiles = await Promise.all(
            visaData.map(async (visa) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('user_id', visa.user_id)
                .single();
              return { ...visa, profiles: profile };
            })
          );
          setVisaApplications(visaWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateInvitationLetter = async () => {
    if (!user || !hospital || !selectedBooking) return;
    
    setGenerating(true);
    try {
      const patientName = selectedBooking.profiles?.full_name || 'Patient';
      const treatmentName = selectedBooking.treatment_name;

      // Generate letter content
      const letterContent = `
MEDICAL VISA INVITATION LETTER

${hospital.name}
${hospital.address || ''}
${hospital.city || ''}, ${hospital.state || ''}, ${hospital.country || ''}
Phone: ${hospital.phone || 'N/A'}
Email: ${hospital.email || 'N/A'}

Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

To Whom It May Concern,

RE: MEDICAL VISA INVITATION FOR ${patientName.toUpperCase()}

This is to certify that ${patientName} has been scheduled for medical treatment at our facility.

TREATMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Treatment/Procedure: ${treatmentName}
Purpose of Visit: ${letterForm.treatmentPurpose}
Treatment Duration: ${letterForm.treatmentDuration}
Recommended Stay: ${letterForm.stayDuration}

ATTENDING PHYSICIAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Doctor's Name: ${letterForm.doctorName}
Designation: ${letterForm.doctorDesignation}

${letterForm.additionalNotes ? `ADDITIONAL NOTES:\n${letterForm.additionalNotes}\n` : ''}

We kindly request that ${patientName} be granted a medical visa to receive treatment at our facility. We assure full cooperation and will provide all necessary medical care during their stay.

The patient will be accompanied by their designated caretaker(s) as required.

For any queries or verification, please contact us at the above-mentioned contact details.

This letter is issued for the purpose of Medical Visa application to the Embassy of India.

Sincerely,

_____________________________
${hospital.name}
Medical Administration Department

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an official document from ${hospital.name}
For verification: ${hospital.phone || hospital.email || 'Contact hospital directly'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      // Store as document
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: selectedBooking.user_id,
          document_type: 'visa_invitation_letter',
          category: 'visa',
          file_name: `visa_invitation_${patientName.replace(/\s+/g, '_')}_${Date.now()}.txt`,
          file_type: 'text/plain',
          file_url: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(letterContent)))}`,
          file_size: letterContent.length,
          description: `Visa invitation letter for ${patientName} from ${hospital.name}`
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create notification for patient
      await supabase.from('notifications').insert({
        user_id: selectedBooking.user_id,
        title: 'Visa Invitation Letter Ready',
        message: `Your visa invitation letter has been generated by ${hospital.name}. Please check your documents.`,
        type: 'document',
        related_id: docData.id
      });

      toast.success('Invitation letter generated and sent to patient!');
      setDialogOpen(false);
      setLetterForm({
        doctorName: '',
        doctorDesignation: '',
        treatmentPurpose: '',
        treatmentDuration: '',
        stayDuration: '',
        additionalNotes: ''
      });
      setSelectedBooking(null);
    } catch (error: any) {
      console.error('Error generating letter:', error);
      toast.error(error.message || 'Failed to generate letter');
    } finally {
      setGenerating(false);
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      documents_uploaded: 'bg-blue-100 text-blue-800',
      admin_verification: 'bg-yellow-100 text-yellow-800',
      hospital_letter_verified: 'bg-green-100 text-green-800',
      visa_support_approved: 'bg-green-100 text-green-800',
      sent_to_embassy: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const isFormValid = letterForm.doctorName && letterForm.doctorDesignation && 
                      letterForm.treatmentPurpose && letterForm.treatmentDuration && 
                      letterForm.stayDuration;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Clock className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Visa Support Center</h1>
            <p className="text-muted-foreground mt-2">
              Generate and manage visa invitation letters for your patients
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-xs text-muted-foreground">Active bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visa Applications</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visaApplications.length}</div>
                <p className="text-xs text-muted-foreground">From your patients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Letters</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {visaApplications.filter(v => !v.hospital_letter_verified).length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting your action</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList>
              <TabsTrigger value="generate">Generate Letters</TabsTrigger>
              <TabsTrigger value="applications">Visa Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Bookings</CardTitle>
                  <CardDescription>
                    Select a patient to generate their visa invitation letter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No patient bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {booking.profiles?.full_name || 'Unknown Patient'}
                              </p>
                              <Badge variant="outline">{booking.treatment_name}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.profiles?.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              From: {booking.profiles?.country || booking.profiles?.nationality || 'Unknown'}
                            </p>
                          </div>
                          <Dialog open={dialogOpen && selectedBooking?.id === booking.id} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) setSelectedBooking(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Letter
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Generate Visa Invitation Letter</DialogTitle>
                                <DialogDescription>
                                  Create an official invitation letter for {booking.profiles?.full_name}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Letter will include:</span>
                                  </div>
                                  <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                                    <li>Hospital letterhead and contact information</li>
                                    <li>Patient: {booking.profiles?.full_name}</li>
                                    <li>Treatment: {booking.treatment_name}</li>
                                    <li>Doctor details and duration</li>
                                  </ul>
                                </div>

                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="doctorName">Doctor's Name *</Label>
                                      <Input
                                        id="doctorName"
                                        value={letterForm.doctorName}
                                        onChange={(e) => setLetterForm({ ...letterForm, doctorName: e.target.value })}
                                        placeholder="Dr. John Smith"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="doctorDesignation">Designation *</Label>
                                      <Input
                                        id="doctorDesignation"
                                        value={letterForm.doctorDesignation}
                                        onChange={(e) => setLetterForm({ ...letterForm, doctorDesignation: e.target.value })}
                                        placeholder="Senior Consultant, Cardiology"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="treatmentPurpose">Purpose of Visit *</Label>
                                    <Textarea
                                      id="treatmentPurpose"
                                      value={letterForm.treatmentPurpose}
                                      onChange={(e) => setLetterForm({ ...letterForm, treatmentPurpose: e.target.value })}
                                      placeholder="Medical treatment for..."
                                      rows={2}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="treatmentDuration">Treatment Duration *</Label>
                                      <Input
                                        id="treatmentDuration"
                                        value={letterForm.treatmentDuration}
                                        onChange={(e) => setLetterForm({ ...letterForm, treatmentDuration: e.target.value })}
                                        placeholder="2 weeks"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="stayDuration">Recommended Stay *</Label>
                                      <Input
                                        id="stayDuration"
                                        value={letterForm.stayDuration}
                                        onChange={(e) => setLetterForm({ ...letterForm, stayDuration: e.target.value })}
                                        placeholder="3 weeks including recovery"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                                    <Textarea
                                      id="additionalNotes"
                                      value={letterForm.additionalNotes}
                                      onChange={(e) => setLetterForm({ ...letterForm, additionalNotes: e.target.value })}
                                      placeholder="Any additional information..."
                                      rows={3}
                                    />
                                  </div>
                                </div>

                                <Button
                                  onClick={generateInvitationLetter}
                                  disabled={!isFormValid || generating}
                                  className="w-full"
                                >
                                  {generating ? (
                                    <>
                                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-2" />
                                      Generate & Send to Patient
                                    </>
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Visa Applications</CardTitle>
                  <CardDescription>
                    Track visa applications from your patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {visaApplications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No visa applications from your patients yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visaApplications.map((visa) => (
                        <div 
                          key={visa.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {visa.profiles?.full_name || 'Unknown Patient'}
                              </p>
                              <Badge className={getStageColor(visa.workflow_stage)}>
                                {visa.workflow_stage.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              From: {visa.country_of_origin}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Applied: {new Date(visa.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {visa.hospital_letter_verified ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Letter Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">Letter Pending</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalVisaSupport;
