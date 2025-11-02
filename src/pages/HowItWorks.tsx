import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HowItWorksSection from "@/components/home/HowItWorks";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
