import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MedicalDisclaimer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={"Medical Disclaimer — MediConnect"} description={"MediConnect is a facilitator only and does not provide medical advice, diagnosis or treatment."} path={"/medical-disclaimer"} />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Medical Disclaimer</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>1. Facilitator, Not a Healthcare Provider</h2>
            <p>
              <strong>MediConnect acts solely as a facilitator connecting patients with healthcare providers and does not provide medical diagnosis, treatment, or medical advice.</strong> All medical services are provided by independent hospitals, clinics, and doctors listed on the Platform.
            </p>

            <h2>2. No Doctor–Patient Relationship</h2>
            <p>
              Use of the Platform does not create a doctor–patient relationship between you and MediConnect. A doctor–patient relationship is formed only with the treating physician at the hospital you choose, once treatment is formally accepted.
            </p>

            <h2>3. Informational Content Only</h2>
            <p>
              Hospital profiles, treatment descriptions, package details, articles, blog posts, AI chatbot responses, and AI-assisted recommendations are for general informational purposes only. They are <strong>not</strong> a substitute for professional consultation, examination, diagnosis, or treatment.
            </p>

            <h2>4. AI-Assisted Features</h2>
            <p>
              Our AI tools (including report analysis, hospital matching, and chat assistance) generate suggestions based on the information you provide. These outputs may be incomplete or inaccurate and must be reviewed and validated by a qualified medical professional before any clinical decision is made.
            </p>

            <h2>5. No Guarantees</h2>
            <p>
              We do not guarantee any specific medical outcome, recovery, success rate, treatment availability, hospital response time, or pricing accuracy. All treatment-related decisions are made by the treating hospital and doctor.
            </p>

            <h2>6. Emergency Care</h2>
            <p>
              <strong>The Platform is not designed for medical emergencies.</strong> If you are experiencing a medical emergency, call your local emergency number or visit the nearest emergency room immediately.
            </p>

            <h2>7. Your Responsibility</h2>
            <p>
              Always consult a qualified healthcare professional before starting, stopping, or changing any treatment. Never disregard professional medical advice or delay seeking it because of something you have read or received on the Platform.
            </p>

            <h2>8. Confidentiality Commitment</h2>
            <p>
              While Indian law does not impose HIPAA specifically, MediConnect voluntarily applies HIPAA-style confidentiality principles to all medical information handled on the Platform — including restricted access, encryption, audit logging, and explicit consent before any data sharing.
            </p>

            <h2>9. Contact</h2>
            <p>
              Questions about this disclaimer? Email <strong>support@mediconnect.com</strong>.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MedicalDisclaimer;
