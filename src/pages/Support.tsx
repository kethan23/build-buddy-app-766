import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, Phone, MessageCircle } from "lucide-react";

const Support = () => {
  const faqs = [
    {
      question: "How do I book a consultation?",
      answer: "You can book a consultation by browsing hospitals, selecting a doctor, and clicking the 'Book Consultation' button. You'll receive confirmation within 24 hours.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, PayPal, bank transfers, and cryptocurrency payments for your convenience.",
    },
    {
      question: "Do you help with visa arrangements?",
      answer: "Yes, we provide complete visa assistance including application guidance, document preparation, and coordination with medical visa experts.",
    },
    {
      question: "How much can I save compared to my home country?",
      answer: "On average, patients save 50-75% on medical treatments in India compared to US, UK, and European prices while receiving world-class care.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-4xl mb-4">Support Center</h1>
            <p className="text-muted-foreground">
              We're here to help you with any questions or concerns
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg mb-2">24/7 Phone Support</h3>
                  <p className="text-muted-foreground mb-4">+91 1800 123 4567</p>
                  <Button variant="outline">Call Now</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg mb-2">Email Support</h3>
                  <p className="text-muted-foreground mb-4">support@mediconnect.com</p>
                  <Button variant="outline">Send Email</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg mb-2">Live Chat</h3>
                  <p className="text-muted-foreground mb-4">Chat with our team</p>
                  <Button variant="outline">Start Chat</Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto mb-16">
              <Card>
                <CardContent className="p-8">
                  <h2 className="font-heading font-bold text-2xl mb-6">Send us a Message</h2>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Your Name" />
                      <Input type="email" placeholder="Your Email" />
                    </div>
                    <Input placeholder="Subject" />
                    <Textarea placeholder="Your Message" rows={6} />
                    <Button className="w-full" size="lg">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* FAQs */}
            <div className="max-w-3xl mx-auto">
              <h2 className="font-heading font-bold text-3xl mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-heading">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
