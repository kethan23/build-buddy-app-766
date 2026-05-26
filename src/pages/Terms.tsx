import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
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
              By accessing or using the MediConnect website, mobile applications, or any related services (collectively, the "Platform"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use the Platform.
            </p>

            <h2>2. Platform Purpose &amp; Role</h2>
            <p>
              <strong>MediConnect acts solely as a facilitator connecting patients with healthcare providers (hospitals, clinics, and doctors) in India. We do not provide medical diagnosis, treatment, or medical advice.</strong> We are not a healthcare provider, insurance company, travel agency, or visa issuing authority.
            </p>
            <p>
              All medical decisions, treatment plans, and clinical outcomes are the sole responsibility of the hospital, doctor, or healthcare professional you engage with.
            </p>

            <h2>3. No Medical Advice Disclaimer</h2>
            <p>
              Information provided on the Platform — including hospital profiles, treatment descriptions, AI-assisted recommendations, chatbot responses, and content provided by third parties — is for <strong>informational purposes only</strong> and is <strong>not a substitute for professional medical advice, diagnosis, or treatment</strong>.
            </p>
            <p>
              Always seek the advice of a qualified physician or healthcare provider for any medical condition or treatment decision. Never disregard professional medical advice or delay seeking it based on information from the Platform.
            </p>

            <h2>4. Eligibility</h2>
            <ul>
              <li>You must be at least 18 years old to register and use the Platform.</li>
              <li>You must have the legal authority to share your own medical records or those of any minor or dependent you represent.</li>
              <li>You must provide accurate, current, and complete information during registration and use.</li>
            </ul>

            <h2>5. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate personal, contact, and medical information</li>
              <li>Upload only authentic medical records and documents that belong to you or that you are authorized to share</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Not misuse the Platform for fraudulent, unlawful, harmful, or abusive purposes</li>
              <li>Not attempt to bypass security, reverse-engineer, or disrupt Platform operations</li>
              <li>Not impersonate any person or misrepresent your identity or medical condition</li>
            </ul>

            <h2>6. Appointment &amp; Consultation Disclaimer</h2>
            <ul>
              <li>Appointment and consultation availability is subject to the hospital's or doctor's schedule and may change without notice.</li>
              <li>We do not guarantee any specific treatment outcome, recovery timeline, or medical success.</li>
              <li>Pricing estimates and quotes provided through the Platform are indicative and subject to revision by the hospital after physical evaluation.</li>
              <li>Final treatment plans, costs, and timelines are determined solely by the treating hospital or doctor.</li>
            </ul>

            <h2>7. Payments &amp; Refunds</h2>
            <ul>
              <li>Certain services (such as consultation fees, booking deposits, or facilitation charges) may require payment through the Platform.</li>
              <li>Payments are processed via third-party payment gateways (Razorpay, Stripe, PayPal) and are subject to their respective terms.</li>
              <li>Refund eligibility depends on the specific service, the hospital's refund policy, and the stage of the booking. Please refer to our separate Refund Policy for details.</li>
              <li>Currency conversion rates are determined by the payment gateway and may include processing fees.</li>
            </ul>

            <h2>8. Medical Tourism Disclaimer</h2>
            <ul>
              <li><strong>Visa approval is not guaranteed.</strong> MediConnect provides visa documentation assistance but does not issue visas. Visa decisions rest solely with the relevant embassy or consulate.</li>
              <li>Travel arrangements (flights, hotels, transfers) depend on third-party providers and their terms.</li>
              <li>All treatment-related decisions — including suitability, procedure choice, hospitalization duration, and post-operative care — belong to the treating hospital and doctor.</li>
              <li>You are responsible for understanding the legal, medical, and travel requirements of your country of origin and India.</li>
            </ul>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MediConnect, its founders, employees, agents, and partners shall <strong>not be liable</strong> for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul>
              <li>Medical outcomes, complications, injury, or death</li>
              <li>Misdiagnosis, treatment errors, or hospital decisions</li>
              <li>Delays in treatment, travel, or visa processing</li>
              <li>Loss of data, profits, revenue, or business opportunity</li>
              <li>Acts or omissions of hospitals, doctors, or other third parties</li>
              <li>Currency fluctuations or payment gateway failures</li>
            </ul>
            <p>
              Our total aggregate liability for any claim arising out of or related to the Platform shall not exceed the facilitation fees you paid to MediConnect in the three months preceding the event giving rise to the claim.
            </p>

            <h2>10. Intellectual Property</h2>
            <p>
              The MediConnect name, logo, branding, website design, software, content, and all related intellectual property are owned by MediConnect or its licensors. You may not copy, reproduce, modify, distribute, or create derivative works without prior written permission.
            </p>

            <h2>11. User Content</h2>
            <p>
              Medical reports, documents, and other content you upload remain your property. By uploading content, you grant MediConnect a limited, non-exclusive, royalty-free license to store, process, and share that content with the hospitals and providers you select, solely for the purpose of facilitating your medical care.
            </p>

            <h2>12. Termination</h2>
            <p>
              We reserve the right to suspend, restrict, or terminate your account at our discretion if you violate these Terms, misuse the Platform, or engage in fraudulent or harmful conduct. You may also terminate your account at any time by contacting support.
            </p>

            <h2>13. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes arising out of or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the courts of Vishakapatnam, Andhra Pradesh, India.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be notified via email or a prominent Platform notice. Continued use after changes take effect constitutes acceptance of the revised Terms.
            </p>

            <h2>15. Contact Information</h2>
            <ul>
              <li><strong>Email:</strong> support@mediconnect.com</li>
              <li><strong>Phone:</strong> +91 9014883449</li>
              <li><strong>Address:</strong> Vishakapatnam, Andhra Pradesh, India</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
