import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Newspaper } from "lucide-react";

const ITEMS = [
  { date: "May 2026", outlet: "TechCrunch", title: "MediConnect raises Series A to expand medical tourism platform across Asia" },
  { date: "Apr 2026", outlet: "Forbes", title: "How MediConnect is making world-class healthcare accessible to global patients" },
  { date: "Mar 2026", outlet: "The Economic Times", title: "Indian medical tourism gets a digital upgrade with MediConnect" },
  { date: "Feb 2026", outlet: "YourStory", title: "Bridging continents: MediConnect's mission for transparent medical care" },
];

const Press = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/30">
    <SEO title="Press & Media — MediConnect" description="Press releases, media coverage, and brand assets for MediConnect." path="/press" />
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="font-heading text-3xl sm:text-5xl font-bold">Press & Media</h1>
        <p className="text-muted-foreground mt-3">News, coverage, and resources for journalists.</p>
      </div>
      <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {ITEMS.map((i) => (
            <Card key={i.title} className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Newspaper className="h-3 w-3" />{i.outlet} · {i.date}</div>
              <h3 className="font-heading font-semibold mt-2">{i.title}</h3>
            </Card>
          ))}
        </div>
        <Card className="p-6 h-fit">
          <h3 className="font-heading font-semibold">Media kit</h3>
          <p className="text-sm text-muted-foreground mt-2">Logos, brand guidelines, and executive bios.</p>
          <Button className="w-full mt-4 gap-2" asChild><a href="mailto:press@mediconnect.com"><Download className="h-4 w-4" />Request kit</a></Button>
          <div className="mt-5 pt-5 border-t text-xs text-muted-foreground">
            Press inquiries: <a className="text-sky-700 font-medium" href="mailto:press@mediconnect.com">press@mediconnect.com</a>
          </div>
        </Card>
      </div>
    </main>
    <Footer />
  </div>
);

export default Press;
