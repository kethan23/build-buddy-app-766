import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [sending, setSending] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! Our team will reach out within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 800);
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/30">
      <SEO title="Contact MediConnect" description="Get in touch with the MediConnect team for medical tourism, hospital partnerships, or support." path="/contact" />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold">Get in touch</h1>
          <p className="text-muted-foreground mt-3">Our multilingual team responds within 24 hours.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 lg:col-span-2">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Full name</Label><Input required placeholder="Your name" /></div>
                <div><Label>Email</Label><Input required type="email" placeholder="you@example.com" /></div>
              </div>
              <div><Label>Subject</Label><Input required placeholder="How can we help?" /></div>
              <div><Label>Message</Label><Textarea required rows={5} placeholder="Tell us a bit about your needs..." /></div>
              <Button type="submit" disabled={sending} className="w-full">{sending ? "Sending..." : "Send message"}</Button>
            </form>
          </Card>
          <div className="space-y-3">
            {[
              { icon: Mail, label: "Email", value: "support@mediconnect.com" },
              { icon: Phone, label: "Phone", value: "+91 9014883449" },
              { icon: MessageSquare, label: "Live chat", value: "Available 24/7 in 8 languages" },
              { icon: MapPin, label: "Office", value: "Vishakapatnam, AP, India" },
            ].map((c) => (
              <Card key={c.label} className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0"><c.icon className="h-4 w-4" /></div>
                <div><div className="text-xs text-muted-foreground">{c.label}</div><div className="text-sm font-medium">{c.value}</div></div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
