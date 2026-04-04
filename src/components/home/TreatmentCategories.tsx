import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart, Bone, Brain, Eye, Activity, Stethoscope, Baby, Smile, Sparkles, ArrowRight,
  Scissors, Scale, Pill, Syringe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  Activity, Brain, Bone, Heart, Eye, Baby, Stethoscope, Smile, Scissors, Scale, Pill, Syringe,
};

const TreatmentCategories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("treatment_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching treatment categories:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-28 sm:h-36 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Treatment categories will appear here once added by the admin.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-8 sm:mb-14">
            <div className="section-badge mx-auto w-fit text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Multi-Specialty Focus
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 mt-3 sm:mt-4">
              {t('categories.title')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2">
              We cover all medical needs, from hair transplants to heart transplants
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-5">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon_name] || Activity;
            return (
              <ScrollReveal key={category.id} delay={index * 60} animation="scale-in">
                <Link to={`/treatments/${category.name.toLowerCase()}`}>
                  <Card className="group overflow-hidden border-0 bg-card/80 backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-2.5 sm:p-5 text-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className={`relative inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${category.bg_class} mb-1.5 sm:mb-3 transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${category.color_class}`} />
                      </div>
                      <h3 className="relative font-heading font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-1 group-hover:text-primary transition-colors leading-tight">
                        {category.name}
                      </h3>
                      <p className="relative text-[9px] sm:text-xs text-muted-foreground line-clamp-2 hidden sm:block">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={300}>
          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/treatments"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group text-sm sm:text-base"
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
