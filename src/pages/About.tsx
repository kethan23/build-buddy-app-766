import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Globe, Award, Heart } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Patient-Centric Care",
      description: "We prioritize patient safety, comfort, and satisfaction above all else.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "All hospitals are thoroughly vetted and meet international standards.",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "Making quality healthcare accessible to patients worldwide.",
    },
    {
      icon: Users,
      title: "Trusted Network",
      description: "Partnering with India's most reputable hospitals and specialists.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
                About <span className="text-primary">MediConnect</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Bridging the gap between international patients and India's world-class healthcare system
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading font-bold text-3xl mb-6 text-center">Our Mission</h2>
              <p className="text-muted-foreground text-lg text-center mb-8">
                MediConnect was founded with a simple yet powerful mission: to make quality healthcare
                accessible and affordable to patients around the world. We believe that everyone deserves
                access to excellent medical care, regardless of where they live or their financial situation.
              </p>
              <p className="text-muted-foreground text-lg text-center">
                India has emerged as a global leader in medical tourism, offering world-class healthcare
                at a fraction of the cost in Western countries. Our platform connects you with the best
                hospitals and doctors, ensuring a safe, transparent, and seamless medical journey.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="font-heading font-bold text-4xl text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Partner Hospitals</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-4xl text-accent mb-2">10,000+</div>
                <div className="text-muted-foreground">Patients Treated</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-4xl text-success mb-2">50+</div>
                <div className="text-muted-foreground">Medical Specialties</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-4xl text-warning mb-2">98%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.title}>
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
