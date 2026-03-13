import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import PatientInfoForm from '@/components/ai/PatientInfoForm';
import ReportUpload from '@/components/ai/ReportUpload';
import AnalysisResults from '@/components/ai/AnalysisResults';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, FileText, Hospital, DollarSign } from 'lucide-react';

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  country: string;
  condition: string;
  previousTreatments: string;
  budget: string;
  preferredCity: string;
}

export interface MedicalAnalysis {
  summary: string;
  detectedConditions: Array<{
    condition: string;
    severity: string;
    confidence: string;
    description: string;
  }>;
  recommendedTreatments: Array<{
    treatment: string;
    description: string;
    estimatedCostUSD: string;
    durationDays: string;
    successRate: string;
  }>;
  recommendedHospitals: Array<{
    name: string;
    city: string;
    specialty: string;
    whyRecommended: string;
    estimatedCost: string;
    accreditation: string;
  }>;
  costBreakdown: {
    surgeryCost: string;
    hospitalStay: string;
    doctorFees: string;
    medicineCost: string;
    additionalCharges: string;
    totalEstimate: string;
  };
  urgencyLevel: string;
  disclaimer: string;
}

const AIAnalysis = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<'info' | 'upload' | 'analyzing' | 'results'>('info');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [reportText, setReportText] = useState('');
  const [analysis, setAnalysis] = useState<MedicalAnalysis | null>(null);

  const handlePatientInfoSubmit = (info: PatientInfo) => {
    setPatientInfo(info);
    setStep('upload');
  };

  const handleAnalyze = async (extractedText: string) => {
    setReportText(extractedText);
    setStep('analyzing');

    try {
      const { data, error } = await supabase.functions.invoke('analyze-report', {
        body: { reportText: extractedText, patientInfo },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      setStep('results');
    } catch (err: any) {
      console.error('Analysis error:', err);
      toast({
        title: 'Analysis Failed',
        description: err.message || 'Failed to analyze report. Please try again.',
        variant: 'destructive',
      });
      setStep('upload');
    }
  };

  const steps = [
    { icon: FileText, label: 'Patient Info', active: step === 'info' },
    { icon: Brain, label: 'Upload Reports', active: step === 'upload' },
    { icon: Hospital, label: 'AI Analysis', active: step === 'analyzing' },
    { icon: DollarSign, label: 'Results', active: step === 'results' },
  ];

  const currentStepIndex = steps.findIndex(s => s.active);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-8">
              <span className="section-badge inline-flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4" />
                AI-Powered Medical Analysis
              </span>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Get Your Medical Report Analyzed
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Upload your medical reports and let our AI analyze your condition, recommend treatments, and find the best hospitals in India for you.
              </p>
            </div>
          </ScrollReveal>

          {/* Step indicator */}
          <ScrollReveal delay={100}>
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    i <= currentStepIndex
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <s.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            {step === 'info' && <PatientInfoForm onSubmit={handlePatientInfoSubmit} />}
            {step === 'upload' && (
              <ReportUpload
                onAnalyze={handleAnalyze}
                onBack={() => setStep('info')}
                patientInfo={patientInfo!}
              />
            )}
            {step === 'analyzing' && (
              <div className="elegant-card p-12 text-center">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary animate-spin opacity-20" />
                  <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                    <Brain className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Your Reports...</h3>
                <p className="text-muted-foreground">Our AI is reviewing your medical information and finding the best treatment options in India.</p>
              </div>
            )}
            {step === 'results' && analysis && (
              <AnalysisResults
                analysis={analysis}
                onStartOver={() => {
                  setStep('info');
                  setAnalysis(null);
                  setPatientInfo(null);
                }}
              />
            )}
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIAnalysis;
