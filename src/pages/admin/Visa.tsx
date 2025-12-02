import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { VisaApproval } from '@/components/admin/VisaApproval';

const AdminVisa = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Visa Application Management</h1>
          <p className="text-muted-foreground mt-2">
            Review, verify, and approve patient visa applications
          </p>
        </div>
        
        <VisaApproval />
      </main>
      <Footer />
    </div>
  );
};

export default AdminVisa;
