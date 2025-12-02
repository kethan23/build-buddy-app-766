import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, Phone, Mail, Globe, Building2, Star, 
  Calendar, Users, Award, Image as ImageIcon 
} from 'lucide-react';

const PublicHospitalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchHospitalData();
    }
  }, [id]);

  const fetchHospitalData = async () => {
    setLoading(true);
    
    // Fetch hospital details
    const { data: hospitalData, error: hospitalError } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .eq('verification_status', 'verified')
      .single();

    if (hospitalError || !hospitalData) {
      console.error('Hospital not found or not verified:', hospitalError);
      navigate('/hospitals');
      return;
    }

    setHospital(hospitalData);

    // Fetch related data in parallel
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hospital) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-80 bg-gradient-to-r from-primary to-accent">
          {hospital.cover_image_url ? (
            <img 
              src={hospital.cover_image_url} 
              alt={hospital.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-24 w-24 text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Hospital Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto flex items-end gap-6">
              {hospital.logo_url && (
                <img 
                  src={hospital.logo_url} 
                  alt={`${hospital.name} logo`}
                  className="h-24 w-24 rounded-lg bg-white p-2 shadow-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{hospital.name}</h1>
                  <Badge className="bg-green-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {hospital.city}, {hospital.country}
                  </span>
                  {hospital.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {hospital.rating.toFixed(1)} ({hospital.total_reviews} reviews)
                    </span>
                  )}
                  {hospital.established_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Est. {hospital.established_year}
                    </span>
                  )}
                </div>
              </div>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Request Consultation
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="doctors">Doctors ({doctors.length})</TabsTrigger>
                  <TabsTrigger value="packages">Packages ({packages.length})</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery ({gallery.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {hospital.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{hospital.description}</p>
                      
                      {hospital.bed_capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="font-medium">Bed Capacity:</span>
                          <span>{hospital.bed_capacity} beds</span>
                        </div>
                      )}

                      {specialties.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Specialties</h3>
                          <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty) => (
                              <Badge key={specialty.id} variant="secondary">
                                {specialty.specialty_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {certifications.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">Certifications & Accreditations</h3>
                          <div className="space-y-2">
                            {certifications.map((cert) => (
                              <div key={cert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div>
                                  <p className="font-medium">{cert.certification_name}</p>
                                  {cert.issuing_body && (
                                    <p className="text-sm text-muted-foreground">{cert.issuing_body}</p>
                                  )}
                                </div>
                                {cert.expiry_date && (
                                  <p className="text-sm text-muted-foreground">
                                    Valid until {new Date(cert.expiry_date).getFullYear()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="doctors" className="space-y-4">
                  {doctors.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No doctors listed yet
                      </CardContent>
                    </Card>
                  ) : (
                    doctors.map((doctor) => (
                      <Card key={doctor.id}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            {doctor.photo_url ? (
                              <img 
                                src={doctor.photo_url} 
                                alt={doctor.name}
                                className="h-20 w-20 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                                <Users className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{doctor.name}</h3>
                              <p className="text-primary">{doctor.specialty}</p>
                              {doctor.qualification && (
                                <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
                              )}
                              {doctor.experience_years && (
                                <p className="text-sm text-muted-foreground">
                                  {doctor.experience_years} years of experience
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
                </TabsContent>

                <TabsContent value="packages" className="space-y-4">
                  {packages.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No treatment packages available
                      </CardContent>
                    </Card>
                  ) : (
                    packages.map((pkg) => (
                      <Card key={pkg.id} className="premium-card">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{pkg.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{pkg.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {pkg.currency} {pkg.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground">{pkg.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {pkg.duration_days && (
                              <div>
                                <span className="text-muted-foreground">Duration:</span>{' '}
                                <span className="font-medium">{pkg.duration_days} days</span>
                              </div>
                            )}
                            {pkg.recovery_days && (
                              <div>
                                <span className="text-muted-foreground">Recovery:</span>{' '}
                                <span className="font-medium">{pkg.recovery_days} days</span>
                              </div>
                            )}
                          </div>

                          <Button className="w-full">Request Quote</Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="gallery">
                  {gallery.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No gallery images available</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {gallery.map((image) => (
                        <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden">
                          <img 
                            src={image.image_url} 
                            alt={image.caption || 'Hospital gallery'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hospital.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${hospital.email}`} className="text-primary hover:underline">
                        {hospital.email}
                      </a>
                    </div>
                  )}
                  {hospital.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${hospital.phone}`} className="text-primary hover:underline">
                        {hospital.phone}
                      </a>
                    </div>
                  )}
                  {hospital.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={hospital.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  {hospital.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <p className="text-sm">
                        {hospital.address}, {hospital.city}, {hospital.state} {hospital.postal_code}, {hospital.country}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="default">
                    Request Consultation
                  </Button>
                  <Button className="w-full" variant="outline">
                    Send Inquiry
                  </Button>
                  <Button className="w-full" variant="outline">
                    View All Packages
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicHospitalProfile;
