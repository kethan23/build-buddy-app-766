import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedHospitals from "@/components/home/FeaturedHospitals";
import TreatmentCategories from "@/components/home/TreatmentCategories";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="MediConnect — Medical Tourism in India for International Patients"
        description="Compare verified Indian hospitals, get AI-matched treatments, transparent pricing & full visa assistance. Trusted facilitator for international patients."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "MediConnect",
          url: "https://mediconnect-medical-tour.lovable.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://mediconnect-medical-tour.lovable.app/hospitals?search={query}",
            "query-input": "required name=query",
          },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TreatmentCategories />
        <FeaturedHospitals />
        <HowItWorks />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
