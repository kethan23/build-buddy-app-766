import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Cookies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Cookie Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the site recognize your device and remember information about your visit.
            </p>

            <h2>2. Types of Cookies We Use</h2>
            <ul>
              <li><strong>Essential cookies</strong> — required for login, security, and core Platform features.</li>
              <li><strong>Session cookies</strong> — keep you signed in during a browsing session.</li>
              <li><strong>Preference cookies</strong> — remember your language, region, and display settings.</li>
              <li><strong>Analytics cookies</strong> — help us understand how the Platform is used so we can improve it (e.g., Google Analytics).</li>
              <li><strong>Functional cookies</strong> — enable features like chat, video consultations, and saved searches.</li>
            </ul>

            <h2>3. Third-Party Cookies</h2>
            <p>
              Some cookies are set by trusted third parties we work with, such as analytics providers, payment gateways, and embedded media services. These third parties have their own privacy and cookie policies.
            </p>

            <h2>4. Managing Cookies</h2>
            <p>
              You can control or delete cookies through your browser settings. Most browsers let you block cookies entirely, accept only certain types, or notify you before a cookie is set. Disabling essential cookies may break login and other core functionality.
            </p>

            <h2>5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Material changes will be highlighted on the Platform.
            </p>

            <h2>6. Contact</h2>
            <p>
              Questions? Email <strong>support@mediconnect.com</strong>.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
