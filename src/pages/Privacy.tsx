import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>1. Introduction</h2>
            <p>
              MediConnect ("we", "us", "our") is a medical tourism facilitation platform that connects international patients with hospitals and healthcare providers in India. We are committed to protecting the privacy and confidentiality of all users, particularly given the sensitive nature of medical information shared on our platform.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, share, and protect your information when you use our website, mobile applications, and related services.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Country of residence</li>
              <li>Date of birth and gender</li>
              <li>Passport details (when required for visa assistance)</li>
              <li>Emergency contact information</li>
            </ul>

            <h3>2.2 Medical Information</h3>
            <ul>
              <li>Medical reports and diagnostic results</li>
              <li>Current and past diagnoses</li>
              <li>Treatment and surgical history</li>
              <li>Prescriptions and medication lists</li>
              <li>Uploaded medical documents and imaging files</li>
              <li>Symptoms and condition descriptions you share with us</li>
            </ul>

            <h3>2.3 Technical Data</h3>
            <ul>
              <li>IP address and approximate location</li>
              <li>Browser type, version, and device information</li>
              <li>Operating system</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To connect you with hospitals, doctors, and treatment packages</li>
              <li>To coordinate medical consultations, second opinions, and appointments</li>
              <li>To provide AI-assisted treatment recommendations and hospital matches</li>
              <li>To facilitate visa assistance, travel coordination, and accommodation</li>
              <li>To process payments and issue receipts</li>
              <li>To improve our platform, services, and user experience</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To send service-related notifications and updates</li>
              <li>To comply with legal, regulatory, and tax obligations</li>
            </ul>

            <h2>4. Medical Data Handling</h2>
            <p>
              We treat your medical information with the highest level of confidentiality:
            </p>
            <ul>
              <li>All medical documents are stored in encrypted, access-controlled cloud storage.</li>
              <li>Access is restricted to authorized personnel and the specific hospitals or doctors you choose to share your data with.</li>
              <li>Medical data is shared with healthcare providers <strong>only after your explicit consent</strong>.</li>
              <li>We follow international best practices aligned with HIPAA-style confidentiality principles and GDPR data protection standards, even where not strictly required by Indian law.</li>
              <li>You may revoke consent or request deletion of your medical records at any time, subject to legal retention requirements.</li>
            </ul>

            <h2>5. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Partner hospitals and clinics</strong> you select or inquire with</li>
              <li><strong>Doctors and medical coordinators</strong> assigned to your case</li>
              <li><strong>Travel, visa, and accommodation coordinators</strong> when you use those services</li>
              <li><strong>Payment processors</strong> for transaction handling</li>
              <li><strong>Legal authorities</strong> when required by law, court order, or to protect rights and safety</li>
              <li><strong>Service providers</strong> who help operate our platform (analytics, communication, hosting), under strict confidentiality agreements</li>
            </ul>
            <p>
              <strong>We do not sell your personal or medical information to third parties for marketing purposes.</strong>
            </p>

            <h2>6. Data Storage & Security</h2>
            <ul>
              <li>End-to-end encrypted storage for medical documents</li>
              <li>Secure servers with regular security audits</li>
              <li>Role-based access control and authentication</li>
              <li>SSL/HTTPS encryption for all data in transit</li>
              <li>Row-level security policies on our database</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
            <p>
              While we implement industry-standard security measures, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.
            </p>

            <h2>7. Cookies Policy</h2>
            <p>We use the following types of cookies:</p>
            <ul>
              <li><strong>Essential cookies</strong> — required for authentication and core functionality</li>
              <li><strong>Session cookies</strong> — to maintain your login session</li>
              <li><strong>Preference cookies</strong> — to remember language and display settings</li>
              <li><strong>Analytics cookies</strong> — to understand how users interact with our platform</li>
            </ul>
            <p>You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality.</p>

            <h2>8. International Users</h2>
            <p>
              MediConnect is operated from India. By using our platform, you understand and consent that your information — including medical data — may be transferred to, stored, and processed in India and other jurisdictions where our service providers operate. Data protection laws in these countries may differ from those in your country of residence.
            </p>

            <h2>9. Your Rights</h2>
            <p>Subject to applicable law, you have the right to:</p>
            <ul>
              <li>Access the personal and medical data we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Withdraw consent for processing at any time</li>
              <li>Request data portability</li>
              <li>Object to certain types of processing</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>
            <p>To exercise these rights, contact us at the email below.</p>

            <h2>10. Data Retention</h2>
            <p>
              We retain personal and medical information only as long as necessary to provide our services, comply with legal obligations (including tax and medical record retention laws), resolve disputes, and enforce agreements. Medical records may be retained for the period required by applicable healthcare regulations and then securely deleted or anonymized.
            </p>

            <h2>11. Third-Party Services</h2>
            <p>Our platform integrates with the following categories of third-party services:</p>
            <ul>
              <li>Payment gateways (Razorpay, Stripe, PayPal)</li>
              <li>Cloud infrastructure and storage (Supabase)</li>
              <li>Analytics services (Google Analytics)</li>
              <li>Communication services (email, SMS, WhatsApp Business)</li>
              <li>AI and translation services</li>
            </ul>
            <p>Each third-party service has its own privacy policy; we encourage you to review them.</p>

            <h2>12. Children's Privacy</h2>
            <p>
              Our platform is intended for users aged 18 and above. Medical inquiries for minors must be initiated and managed by a parent or legal guardian.
            </p>

            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on our platform. Continued use after changes constitutes acceptance.
            </p>

            <h2>14. Contact Information</h2>
            <p>For privacy-related questions, requests, or concerns:</p>
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

export default Privacy;
