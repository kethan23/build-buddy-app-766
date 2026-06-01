import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock } from "lucide-react";

const ROLES = [
  { title: "Senior Full-Stack Engineer", dept: "Engineering", location: "Hyderabad / Remote", type: "Full-time" },
  { title: "Medical Coordinator (Arabic-speaking)", dept: "Patient Success", location: "Remote", type: "Full-time" },
  { title: "Hospital Partnerships Manager", dept: "Business Development", location: "Mumbai", type: "Full-time" },
  { title: "Product Designer", dept: "Design", location: "Bangalore / Remote", type: "Full-time" },
  { title: "Growth Marketing Lead", dept: "Marketing", location: "Remote", type: "Full-time" },
];

const Careers = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/30">
    <SEO title="Careers at MediConnect" description="Join MediConnect and help millions of international patients access world-class healthcare in India." path="/careers" />
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="font-heading text-3xl sm:text-5xl font-bold">Build healthcare without borders</h1>
        <p className="text-muted-foreground mt-3">Join a mission-driven team transforming how the world accesses medical care.</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {ROLES.map((r) => (
          <Card key={r.title} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-semibold">{r.title}</h3>
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{r.dept}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.type}</span>
              </div>
            </div>
            <Button asChild variant="outline"><a href="mailto:careers@mediconnect.com">Apply</a></Button>
          </Card>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Careers;
