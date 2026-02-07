import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, Users, Package, Image as ImageIcon, Upload, X, File } from 'lucide-react';

import HospitalHeroSection from '@/components/hospital/profile/HospitalHeroSection';
import AboutTab from '@/components/hospital/profile/AboutTab';
import DoctorsTab from '@/components/hospital/profile/DoctorsTab';
import PackagesTab from '@/components/hospital/profile/PackagesTab';
import GalleryTab from '@/components/hospital/profile/GalleryTab';
import ContactSidebar from '@/components/hospital/profile/ContactSidebar';

interface UploadedDocument {
  file: File;
  reason: string;
}

const PublicHospitalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hospital, setHospital] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<'consultation' | 'inquiry'>('inquiry');
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [inquiryForm, setInquiryForm] = useState({
    treatmentType: '',
    message: '',
    preferredDate: ''
  });

  useEffect(() => {
    if (id) fetchHospitalData();
  }, [id]);

  const fetchHospitalData = async () => {
    setLoading(true);
    const { data: hospitalData, error: hospitalError } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .eq('verification_status', 'verified')
      .single();

    if (hospitalError || !hospitalData) {
      navigate('/hospitals');
      return;
    }

    setHospital(hospitalData);

    const [doctorsRes, packagesRes, certificationsRes, specialtiesRes, galleryRes] = await Promise.all([
      supabase.from('doctors').select('*').eq('hospital_id', id).eq('is_available', true),
      supabase.from('treatment_packages').select('*').eq('hospital_id', id).eq('is_active', true),
      supabase.from('hospital_certifications').select('*').eq('hospital_id', id),
      supabase.from('hospital_specialties').select('*').eq('hospital_id', id),
      supabase.from('hospital_gallery').select('*').eq('hospital_id', id).order('display_order')
    ]);

    setDoctors(doctorsRes.data || []);
    setPackages(packagesRes.data || []);
    setCertifications(certificationsRes.data || []);
    setSpecialties(specialtiesRes.data || []);
    setGallery(galleryRes.data || []);
    setLoading(false);
  };

  const handleOpenInquiry = (type: 'consultation' | 'inquiry') => {
    if (!user) {
      toast.error('Please login to send an inquiry');
      navigate('/auth');
      return;
    }
    setInquiryType(type);
    setUploadedDocs([]);
    setInquiryDialogOpen(true);
  };

  const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setUploadedDocs(prev => [...prev, { file, reason: '' }]);
    event.target.value = '';
  };

  const handleReasonChange = (index: number, reason: string) => {
    setUploadedDocs(prev => prev.map((doc, i) => i === index ? { ...doc, reason } : doc));
  };

  const handleRemoveDoc = (index: number) => {
    setUploadedDocs(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async (inquiryId: string) => {
    const uploadPromises = uploadedDocs.map(async (doc) => {
      const fileExt = doc.file.name.split('.').pop();
      const fileName = `${user?.id}/${inquiryId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(fileName, doc.file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('medical-documents').getPublicUrl(fileName);

      await supabase.from('documents').insert({
        user_id: user?.id,
        file_name: doc.file.name,
        file_type: doc.file.type,
        file_size: doc.file.size,
        file_url: urlData.publicUrl,
        document_type: 'inquiry_document',
        category: 'inquiry_document',
        description: doc.reason,
        verification_status: 'pending',
      });
    });

    await Promise.all(uploadPromises);
  };

  const handleSubmitInquiry = async () => {
    if (!user || !hospital) return;
    if (!inquiryForm.treatmentType.trim()) { toast.error('Please enter treatment type'); return; }
    if (!inquiryForm.message.trim()) { toast.error('Please enter your message'); return; }

    setSubmitting(true);
    try {
      const { data: inquiry, error } = await supabase.from('inquiries').insert({
        user_id: user.id,
        hospital_id: hospital.id,
        treatment_type: inquiryForm.treatmentType,
        message: inquiryType === 'consultation' ? `[Consultation Request] ${inquiryForm.message}` : inquiryForm.message,
        preferred_date: inquiryForm.preferredDate || null,
        status: 'pending'
      }).select().single();

      if (error) throw error;
      if (uploadedDocs.length > 0 && inquiry) await uploadDocuments(inquiry.id);

      toast.success(inquiryType === 'consultation' ? 'Consultation request sent!' : 'Inquiry sent!');
      setInquiryDialogOpen(false);
      setInquiryForm({ treatmentType: '', message: '', preferredDate: '' });
      setUploadedDocs([]);
      navigate('/patient/inquiries');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestQuote = (packageName: string) => {
    setInquiryForm(prev => ({ ...prev, treatmentType: packageName }));
    handleOpenInquiry('inquiry');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hospital) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HospitalHeroSection
          hospital={hospital}
          onRequestConsultation={() => handleOpenInquiry('consultation')}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-10">
          {/* Decorative background */}
          <div className="relative">
            <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-3 gap-8 relative">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start glass-card border-0 p-1">
                    <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Building2 className="h-4 w-4 mr-2" />
                      About
                    </TabsTrigger>
                    <TabsTrigger value="doctors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Doctors ({doctors.length})
                    </TabsTrigger>
                    <TabsTrigger value="packages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Package className="h-4 w-4 mr-2" />
                      Packages ({packages.length})
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Gallery ({gallery.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="about">
                    <AboutTab hospital={hospital} specialties={specialties} certifications={certifications} />
                  </TabsContent>
                  <TabsContent value="doctors">
                    <DoctorsTab doctors={doctors} />
                  </TabsContent>
                  <TabsContent value="packages">
                    <PackagesTab packages={packages} onRequestQuote={handleRequestQuote} />
                  </TabsContent>
                  <TabsContent value="gallery">
                    <GalleryTab gallery={gallery} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <ContactSidebar
                hospital={hospital}
                onRequestConsultation={() => handleOpenInquiry('consultation')}
                onSendInquiry={() => handleOpenInquiry('inquiry')}
                onViewPackages={() => setActiveTab('packages')}
              />
            </div>
          </div>
        </div>

        {/* Inquiry Dialog */}
        <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto elegant-card">
            <DialogHeader>
              <DialogTitle>
                {inquiryType === 'consultation' ? 'Request Consultation' : 'Send Inquiry'}
              </DialogTitle>
              <DialogDescription>
                {inquiryType === 'consultation'
                  ? `Request a consultation with ${hospital?.name}`
                  : `Send an inquiry to ${hospital?.name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="treatmentType">Treatment Type *</Label>
                <Input
                  id="treatmentType"
                  placeholder="e.g., Cardiac Surgery, Orthopedic, etc."
                  value={inquiryForm.treatmentType}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, treatmentType: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="preferredDate">Preferred Date (optional)</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={inquiryForm.preferredDate}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your medical condition and requirements..."
                  rows={4}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              {/* Document Upload Section */}
              <div className="space-y-3">
                <Label>Supporting Documents (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Upload medical reports, prescriptions, or other relevant documents
                </p>

                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    {uploadedDocs.map((doc, index) => (
                      <div key={index} className="border rounded-xl p-3 space-y-2 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm truncate">{doc.file.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              ({(doc.file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDoc(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Reason for uploading this document..."
                          value={doc.reason}
                          onChange={(e) => handleReasonChange(index, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-primary/20 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">
                      Click to upload (Max 10MB per file)
                    </span>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileAdd} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInquiryDialogOpen(false)}>Cancel</Button>
              <Button className="btn-gradient text-white" onClick={handleSubmitInquiry} disabled={submitting}>
                {submitting ? 'Sending...' : 'Send'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default PublicHospitalProfile;
