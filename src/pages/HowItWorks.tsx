import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import HowItWorksSection from "@/components/home/HowItWorks";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={"How MediConnect Works — From Inquiry to Recovery"} description={"Step-by-step: search hospitals, request quotes, book consultations, get visa help and travel with confidence."} path={"/how-it-works"} />
      <Navbar />
      <main className="flex-1">
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
