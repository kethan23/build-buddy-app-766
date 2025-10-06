import { Link } from "react-router-dom";
import { 
  Heart, 
  Bone, 
  Brain, 
  Eye, 
  Activity, 
  Stethoscope,
  Baby,
  Smile
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { icon: Heart, name: "Cardiology", count: "150+ Hospitals", color: "text-red-500" },
  { icon: Bone, name: "Orthopedics", count: "120+ Hospitals", color: "text-blue-500" },
  { icon: Brain, name: "Neurology", count: "80+ Hospitals", color: "text-purple-500" },
  { icon: Eye, name: "Ophthalmology", count: "90+ Hospitals", color: "text-green-500" },
  { icon: Activity, name: "Oncology", count: "100+ Hospitals", color: "text-orange-500" },
  { icon: Stethoscope, name: "General Surgery", count: "200+ Hospitals", color: "text-cyan-500" },
  { icon: Baby, name: "Pediatrics", count: "85+ Hospitals", color: "text-pink-500" },
  { icon: Smile, name: "Dental Care", count: "110+ Hospitals", color: "text-teal-500" },
];

const TreatmentCategories = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Popular <span className="text-primary">Treatments</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore treatments across various specialties with experienced doctors and modern facilities
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.name} to={`/treatments/${category.name.toLowerCase()}`}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Icon className={`h-8 w-8 ${category.color}`} />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link 
            to="/treatments" 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
          >
            View All Specialties
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TreatmentCategories;
