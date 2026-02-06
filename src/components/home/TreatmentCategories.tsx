import { Link } from "react-router-dom";
import { 
  Heart, 
  Bone, 
  Brain, 
  Eye, 
  Activity, 
  Stethoscope,
  Baby,
  Smile,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const categories = [
  { icon: Heart, name: "Cardiology", count: "150+ Hospitals", color: "text-red-500", bg: "bg-red-500/10" },
  { icon: Bone, name: "Orthopedics", count: "120+ Hospitals", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Brain, name: "Neurology", count: "80+ Hospitals", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Eye, name: "Ophthalmology", count: "90+ Hospitals", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Activity, name: "Oncology", count: "100+ Hospitals", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Stethoscope, name: "General Surgery", count: "200+ Hospitals", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: Baby, name: "Pediatrics", count: "85+ Hospitals", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Smile, name: "Dental Care", count: "110+ Hospitals", color: "text-teal-500", bg: "bg-teal-500/10" },
];

const TreatmentCategories = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Premium background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Medical Specialties
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            {t('categories.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link 
                key={category.name} 
                to={`/treatments/${category.name.toLowerCase()}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
              >
                <Card className="group overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center relative">
                    {/* Subtle gradient highlight on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl ${category.bg} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`h-7 w-7 ${category.color}`} />
                    </div>
                    <h3 className="relative font-heading font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="relative text-xs text-muted-foreground">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/treatments" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            View All Specialties
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TreatmentCategories;
