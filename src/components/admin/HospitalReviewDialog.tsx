import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Building2, Mail, Phone, Globe, MapPin, Calendar, 
  FileText, CheckCircle, XCircle, User, Award, Users,
  ExternalLink, AlertCircle, Image
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AdminHospitalImageUpload } from './AdminHospitalImageUpload';

interface HospitalReviewDialogProps {
  hospital: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  category: string;
  verification_status: string;
  created_at: string;
}

export function HospitalReviewDialog({ hospital, open, onOpenChange, onSuccess }: HospitalReviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [hospitalData, setHospitalData] = useState<any>(hospital);

  useEffect(() => {
    if (hospital && open) {
      loadHospitalDetails();
    }
  }, [hospital, open]);

  const loadHospitalDetails = async () => {
    if (!hospital) return;

    // Refresh hospital data
    const { data: freshHospital } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', hospital.id)
      .single();
    
    if (freshHospital) {
      setHospitalData(freshHospital);
    }

    // Load documents uploaded by the hospital owner
    const { data: docsData } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', hospital.user_id)
      .order('created_at', { ascending: false });

    setDocuments(docsData || []);

    // Load certifications
    const { data: certsData } = await supabase
      .from('hospital_certifications')
      .select('*')
      .eq('hospital_id', hospital.id);

    setCertifications(certsData || []);

    // Load doctors
    const { data: doctorsData } = await supabase
      .from('doctors')
      .select('*')
      .eq('hospital_id', hospital.id);

    setDoctors(doctorsData || []);

    // Load specialties
    const { data: specialtiesData } = await supabase
      .from('hospital_specialties')
      .select('*')
      .eq('hospital_id', hospital.id);

    setSpecialties(specialtiesData || []);

    // Load treatment packages
    const { data: packagesData } = await supabase
      .from('treatment_packages')
      .select('*')
      .eq('hospital_id', hospital.id);

    setPackages(packagesData || []);

    // Load gallery images
    const { data: galleryData } = await supabase
      .from('hospital_gallery')
      .select('*')
      .eq('hospital_id', hospital.id)
      .order('display_order', { ascending: true });

    setGalleryImages(galleryData || []);
  };

  const handleApproval = async (status: 'verified' | 'rejected') => {
    if (status === 'rejected' && !feedback.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }

    setLoading(true);
    try {
      // Update hospital status
      const { error: hospitalError } = await supabase
        .from('hospitals')
        .update({ 
          verification_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', hospital.id);

      if (hospitalError) throw hospitalError;

      // Log admin action
      const { error: logError } = await supabase
        .from('admin_logs')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action: status === 'verified' ? 'hospital_approved' : 'hospital_rejected',
          entity_type: 'hospital',
          entity_id: hospital.id,
          details: { feedback }
        });

      if (logError) console.error('Failed to log action:', logError);

      // Send notification to hospital owner
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: hospital.user_id,
          title: status === 'verified' ? 'Hospital Approved' : 'Hospital Registration Rejected',
          message: status === 'verified' 
            ? `Your hospital "${hospital.name}" has been approved and is now visible to patients.`
            : `Your hospital registration has been rejected. Reason: ${feedback}`,
          type: 'hospital_verification',
          related_id: hospital.id
        });

      if (notifError) console.error('Failed to send notification:', notifError);

      toast.success(`Hospital ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
      onOpenChange(false);
      setFeedback('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hospital status');
    } finally {
      setLoading(false);
    }
  };

  if (!hospital) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Hospital Review: {hospital.name}
          </DialogTitle>
          <DialogDescription>
            Review hospital information and documents before approval
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="images">
                <Image className="h-3 w-3 mr-1" />
                Images
              </TabsTrigger>
              <TabsTrigger value="documents">
                Docs
                {documents.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{documents.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="certifications">
                Certs
                {certifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{certifications.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="staff">
                Staff
                {doctors.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{doctors.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Hospital Name</p>
                        <p className="text-sm text-muted-foreground">{hospital.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {hospital.city}, {hospital.state}, {hospital.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{hospital.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{hospital.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    {hospital.website && (
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm font-medium">Website</p>
                          <a 
                            href={hospital.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {hospital.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Established</p>
                        <p className="text-sm text-muted-foreground">{hospital.established_year || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Bed Capacity</p>
                        <p className="text-sm text-muted-foreground">{hospital.bed_capacity || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {hospital.description || 'No description provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Full Address</p>
                    <p className="text-sm text-muted-foreground">
                      {hospital.address || 'Not provided'}
                      {hospital.postal_code && `, ${hospital.postal_code}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 mt-4">
              <AdminHospitalImageUpload 
                hospitalId={hospital.id}
                currentLogoUrl={hospitalData?.logo_url}
                currentCoverUrl={hospitalData?.cover_image_url}
                onUpdate={loadHospitalDetails}
              />
              
              {galleryImages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Current Gallery Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {galleryImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img 
                            src={img.image_url} 
                            alt={img.caption || 'Gallery image'}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          {img.caption && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{img.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              {documents.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-primary mt-1" />
                          <div className="flex-1">
                            <p className="font-medium">{doc.file_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {doc.category.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge
                                variant={
                                  doc.verification_status === 'verified'
                                    ? 'default'
                                    : doc.verification_status === 'rejected'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {doc.verification_status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4 mt-4">
              {certifications.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No certifications added</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                certifications.map((cert) => (
                  <Card key={cert.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{cert.certification_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Issued by: {cert.issuing_body || 'Not specified'}
                          </p>
                          {cert.issue_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Issue Date: {new Date(cert.issue_date).toLocaleDateString()}
                            </p>
                          )}
                          {cert.expiry_date && (
                            <p className="text-xs text-muted-foreground">
                              Expiry Date: {new Date(cert.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                          {cert.document_url && (
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 h-auto mt-2"
                              onClick={() => window.open(cert.document_url, '_blank')}
                            >
                              View Certificate <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="staff" className="space-y-4 mt-4">
              {doctors.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No doctors added</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                doctors.map((doctor) => (
                  <Card key={doctor.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          {doctor.qualification && (
                            <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
                          )}
                          {doctor.experience_years && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Experience: {doctor.experience_years} years
                            </p>
                          )}
                          {doctor.bio && (
                            <p className="text-sm mt-2">{doctor.bio}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {specialties.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <Badge key={specialty.id} variant="secondary">
                          {specialty.specialty_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-4 mt-4">
              {packages.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No treatment packages added</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                packages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pkg.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">
                          {pkg.currency} {pkg.price.toLocaleString()}
                        </span>
                        {pkg.duration_days && (
                          <span className="text-muted-foreground">
                            Duration: {pkg.duration_days} days
                          </span>
                        )}
                        {pkg.recovery_days && (
                          <span className="text-muted-foreground">
                            Recovery: {pkg.recovery_days} days
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <Separator />

        <div className="space-y-4">
          <div>
            <Label htmlFor="feedback">Admin Feedback {hospital.verification_status === 'pending' && '(Required for rejection)'}</Label>
            <Textarea
              id="feedback"
              placeholder="Provide feedback or reason for rejection..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            {hospital.verification_status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleApproval('rejected')}
                  disabled={loading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproval('verified')}
                  disabled={loading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
