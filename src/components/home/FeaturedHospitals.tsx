import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Award, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const FeaturedHospitals = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospitals')
        .select(`
          *,
          hospital_specialties(specialty_name),
          hospital_certifications(certification_name)
        `)
        .eq('verification_status', 'verified')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mx-auto mb-4" />
            <Skeleton className="h-5 sm:h-6 w-64 sm:w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardContent className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                  <Skeleton className="h-5 sm:h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hospitals.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-8 sm:mb-14">
            <div className="section-badge mx-auto w-fit text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Top Rated Hospitals
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 mt-3 sm:mt-4">
              {t('featured.title')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2">
              {t('featured.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Carousel opts={{ align: "start", loop: true }} className="w-full px-1 sm:px-4">
            <CarouselContent className="-ml-2 sm:-ml-3">
              {hospitals.map((hospital) => (
                <CarouselItem key={hospital.id} className="pl-2 sm:pl-3 basis-[70%] sm:basis-1/2 lg:basis-1/4">
                  <Card className="group overflow-hidden premium-card h-full border-0 bg-card/80 backdrop-blur-sm">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      <img
                        src={hospital.cover_image_url || hospital.logo_url || "/placeholder.svg"}
                        alt={hospital.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {hospital.hospital_certifications?.[0] && (
                        <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] sm:text-xs shadow-lg px-1.5 sm:px-2">
                          <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">{hospital.hospital_certifications[0].certification_name}</span>
                          <span className="sm:hidden">{hospital.hospital_certifications[0].certification_name.slice(0, 6)}</span>
                        </Badge>
                      )}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-warning text-warning" />
                        <span className="text-white text-[10px] sm:text-xs font-medium">{hospital.rating || '0.0'}</span>
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-heading font-semibold text-xs sm:text-base mb-1 sm:mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                        {hospital.name}
                      </h3>
                      <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{hospital.city}, {hospital.country}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                        {hospital.hospital_specialties?.slice(0, 2).map((spec: any) => (
                          <Badge key={spec.specialty_name} variant="secondary" className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5">
                            {spec.specialty_name}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        className="w-full h-7 sm:h-8 text-[10px] sm:text-xs group/btn"
                        variant="ghost"
                        onClick={() => navigate(`/hospital/${hospital.id}`)}
                      >
                        {t('featured.viewProfile')}
                        <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-2 h-10 w-10 border-0 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background" />
            <CarouselNext className="hidden md:flex -right-2 h-10 w-10 border-0 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background" />
          </Carousel>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="text-center mt-8 sm:mt-10">
            <Button
              size="lg"
              className="btn-gradient text-white px-6 sm:px-8 text-sm sm:text-base h-10 sm:h-12"
              onClick={() => navigate('/hospitals')}
            >
              {t('featured.viewAll')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FeaturedHospitals;
