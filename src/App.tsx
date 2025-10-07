import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/patient/ProtectedRoute";
import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import Treatments from "./pages/Treatments";
import Support from "./pages/Support";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Dashboard from "./pages/patient/Dashboard";
import Profile from "./pages/patient/Profile";
import Search from "./pages/patient/Search";
import Inquiries from "./pages/patient/Inquiries";
import Bookings from "./pages/patient/Bookings";
import Payments from "./pages/patient/Payments";
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
              <Route path="/auth" element={<Auth />} />
              <Route path="/patient/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/patient/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/patient/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/patient/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
              <Route path="/patient/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/patient/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
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
