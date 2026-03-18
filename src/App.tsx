import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/patient/ProtectedRoute";
import ProtectedHospitalRoute from "@/components/hospital/ProtectedHospitalRoute";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import ProtectedAgentRoute from "@/components/agent/ProtectedAgentRoute";
import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import PublicHospitalProfile from "./pages/PublicHospitalProfile";
import Compare from "./pages/Compare";
import Treatments from "./pages/Treatments";
import Support from "./pages/Support";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import VisaInfo from "./pages/VisaInfo";
import VisaApplication from "./pages/patient/VisaApplication";
import AdminVisaRequirements from "./pages/admin/VisaRequirements";
import AdminCommunications from "./pages/admin/Communications";
 import PatientInbox from "./pages/patient/Inbox";
import SeedHospitalData from "./pages/admin/SeedHospitalData";
import Dashboard from "./pages/patient/Dashboard";
import Profile from "./pages/patient/Profile";
import Search from "./pages/patient/Search";
import Inquiries from "./pages/patient/Inquiries";
import Bookings from "./pages/patient/Bookings";
import Payments from "./pages/patient/Payments";
import Chat from "./pages/patient/Chat";
import AIAnalysis from "./pages/patient/AIAnalysis";
import PatientSupport from "./pages/patient/Support";
import HospitalDashboard from "./pages/hospital/Dashboard";
import HospitalProfile from "./pages/hospital/Profile";
import HospitalPackages from "./pages/hospital/Packages";
import HospitalInquiries from "./pages/hospital/Inquiries";
import HospitalAppointments from "./pages/hospital/Appointments";
import HospitalAnalytics from "./pages/hospital/Analytics";
import HospitalChat from "./pages/hospital/Chat";
import HospitalVisaSupport from "./pages/hospital/VisaSupport";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminHospitals from "./pages/admin/Hospitals";
import AdminUsers from "./pages/admin/Users";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminVisa from "./pages/admin/Visa";
import AdminAgents from "./pages/admin/Agents";
import AgentDashboard from "./pages/agent/Dashboard";
import AgentPatients from "./pages/agent/Patients";
import AddPatient from "./pages/agent/AddPatient";
import AgentCommissions from "./pages/agent/Commissions";
import AgentQuotes from "./pages/agent/Quotes";
import AgentNegotiations from "./pages/agent/Negotiations";
import AgentProfile from "./pages/agent/Profile";
import AgentPatientDocuments from "./pages/agent/PatientDocuments";
import AgentPatientTracking from "./pages/agent/PatientTracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Register service worker for PWA
  useEffect(() => {
    console.log("App component mounted");
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("SW registered:", registration))
        .catch((error) => console.log("SW registration failed:", error));
    }
  }, []);

  console.log("App rendering");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ComparisonProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/hospitals" element={<Hospitals />} />
                  <Route path="/hospital/:id" element={<PublicHospitalProfile />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/treatments" element={<Treatments />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/visa-info" element={<VisaInfo />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/patient/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/patient/visa-application" element={<ProtectedRoute><VisaApplication /></ProtectedRoute>} />
                  <Route path="/patient/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/patient/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/patient/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
                  <Route path="/patient/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                  <Route path="/patient/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                  <Route path="/patient/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/patient/ai-analysis" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />
                   <Route path="/patient/inbox" element={<ProtectedRoute><PatientInbox /></ProtectedRoute>} />
                  <Route path="/patient/support" element={<ProtectedRoute><PatientSupport /></ProtectedRoute>} />
                  <Route path="/hospital/dashboard" element={<ProtectedHospitalRoute><HospitalDashboard /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/profile" element={<ProtectedHospitalRoute><HospitalProfile /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/packages" element={<ProtectedHospitalRoute><HospitalPackages /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/inquiries" element={<ProtectedHospitalRoute><HospitalInquiries /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/appointments" element={<ProtectedHospitalRoute><HospitalAppointments /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/analytics" element={<ProtectedHospitalRoute><HospitalAnalytics /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/chat" element={<ProtectedHospitalRoute><HospitalChat /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/visa-support" element={<ProtectedHospitalRoute><HospitalVisaSupport /></ProtectedHospitalRoute>} />
                  <Route path="/hospital/support" element={<ProtectedHospitalRoute><PatientSupport /></ProtectedHospitalRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                  <Route path="/admin/hospitals" element={<ProtectedAdminRoute><AdminHospitals /></ProtectedAdminRoute>} />
                  <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
                  <Route path="/admin/visa" element={<ProtectedAdminRoute><AdminVisa /></ProtectedAdminRoute>} />
                  <Route path="/admin/visa-requirements" element={<ProtectedAdminRoute><AdminVisaRequirements /></ProtectedAdminRoute>} />
                  <Route path="/admin/communications" element={<ProtectedAdminRoute><AdminCommunications /></ProtectedAdminRoute>} />
                  <Route path="/admin/agents" element={<ProtectedAdminRoute><AdminAgents /></ProtectedAdminRoute>} />
                  <Route path="/agent/dashboard" element={<ProtectedAgentRoute><AgentDashboard /></ProtectedAgentRoute>} />
                  <Route path="/agent/patients" element={<ProtectedAgentRoute><AgentPatients /></ProtectedAgentRoute>} />
                  <Route path="/agent/patients/new" element={<ProtectedAgentRoute><AddPatient /></ProtectedAgentRoute>} />
                  <Route path="/agent/commissions" element={<ProtectedAgentRoute><AgentCommissions /></ProtectedAgentRoute>} />
                  <Route path="/agent/quotes" element={<ProtectedAgentRoute><AgentQuotes /></ProtectedAgentRoute>} />
                  <Route path="/agent/negotiations" element={<ProtectedAgentRoute><AgentNegotiations /></ProtectedAgentRoute>} />
                  <Route path="/agent/profile" element={<ProtectedAgentRoute><AgentProfile /></ProtectedAgentRoute>} />
                  <Route path="/agent/patients/:patientId/documents" element={<ProtectedAgentRoute><AgentPatientDocuments /></ProtectedAgentRoute>} />
                  <Route path="/agent/patients/:patientId/tracking" element={<ProtectedAgentRoute><AgentPatientTracking /></ProtectedAgentRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ComparisonProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
