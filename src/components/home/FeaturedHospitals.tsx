import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Award } from "lucide-react";
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
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
          className="w-full"
        >
          <CarouselContent>
            {hospitals.map((hospital) => (
              <CarouselItem key={hospital.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={hospital.cover_image_url || hospital.logo_url || "/placeholder.svg"}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                    {hospital.hospital_certifications?.[0] && (
                      <Badge className="absolute top-3 right-3 bg-success">
                        <Award className="h-3 w-3 mr-1" />
                        {hospital.hospital_certifications[0].certification_name}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-heading font-semibold text-xl mb-2">{hospital.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {hospital.city}, {hospital.state || hospital.country}
                    </div>
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                      <span className="font-medium mr-1">{hospital.rating || '0.0'}</span>
                      <span className="text-sm text-muted-foreground">
                        ({hospital.total_reviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hospital.hospital_specialties?.slice(0, 3).map((spec: any) => (
                        <Badge key={spec.specialty_name} variant="secondary">
                          {spec.specialty_name}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate(`/hospital/${hospital.id}`)}
                    >
                      {t('featured.viewProfile')}
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="text-center mt-8">
          <Button size="lg" onClick={() => navigate('/hospitals')}>
            {t('featured.viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHospitals;
