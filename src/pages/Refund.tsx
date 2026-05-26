import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Refund = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={"Refund Policy — MediConnect"} description={"Refund policy for facilitation fees, booking deposits and visa rejection scenarios."} path={"/refund"} />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>1. Scope</h2>
            <p>
              This Refund Policy applies to payments processed through the MediConnect Platform, including consultation fees, booking deposits, and facilitation charges. Refunds for treatment costs paid directly to a hospital are governed by that hospital's own refund policy.
            </p>

            <h2>2. Facilitation &amp; Consultation Fees</h2>
            <ul>
              <li>Cancellation more than 7 days before the scheduled service: eligible for a full refund minus payment-gateway charges.</li>
              <li>Cancellation 2–7 days before: eligible for a 50% refund.</li>
              <li>Cancellation less than 48 hours before, or no-show: non-refundable.</li>
            </ul>

            <h2>3. Booking Deposits</h2>
            <p>
              Booking deposits paid to confirm a treatment slot are refundable only if the hospital cancels the booking, the patient is medically declared unfit by the treating hospital, or visa rejection is officially documented. Refund timelines and amounts are subject to the hospital's confirmation.
            </p>

            <h2>4. Visa Rejection</h2>
            <p>
              If your medical visa is officially rejected and you provide documented proof from the embassy, facilitation fees paid for that specific booking may be refunded after deducting non-recoverable third-party costs. Visa decisions are made by the embassy and are outside MediConnect's control.
            </p>

            <h2>5. Non-Refundable Items</h2>
            <ul>
              <li>Payment gateway and currency conversion fees</li>
              <li>Third-party visa application charges already paid</li>
              <li>Travel, flight, and hotel bookings (subject to those providers' policies)</li>
              <li>Services already rendered (completed consultations, issued documents)</li>
            </ul>

            <h2>6. Refund Process</h2>
            <ul>
              <li>Submit refund requests in writing to <strong>support@mediconnect.com</strong> with your booking ID and reason.</li>
              <li>Approved refunds are processed within 7–14 business days to the original payment method.</li>
              <li>International refunds may take additional time depending on your bank.</li>
            </ul>

            <h2>7. Disputes</h2>
            <p>
              Any refund disputes will be reviewed in good faith. Unresolved disputes are subject to the governing law and jurisdiction stated in our Terms and Conditions.
            </p>

            <h2>8. Contact</h2>
            <p>
              For refund queries: <strong>support@mediconnect.com</strong> · <strong>+91 9014883449</strong>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Refund;
