import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
 import { Star, MapPin, Award, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
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
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hospitals.length === 0) {
    return null;
  }

  return (
     <section className="py-20 relative overflow-hidden">
       {/* Premium background decoration */}
       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
       
      <div className="container mx-auto px-4">
         <div className="text-center mb-14">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
             <Sparkles className="h-4 w-4" />
             Top Rated Hospitals
           </div>
           <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            {t('featured.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
           className="w-full px-4"
        >
           <CarouselContent className="-ml-3">
            {hospitals.map((hospital) => (
               <CarouselItem key={hospital.id} className="pl-3 md:basis-1/2 lg:basis-1/4">
                 <Card className="group overflow-hidden premium-card h-full border-0 bg-card/80 backdrop-blur-sm">
                   <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={hospital.cover_image_url || hospital.logo_url || "/placeholder.svg"}
                      alt={hospital.name}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                     {/* Gradient overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {hospital.hospital_certifications?.[0] && (
                       <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs shadow-lg">
                         <Award className="h-3 w-3 mr-1" />
                        {hospital.hospital_certifications[0].certification_name}
                      </Badge>
                    )}
                     {/* Rating badge overlay */}
                     <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                       <Star className="h-3 w-3 fill-warning text-warning" />
                       <span className="text-white text-xs font-medium">{hospital.rating || '0.0'}</span>
                     </div>
                  </div>
                   <CardContent className="p-4">
                     <h3 className="font-heading font-semibold text-base mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                       {hospital.name}
                     </h3>
                     <div className="flex items-center text-xs text-muted-foreground mb-2">
                       <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                       <span className="truncate">{hospital.city}, {hospital.country}</span>
                    </div>
                     <div className="flex flex-wrap gap-1 mb-3">
                       {hospital.hospital_specialties?.slice(0, 2).map((spec: any) => (
                         <Badge key={spec.specialty_name} variant="secondary" className="text-xs px-2 py-0.5">
                          {spec.specialty_name}
                        </Badge>
                      ))}
                       {hospital.hospital_specialties?.length > 2 && (
                         <Badge variant="outline" className="text-xs px-2 py-0.5">
                           +{hospital.hospital_specialties.length - 2}
                         </Badge>
                       )}
                    </div>
                    <Button 
                       className="w-full h-8 text-xs group/btn" 
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

         <div className="text-center mt-10">
           <Button 
             size="lg" 
             className="btn-gradient text-white px-8"
             onClick={() => navigate('/hospitals')}
           >
            {t('featured.viewAll')}
             <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHospitals;
