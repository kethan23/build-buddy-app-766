import { Link } from "react-router-dom";
import {
  Heart, Bone, Brain, Eye, Activity, Stethoscope, Baby, Smile, Sparkles, ArrowRight,
  Scissors, Scale, Pill, Syringe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const categories = [
  { icon: Activity, name: "Oncology", count: "100+ Hospitals", color: "text-orange-500", bg: "bg-orange-500/10", desc: "Advanced cancer treatments with proven results" },
  { icon: Brain, name: "Neurosurgery", count: "80+ Hospitals", color: "text-purple-500", bg: "bg-purple-500/10", desc: "Adult and pediatric neurosurgical care" },
  { icon: Bone, name: "Spine Surgery", count: "90+ Hospitals", color: "text-blue-500", bg: "bg-blue-500/10", desc: "Precision spine surgeries for better mobility" },
  { icon: Heart, name: "Cardiology", count: "150+ Hospitals", color: "text-red-500", bg: "bg-red-500/10", desc: "World-class heart care for adults and children" },
  { icon: Bone, name: "Orthopedics", count: "120+ Hospitals", color: "text-cyan-500", bg: "bg-cyan-500/10", desc: "Expert joint replacements and bone solutions" },
  { icon: Baby, name: "IVF & Fertility", count: "85+ Hospitals", color: "text-pink-500", bg: "bg-pink-500/10", desc: "Leading fertility treatments with high success" },
  { icon: Stethoscope, name: "Gynecology", count: "110+ Hospitals", color: "text-rose-500", bg: "bg-rose-500/10", desc: "Specialized women's health services" },
  { icon: Scissors, name: "Cosmetic Surgery", count: "95+ Hospitals", color: "text-violet-500", bg: "bg-violet-500/10", desc: "Aesthetic procedures for a new you" },
  { icon: Scale, name: "Weight Loss", count: "70+ Hospitals", color: "text-amber-500", bg: "bg-amber-500/10", desc: "Effective bariatric surgery options" },
  { icon: Pill, name: "Liver Transplant", count: "50+ Hospitals", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Liver transplant procedures of varying complexity" },
  { icon: Syringe, name: "Kidney Transplant", count: "55+ Hospitals", color: "text-teal-500", bg: "bg-teal-500/10", desc: "Expert renal care and transplants" },
  { icon: Eye, name: "Ophthalmology", count: "90+ Hospitals", color: "text-green-500", bg: "bg-green-500/10", desc: "Advanced eye care and laser surgeries" },
  { icon: Smile, name: "Dental Care", count: "110+ Hospitals", color: "text-sky-500", bg: "bg-sky-500/10", desc: "Complete dental treatments and implants" },
  { icon: Activity, name: "Bone Marrow", count: "40+ Hospitals", color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Bone marrow transplant for matched & unmatched donors" },
];

const TreatmentCategories = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-badge mx-auto w-fit">
              <Sparkles className="h-4 w-4" />
              Multi-Specialty Focus
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 mt-4">
              {t('categories.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We cover all medical needs, from hair transplants to heart transplants
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <ScrollReveal key={category.name} delay={index * 60} animation="scale-in">
                <Link to={`/treatments/${category.name.toLowerCase()}`}>
                  <Card className="group overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-5 text-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl ${category.bg} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <h3 className="relative font-heading font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="relative text-xs text-muted-foreground line-clamp-2">{category.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={300}>
          <div className="text-center mt-12">
            <Link
              to="/treatments"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
            >
              View All Specialties
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TreatmentCategories;
