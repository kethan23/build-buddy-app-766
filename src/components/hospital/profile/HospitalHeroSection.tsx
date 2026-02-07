import { Building2, MapPin, Star, Calendar, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HospitalHeroSectionProps {
  hospital: any;
  onRequestConsultation: () => void;
}

const HospitalHeroSection = ({ hospital, onRequestConsultation }: HospitalHeroSectionProps) => {
  return (
    <div className="relative h-96 overflow-hidden">
      {/* Decorative gradient spheres */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      {hospital.cover_image_url ? (
        <img
          src={hospital.cover_image_url}
          alt={hospital.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center">
          <Building2 className="h-24 w-24 text-primary-foreground opacity-30" />
        </div>
      )}

      {/* Multi-layer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Hospital Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="container mx-auto flex items-end gap-6">
          {hospital.logo_url && (
            <div className="relative">
              <img
                src={hospital.logo_url}
                alt={`${hospital.name} logo`}
                className="h-24 w-24 rounded-xl bg-background/90 backdrop-blur-sm p-2 shadow-strong border border-border/20"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-background">
                <Award className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
          )}
          <div className="flex-1 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-heading font-bold text-white drop-shadow-lg">{hospital.name}</h1>
              <Badge className="bg-success/90 backdrop-blur-sm text-primary-foreground border-0 shadow-lg">
                <Award className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {hospital.city}, {hospital.country}
              </span>
              {hospital.rating > 0 && (
                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {hospital.rating.toFixed(1)}
                  <span className="text-white/70 text-sm">({hospital.total_reviews} reviews)</span>
                </span>
              )}
              {hospital.established_year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Est. {hospital.established_year}
                </span>
              )}
            </div>
          </div>
          <Button
            size="lg"
            className="btn-gradient text-white px-8 shadow-lg animate-fade-in"
            style={{ animationDelay: '0.2s' }}
            onClick={onRequestConsultation}
          >
            Request Consultation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HospitalHeroSection;
