import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

const POSTS = [
  { title: "A Complete Guide to Medical Tourism in India (2026)", date: "May 28, 2026", excerpt: "Costs, hospitals, visas, recovery — everything international patients need to know." },
  { title: "Top 10 Cardiac Hospitals in India for International Patients", date: "May 15, 2026", excerpt: "NABH/JCI-accredited heart centers with proven outcomes for global patients." },
  { title: "Understanding the Indian Medical Visa Process", date: "Apr 30, 2026", excerpt: "Step-by-step guide to securing an M-Visa for treatment in India." },
  { title: "Cost Comparison: Knee Replacement Around the World", date: "Apr 12, 2026", excerpt: "How India delivers premium orthopedic care at 70% lower cost than the West." },
  { title: "What to Expect During IVF in India", date: "Mar 28, 2026", excerpt: "Success rates, timelines, and what makes Indian fertility care world-class." },
  { title: "Recovery & Aftercare: Planning Your Post-Treatment Stay", date: "Mar 15, 2026", excerpt: "Hotels, wellness retreats, and follow-up consultations explained." },
];

const Blog = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/30">
    <SEO title="MediConnect Blog — Medical Tourism Insights" description="Expert guides, hospital reviews, and patient stories about medical tourism in India." path="/blog" />
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="font-heading text-3xl sm:text-5xl font-bold">Insights & Stories</h1>
        <p className="text-muted-foreground mt-3">Guides, hospital deep-dives, and patient experiences.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {POSTS.map((p) => (
          <Card key={p.title} className="p-6 group cursor-pointer hover:border-sky-300 transition">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{p.date}</div>
            <h3 className="font-heading font-semibold mt-2 group-hover:text-sky-700 transition">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.excerpt}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-sky-700">Read more <ArrowRight className="h-3.5 w-3.5" /></div>
          </Card>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Blog;
