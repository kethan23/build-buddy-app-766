import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const TIERS = [
  { name: "Starter", price: "Free", desc: "List your hospital and reach international patients.", features: ["Hospital profile listing", "Up to 5 treatment packages", "Patient inquiry inbox", "Basic analytics"], cta: "Get started" },
  { name: "Growth", price: "$199/mo", desc: "For hospitals scaling international patient volume.", features: ["Everything in Starter", "Unlimited packages", "Featured placement", "Priority verification", "Advanced analytics", "Dedicated coordinator"], highlight: true, cta: "Start free trial" },
  { name: "Enterprise", price: "Custom", desc: "For hospital groups and chains.", features: ["Multi-branch management", "Custom integrations", "API access", "White-label options", "24/7 priority support"], cta: "Contact sales" },
];

const Pricing = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/30">
    <SEO title="Hospital Pricing Plans — MediConnect" description="Transparent pricing for hospitals listing on MediConnect. Patients always use the platform free of charge." path="/pricing" />
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="font-heading text-3xl sm:text-5xl font-bold">Simple, transparent pricing</h1>
        <p className="text-muted-foreground mt-3">Patients use MediConnect free. Hospitals choose a plan that scales with them.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {TIERS.map((t) => (
          <Card key={t.name} className={`p-6 ${t.highlight ? "border-sky-400 ring-2 ring-sky-200" : ""}`}>
            <div className="text-sm font-semibold text-sky-700">{t.name}</div>
            <div className="font-heading text-3xl font-bold mt-2">{t.price}</div>
            <p className="text-sm text-muted-foreground mt-2">{t.desc}</p>
            <ul className="mt-5 space-y-2">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
            <Button asChild className="w-full mt-6"><Link to="/auth">{t.cta}</Link></Button>
          </Card>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Pricing;
