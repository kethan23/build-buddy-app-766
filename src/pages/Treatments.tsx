import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TreatmentCategories from "@/components/home/TreatmentCategories";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock } from "lucide-react";

const Treatments = () => {
  const popularTreatments = [
    {
      name: "Cardiac Bypass Surgery",
      avgCost: "$6,000 - $10,000",
      duration: "7-10 days",
      savings: "Save up to 70%",
    },
    {
      name: "Hip Replacement",
      avgCost: "$7,000 - $12,000",
      duration: "10-14 days",
      savings: "Save up to 75%",
    },
    {
      name: "Dental Implants",
      avgCost: "$800 - $1,500",
      duration: "5-7 days",
      savings: "Save up to 65%",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-4xl mb-4">Medical Treatments</h1>
            <p className="text-muted-foreground">
              Explore world-class medical treatments at affordable prices
            </p>
          </div>
        </section>

        {/* Treatment Categories */}
        <TreatmentCategories />

        {/* Popular Treatments */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-8 text-center">
              Most Popular <span className="text-primary">Treatments</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularTreatments.map((treatment) => (
                <Card key={treatment.name}>
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-xl mb-4">{treatment.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="h-5 w-5 mr-2 text-primary" />
                        <span>{treatment.avgCost}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        <span>{treatment.duration}</span>
                      </div>
                      <div className="flex items-center text-success font-medium">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        <span>{treatment.savings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Treatments;
