import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  HelpCircle,
  Search,
  Stethoscope,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentUpload } from '@/components/patient/DocumentUpload';
import {
  PatientJourneyOverview,
  type JourneyStageKey,
} from '@/components/patient/dashboard/PatientJourneyOverview';

type DashboardData = {
  profile: any | null;
  inquiries: any[];
  bookings: any[];
  appointments: any[];
  documents: any[];
  journeys: any[];
  visas: any[];
};

const emptyData: DashboardData = {
  profile: null,
  inquiries: [],
  bookings: [],
  appointments: [],
  documents: [],
  journeys: [],
  visas: [],
};

const stageOrder: JourneyStageKey[] = ['need', 'consultation', 'plan', 'travel', 'treatment'];

const requestStatusClass: Record<string, string> = {
  pending: 'border-warning/30 bg-warning/10 text-foreground',
  responded: 'border-info/30 bg-info/10 text-foreground',
  accepted: 'border-success/30 bg-success/10 text-foreground',
  confirmed: 'border-success/30 bg-success/10 text-foreground',
  completed: 'border-success/30 bg-success/10 text-foreground',
  rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
  cancelled: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const formatStatus = (value?: string | null) =>
  value ? value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Pending';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getDocumentGroup = (document: any) => {
  const category = document.category || document.document_type || 'general';
  if (['medical_report', 'inquiry_document'].includes(category)) return 'Medical Reports';
  if (category === 'prescription') return 'Prescriptions';
  if (['lab_result', 'scan'].includes(category)) return 'Scans & Lab Results';
  if (['treatment_document', 'discharge_summary'].includes(category)) return 'Treatment Documents';
  return 'Other Documents';
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('inquiries')
          .select('*, hospitals(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('bookings')
          .select('*, hospitals(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('appointments')
          .select('*, hospitals(name), doctors(name, specialty), video_consultations(room_id, status)')
          .eq('patient_id', user.id)
          .gte('appointment_date', new Date().toISOString())
          .order('appointment_date', { ascending: true })
          .limit(3),
        supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase
          .from('patient_journey_tracking')
          .select('*')
          .eq('patient_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1),
        supabase
          .from('visa_applications')
          .select('id, application_status, workflow_stage, hospital_name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2),
      ]);

      if (!active) return;
      const value = (index: number, fallback: any) => {
        const result = results[index];
        if (result.status !== 'fulfilled' || result.value.error) return fallback;
        return result.value.data ?? fallback;
      };

      setData({
        profile: value(0, null),
        inquiries: value(1, []),
        bookings: value(2, []),
        appointments: value(3, []),
        documents: value(4, []),
        journeys: value(5, []),
        visas: value(6, []),
      });
      setLoading(false);
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [user]);

  const hasActivity = data.inquiries.length > 0 || data.bookings.length > 0 || data.documents.length > 0 || data.visas.length > 0;
  const journey = data.journeys[0];
  const upcomingAppointment = data.appointments[0] || data.bookings
    .filter((booking) => booking.appointment_date && new Date(booking.appointment_date) >= new Date())
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

  const currentStage = useMemo<JourneyStageKey>(() => {
    const trackedStage = journey?.current_stage;
    if (trackedStage === 'visa' || trackedStage === 'travel') return 'travel';
    if (trackedStage === 'hospital') return 'plan';
    if (trackedStage === 'treatment' || trackedStage === 'recovery') return 'treatment';
    if (trackedStage === 'inquiry') return 'consultation';
    if (data.bookings.some((booking) => booking.status === 'completed' || booking.status === 'in_progress')) return 'treatment';
    if (data.visas.some((visa) => !['completed', 'approved'].includes(visa.application_status))) return 'travel';
    if (data.bookings.some((booking) => ['confirmed', 'pending'].includes(booking.status))) return 'plan';
    if (data.inquiries.length > 0 || upcomingAppointment) return 'consultation';
    return 'need';
  }, [data.bookings, data.inquiries.length, data.visas, journey, upcomingAppointment]);

  const completedStages = stageOrder.slice(0, stageOrder.indexOf(currentStage));

  const nextStep = useMemo(() => {
    if (!hasActivity) {
      return {
        title: 'Tell us what medical help you need',
        description: "We'll guide you to suitable hospitals and the next steps for your care.",
        label: 'Start Medical Assistance',
        action: () => navigate('/patient/ai-analysis'),
      };
    }
    if (data.documents.length === 0) {
      return {
        title: 'Upload your medical reports',
        description: 'Your reports help specialists understand your case and prepare a more useful response.',
        label: 'Upload Reports',
        action: () => setDocumentsOpen(true),
      };
    }
    if (upcomingAppointment) {
      return {
        title: 'Your consultation is the next step',
        description: 'Review the appointment details and prepare any questions or reports before your consultation.',
        label: 'View Consultation',
        action: () => navigate('/patient/bookings'),
      };
    }
    if (data.inquiries.some((inquiry) => ['pending', 'responded'].includes(inquiry.status))) {
      return {
        title: 'Your hospital request is being reviewed',
        description: 'Check the latest response and continue the conversation with the hospital team.',
        label: 'View Requests',
        action: () => navigate('/patient/inquiries'),
      };
    }
    if (currentStage === 'travel') {
      return {
        title: 'Continue your travel preparation',
        description: 'Review your visa and travel progress before your treatment journey.',
        label: 'View Travel Progress',
        action: () => navigate('/patient/visa-application'),
      };
    }
    if (currentStage === 'treatment') {
      return {
        title: "You're all set",
        description: 'Your treatment journey is active. Keep your booking details and care plan close at hand.',
        label: 'View Treatment Details',
        action: () => navigate('/patient/bookings'),
      };
    }
    return {
      title: 'Choose your preferred hospital',
      description: 'Compare verified hospitals and request a consultation for your treatment needs.',
      label: 'View Hospitals',
      action: () => navigate('/hospitals'),
    };
  }, [currentStage, data.documents.length, data.inquiries, hasActivity, navigate, upcomingAppointment]);

  const requests = useMemo(() => [
    ...data.inquiries.map((inquiry) => ({
      id: inquiry.id,
      type: inquiry.treatment_type?.toLowerCase().includes('consult') ? 'Doctor Consultation' : 'Hospital Inquiry',
      name: inquiry.hospitals?.name || inquiry.treatment_type,
      status: inquiry.status,
      action: () => navigate('/patient/inquiries'),
    })),
    ...data.bookings.map((booking) => ({
      id: booking.id,
      type: 'Treatment Request',
      name: booking.hospitals?.name || booking.treatment_name,
      status: booking.status,
      action: () => navigate('/patient/bookings'),
    })),
    ...data.visas.map((visa) => ({
      id: visa.id,
      type: 'Visa & Travel Assistance',
      name: visa.hospital_name || 'Medical travel support',
      status: visa.workflow_stage || visa.application_status,
      action: () => navigate('/patient/visa-application'),
    })),
  ].slice(0, 5), [data.bookings, data.inquiries, data.visas, navigate]);

  const documentGroups = useMemo(() => {
    const counts = new Map<string, number>();
    data.documents.forEach((document) => {
      const group = getDocumentGroup(document);
      counts.set(group, (counts.get(group) || 0) + 1);
    });
    return Array.from(counts.entries());
  }, [data.documents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-6xl px-4 py-10" aria-busy="true">
          <div className="h-9 w-72 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-muted" />
          <div className="mt-10 h-56 animate-pulse rounded-lg border bg-card" />
        </main>
      </div>
    );
  }

  const appointmentDate = upcomingAppointment?.appointment_date ? new Date(upcomingAppointment.appointment_date) : null;
  const firstName = data.profile?.full_name?.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <header className="mb-9">
            <p className="mb-2 text-sm font-medium text-primary">My Medical Journey</p>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{getGreeting()}, {firstName} 👋</h1>
            <p className="mt-2 text-base text-muted-foreground">Let's keep your medical journey moving.</p>
          </header>

          <div className="space-y-8">
            <section aria-labelledby="journey-title" className="rounded-lg border bg-card p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 id="journey-title" className="text-xl font-semibold">Your Medical Journey</h2>
                  <p className="mt-1 text-sm text-muted-foreground">A clear view of where you are now.</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-primary/30 bg-primary/5 text-primary">In progress</Badge>
              </div>
              <PatientJourneyOverview currentStage={currentStage} completedStages={completedStages} />
            </section>

            <section aria-labelledby="next-step-title" className="rounded-lg border border-primary/25 bg-primary/5 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7">
              <div className="max-w-2xl">
                <p className="mb-1 text-xs font-semibold uppercase text-primary">Your next step</p>
                <h2 id="next-step-title" className="text-xl font-semibold">{nextStep.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextStep.description}</p>
              </div>
              <Button onClick={nextStep.action} className="mt-5 w-full shrink-0 sm:mt-0 sm:w-auto">
                {nextStep.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section aria-labelledby="appointment-title">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h2 id="appointment-title" className="text-xl font-semibold">Upcoming Appointment</h2>
              </div>
              {upcomingAppointment && appointmentDate ? (
                <div className="rounded-lg border bg-card p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <p className="font-semibold">{upcomingAppointment.doctors?.name || upcomingAppointment.treatment_name || 'Medical consultation'}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {upcomingAppointment.doctors?.specialty || upcomingAppointment.hospitals?.name || 'Hospital consultation'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
                      <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{appointmentDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />{appointmentDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />{upcomingAppointment.video_consultations?.length ? 'Online consultation' : 'Hospital appointment'}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/patient/bookings')} className="mt-5 w-full sm:mt-0 sm:w-auto">View Details</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-lg border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/hospitals')}>Find a Doctor</Button>
                </div>
              )}
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
              <section aria-labelledby="requests-title">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 id="requests-title" className="text-xl font-semibold">My Requests</h2>
                  </div>
                  {requests.length > 0 && <Button variant="link" size="sm" onClick={() => navigate('/patient/inquiries')}>View all</Button>}
                </div>
                <div className="overflow-hidden rounded-lg border bg-card">
                  {requests.length > 0 ? requests.map((request, index) => (
                    <div key={`${request.type}-${request.id}`} className={`flex items-center justify-between gap-4 p-4 ${index ? 'border-t' : ''}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{request.type}</p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{request.name}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className={requestStatusClass[request.status] || 'bg-muted/50'}>{formatStatus(request.status)}</Badge>
                        <Button variant="ghost" size="icon" aria-label={`View ${request.type}`} onClick={request.action}><ArrowRight className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground">You haven't submitted any requests yet.</p>
                      <Button variant="link" className="mt-2 h-auto p-0" onClick={() => navigate('/hospitals')}>Find a hospital</Button>
                    </div>
                  )}
                </div>
              </section>

              <section aria-labelledby="documents-title">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <h2 id="documents-title" className="text-xl font-semibold">My Documents</h2>
                  </div>
                  {data.documents.length > 0 && <Button variant="link" size="sm" onClick={() => setDocumentsOpen(true)}>View documents</Button>}
                </div>
                <div className="overflow-hidden rounded-lg border bg-card">
                  {documentGroups.length > 0 ? documentGroups.map(([group, count], index) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setDocumentsOpen(true)}
                      className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/40 ${index ? 'border-t' : ''}`}
                    >
                      <span className="text-sm font-medium">{group}</span>
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'file' : 'files'}</span>
                    </button>
                  )) : (
                    <div className="p-5">
                      <p className="text-sm text-muted-foreground">You haven't uploaded any medical documents yet.</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setDocumentsOpen(true)}><Upload className="h-4 w-4" />Upload Reports</Button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section aria-labelledby="quick-actions-title">
              <h2 id="quick-actions-title" className="mb-3 text-base font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Find a Hospital', icon: Building2, action: () => navigate('/hospitals') },
                  { label: 'Find a Doctor', icon: Search, action: () => navigate('/hospitals') },
                  { label: 'Upload Reports', icon: Upload, action: () => setDocumentsOpen(true) },
                  { label: 'Get Help', icon: HelpCircle, action: () => navigate('/patient/inbox') },
                ].map((item) => (
                  <Button key={item.label} variant="outline" className="h-14 justify-start px-4" onClick={item.action}>
                    <item.icon className="h-5 w-5 text-primary" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </section>

            <section aria-labelledby="support-title" className="flex flex-col gap-4 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div>
                <div>
                  <h2 id="support-title" className="font-semibold">Need help?</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Our patient support team can help with hospitals, appointments, documents, and travel assistance.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/patient/inbox')}>Talk to Support</Button>
            </section>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={documentsOpen} onOpenChange={setDocumentsOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Documents</DialogTitle>
            <DialogDescription>Upload and manage the reports shared for your care journey.</DialogDescription>
          </DialogHeader>
          <DocumentUpload />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;