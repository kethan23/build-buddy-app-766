import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { VisaApplicationForm } from '@/components/visa/VisaApplicationForm';

export default function VisaApplicationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text">Apply for Visa Assistance</h1>
            <p className="text-muted-foreground mt-2">
              We'll guide you through the medical visa application process for your treatment in India
            </p>
          </div>
          
          <VisaApplicationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
