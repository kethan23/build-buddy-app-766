import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, Plane, FileText, Clock, DollarSign, 
  CheckCircle, AlertCircle, Globe, Shield, ArrowRight 
} from 'lucide-react';

interface CountryRequirement {
  id: string;
  country_code: string;
  country_name: string;
  visa_type: string;
  required_documents: string[];
  processing_time_days: number;
  validity_days: number;
  extension_available: boolean;
  fees_usd: number;
  special_notes: string | null;
}

const DOCUMENT_LABELS: Record<string, string> = {
  passport: 'Valid Passport',
  passport_photo: 'Passport-size Photographs',
  medical_reports: 'Medical Reports & Diagnosis',
  hospital_invitation: 'Hospital Invitation Letter',
  financial_proof: 'Proof of Financial Means',
  travel_insurance: 'Travel Insurance',
  bank_statement: 'Bank Statements',
  police_clearance: 'Police Clearance Certificate',
};

const FAQS = [
  {
    question: 'What is a Medical Visa?',
    answer: 'A Medical Visa (M Visa) is issued to foreign nationals who wish to visit India for medical treatment. It allows you to stay in India for the duration of your treatment and is generally valid for up to 6 months.'
  },
  {
    question: 'Can I bring family members with me?',
    answer: 'Yes, you can apply for a Medical Attendant Visa (MX Visa) for up to 2 attendants/companions. They must apply separately but can reference your medical visa application.'
  },
  {
    question: 'How long does the visa process take?',
    answer: 'Processing times vary by country, typically ranging from 7-20 business days. e-Medical Visas for eligible countries can be processed in 3-5 business days.'
  },
  {
    question: 'Can I extend my medical visa?',
    answer: 'Yes, medical visas can be extended in India for up to 6 months at a time, subject to showing continued medical treatment requirements. Extensions must be applied for before the current visa expires.'
  },
  {
    question: 'What documents do I need from the hospital?',
    answer: 'The hospital provides an invitation/confirmation letter that includes your treatment details, expected duration, estimated costs, and the treating physician\'s information. MediConnect helps coordinate this automatically.'
  },
  {
    question: 'Is travel insurance mandatory?',
    answer: 'While not always mandatory, travel insurance is highly recommended. It should cover medical emergencies, trip cancellation, and repatriation. Many hospitals require proof of insurance before confirming treatment.'
  },
  {
    question: 'What if my visa application is rejected?',
    answer: 'Visa rejections can occur for various reasons including incomplete documentation, insufficient funds proof, or security concerns. MediConnect provides guidance on strengthening your application and can help with reapplication if needed.'
  },
  {
    question: 'Does MediConnect guarantee visa approval?',
    answer: 'No, visa approval is solely at the discretion of the Indian Embassy/Consulate. MediConnect assists with documentation and application preparation but cannot guarantee visa issuance.'
  },
];

export default function VisaInfoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryRequirement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryRequirement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    setLoading(true);
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
        visa_type: c.visa_type,
        processing_time_days: c.processing_time_days ?? 15,
        validity_days: c.validity_days ?? 90,
        extension_available: c.extension_available ?? true,
        fees_usd: Number(c.fees_usd) || 0,
        special_notes: c.special_notes,
        required_documents: Array.isArray(c.required_documents) ? c.required_documents : []
      })));
    }
    setLoading(false);
  };

  const filteredCountries = countries.filter(c =>
    c.country_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartApplication = () => {
    if (user) {
      navigate('/patient/visa-application');
    } else {
      navigate('/auth?redirect=/patient/visa-application');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Visa Assistance</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Medical Visa Made Simple
              </h1>
              <p className="text-lg opacity-90 mb-8">
                We handle the complexity of medical visa applications so you can focus on your health. 
                Get expert guidance, document verification, and end-to-end support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={handleStartApplication}>
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: 'Verified Hospitals', desc: 'All partner hospitals are accredited' },
                { icon: FileText, title: 'Document Support', desc: 'Help with all required documents' },
                { icon: Clock, title: 'Fast Processing', desc: 'Expedited application handling' },
                { icon: Globe, title: 'Multi-Language', desc: 'Support in your language' },
              ].map((feature, idx) => (
                <Card key={idx} className="text-center premium-card">
                  <CardContent className="pt-6">
                    <feature.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Country Requirements */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Visa Requirements by Country</h2>
              <p className="text-muted-foreground">
                Find specific visa requirements and processing information for your country
              </p>
            </div>

            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search your country..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {filteredCountries.map(country => (
                <Card 
                  key={country.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedCountry?.id === country.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCountry(
                    selectedCountry?.id === country.id ? null : country
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{country.country_name}</h3>
                      <Badge variant="outline">{country.country_code}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {country.processing_time_days} days
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${country.fees_usd}
                      </span>
                    </div>

                    {selectedCountry?.id === country.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Required Documents:</p>
                          <div className="flex flex-wrap gap-1">
                            {country.required_documents.map(doc => (
                              <Badge key={doc} variant="secondary" className="text-xs">
                                {DOCUMENT_LABELS[doc] || doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm">
                          <p><span className="text-muted-foreground">Validity:</span> {country.validity_days} days</p>
                          <p><span className="text-muted-foreground">Extension:</span> {country.extension_available ? 'Available' : 'Not available'}</p>
                        </div>
                        {country.special_notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {country.special_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCountries.length === 0 && !loading && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No countries found matching your search</p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">How Visa Assistance Works</h2>
              <p className="text-muted-foreground">Simple 5-step process to get your medical visa</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-5 gap-4">
                {[
                  { step: 1, title: 'Apply Online', desc: 'Fill out the visa application form' },
                  { step: 2, title: 'Upload Documents', desc: 'Submit required documents' },
                  { step: 3, title: 'Get Invitation', desc: 'Hospital provides invitation letter' },
                  { step: 4, title: 'We Review', desc: 'Our team verifies everything' },
                  { step: 5, title: 'Track Status', desc: 'Monitor your application' },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    {idx < 4 && (
                      <div className="hidden md:block absolute right-0 top-6 transform translate-x-1/2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about medical visas</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-2">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Disclaimer & CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-warning/50 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Important Disclaimer</h3>
                      <p className="text-sm text-muted-foreground">
                        MediConnect provides visa application assistance and guidance only. 
                        Visa approval is solely at the discretion of the Indian Embassy/Consulate 
                        and the Government of India. We do not guarantee visa issuance. 
                        Processing times and requirements are subject to change without notice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center mt-8">
                <Button size="lg" onClick={handleStartApplication} className="btn-gradient">
                  <Plane className="mr-2 h-5 w-5" />
                  Start Your Visa Application
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Already started? <a href="/patient/dashboard" className="text-primary hover:underline">Check your application status</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
