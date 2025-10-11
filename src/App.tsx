import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/patient/ProtectedRoute";
import ProtectedHospitalRoute from "@/components/hospital/ProtectedHospitalRoute";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import Treatments from "./pages/Treatments";
import Support from "./pages/Support";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Dashboard from "./pages/patient/Dashboard";
import Profile from "./pages/patient/Profile";
import Search from "./pages/patient/Search";
import Inquiries from "./pages/patient/Inquiries";
import Bookings from "./pages/patient/Bookings";
import Payments from "./pages/patient/Payments";
import Chat from "./pages/patient/Chat";
import HospitalDashboard from "./pages/hospital/Dashboard";
import HospitalProfile from "./pages/hospital/Profile";
import HospitalPackages from "./pages/hospital/Packages";
import HospitalInquiries from "./pages/hospital/Inquiries";
import HospitalAppointments from "./pages/hospital/Appointments";
import HospitalAnalytics from "./pages/hospital/Analytics";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminHospitals from "./pages/admin/Hospitals";
import AdminUsers from "./pages/admin/Users";
import AdminAnalytics from "./pages/admin/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("SW registered:", registration))
        .catch((error) => console.log("SW registration failed:", error));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/treatments" element={<Treatments />} />
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/patient/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/patient/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/patient/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/patient/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
              <Route path="/patient/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/patient/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/patient/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/hospital/dashboard" element={<ProtectedHospitalRoute><HospitalDashboard /></ProtectedHospitalRoute>} />
              <Route path="/hospital/profile" element={<ProtectedHospitalRoute><HospitalProfile /></ProtectedHospitalRoute>} />
              <Route path="/hospital/packages" element={<ProtectedHospitalRoute><HospitalPackages /></ProtectedHospitalRoute>} />
              <Route path="/hospital/inquiries" element={<ProtectedHospitalRoute><HospitalInquiries /></ProtectedHospitalRoute>} />
              <Route path="/hospital/appointments" element={<ProtectedHospitalRoute><HospitalAppointments /></ProtectedHospitalRoute>} />
              <Route path="/hospital/analytics" element={<ProtectedHospitalRoute><HospitalAnalytics /></ProtectedHospitalRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/hospitals" element={<ProtectedAdminRoute><AdminHospitals /></ProtectedAdminRoute>} />
              <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
              <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
