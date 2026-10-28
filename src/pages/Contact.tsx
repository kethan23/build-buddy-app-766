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
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Contact = () => {
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { role } = useUserRole();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const subject = String(data.get("subject") || "");
    const message = String(data.get("message") || "");

    if (!user) {
      toast.info("Please sign in so we can track and answer your message", {
        description: "You can also email us directly at support@mediconnect.com",
      });
      return;
    }

    setSending(true);
    try {
      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          user_role: role || "patient",
          subject,
          category: "general",
          priority: "normal",
          status: "open",
        })
        .select()
        .single();
      if (error) throw error;

      const contact = [name, email].filter(Boolean).join(" | ");
      const { error: msgError } = await supabase.from("support_messages").insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_role: role || "patient",
        content: contact ? `${message}\n\n(Contact: ${contact})` : message,
      });
      if (msgError) throw msgError;

      toast.success("Message sent! Our team will reach out within 24 hours.");
      form.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error("Could not send your message. Please try again or email support@mediconnect.com");
    } finally {
      setSending(false);
    }
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
                <div><Label>Full name</Label><Input required name="name" placeholder="Your name" /></div>
                <div><Label>Email</Label><Input required type="email" name="email" placeholder="you@example.com" /></div>
              </div>
              <div><Label>Subject</Label><Input required name="subject" placeholder="How can we help?" /></div>
              <div><Label>Message</Label><Textarea required name="message" rows={5} placeholder="Tell us a bit about your needs..." /></div>
              {user ? (
                <Button type="submit" disabled={sending} className="w-full">{sending ? "Sending..." : "Send message"}</Button>
              ) : (
                <div className="space-y-2">
                  <Button type="button" asChild className="w-full">
                    <Link to="/auth">Sign in to send your message</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Not a member yet? You can also email us at support@mediconnect.com
                  </p>
                </div>
              )}
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
