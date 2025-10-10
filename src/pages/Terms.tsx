import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using MediConnect, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to use MediConnect for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
            </p>

            <h2>3. Medical Disclaimer</h2>
            <p>
              MediConnect is a platform connecting patients with healthcare providers. We do not provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.
            </p>

            <h2>4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h2>5. Privacy</h2>
            <p>
              Your use of MediConnect is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </p>

            <h2>6. Hospital Verification</h2>
            <p>
              While we strive to verify all hospitals on our platform, we cannot guarantee the accuracy of all information provided. Users should conduct their own due diligence.
            </p>

            <h2>7. Payments and Refunds</h2>
            <p>
              All payments processed through MediConnect are subject to our refund policy. Please review the specific terms of each hospital or service provider.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              MediConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or platform notification.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at: support@mediconnect.com
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
