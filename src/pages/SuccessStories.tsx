import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const STORIES = [
  { name: "Sarah J.", country: "USA", treatment: "Knee Replacement", body: "Outstanding care from start to finish. Saved 65% vs. US prices with world-class results." },
  { name: "Ahmed K.", country: "UAE", treatment: "Cardiac Bypass", body: "MediConnect made everything seamless — visa, hospital, recovery. I'm back to full health." },
  { name: "Maria L.", country: "Spain", treatment: "IVF Treatment", body: "After two failed attempts at home, we succeeded in India. Forever grateful." },
  { name: "John D.", country: "Nigeria", treatment: "Spine Surgery", body: "Walked pain-free for the first time in 5 years. Indian doctors are exceptional." },
  { name: "Fatima H.", country: "Kenya", treatment: "Cancer Treatment", body: "Affordable, compassionate, world-class oncology. The platform handled every detail." },
  { name: "Liam O.", country: "Ireland", treatment: "Dental Implants", body: "Premium results at a fraction of European costs. Highly recommended." },
];

const SuccessStories = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/30">
    <SEO title="Patient Success Stories — MediConnect" description="Real stories from international patients who received world-class medical care in India through MediConnect." path="/success-stories" />
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="font-heading text-3xl sm:text-5xl font-bold">Patient Success Stories</h1>
        <p className="text-muted-foreground mt-3">Real outcomes from real patients across 40+ countries.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {STORIES.map((s) => (
          <Card key={s.name} className="p-6">
            <Quote className="h-5 w-5 text-sky-500" />
            <p className="text-sm text-foreground/80 mt-3 leading-relaxed">"{s.body}"</p>
            <div className="flex gap-0.5 mt-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-semibold">{s.name} · {s.country}</div>
              <div className="text-xs text-muted-foreground">{s.treatment}</div>
            </div>
          </Card>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default SuccessStories;
