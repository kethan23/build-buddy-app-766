import { Search, MapPin, Shield, Award, CheckCircle } from "lucide-react";
import AIHospitalSearch from "./AIHospitalSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 md:py-32">
      {/* Layered premium background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="font-heading font-bold text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 text-foreground animate-fade-in leading-tight"
            style={{ animationDuration: '0.6s' }}
          >
            {t('hero.title')}
          </h1>
          
          <p 
            className="text-sm sm:text-base md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto animate-fade-in px-2"
            style={{ animationDelay: '150ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}
          >
            {t('hero.subtitle')}
          </p>
          
          <div 
            className="mb-8 sm:mb-10 animate-fade-in"
            style={{ animationDelay: '250ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}
          >
            <Button size="lg" className="btn-gradient text-white text-sm sm:text-lg px-6 sm:px-8 h-10 sm:h-12 shadow-lg" onClick={() => window.location.href = '/auth'}>
              {t('hero.getStarted')}
            </Button>
          </div>

          {/* Search Form */}
          <div 
            className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: '400ms', animationDuration: '0.7s', animationFillMode: 'backwards' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Select>
                  <SelectTrigger className="w-full bg-background/50 border-border/50 h-10 sm:h-11 text-sm">
                    <SelectValue placeholder="Select Treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="oncology">Oncology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="dental">Dental Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="City or Location" className="pl-10 bg-background/50 border-border/50 h-10 sm:h-11 text-sm" />
                </div>
              </div>
              <div>
                <Button className="w-full btn-gradient text-white h-10 sm:h-11 text-sm" size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  {t('hero.searchButton')}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-border/30">
              <div className="text-center">
                <div className="font-heading font-bold text-lg sm:text-2xl text-primary">500+</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">Verified Hospitals</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-lg sm:text-2xl text-accent">10,000+</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-lg sm:text-2xl text-success">50+</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">Specialties</div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div 
            className="flex flex-wrap justify-center items-center gap-2 sm:gap-6 mt-6 sm:mt-10 animate-fade-in"
            style={{ animationDelay: '600ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center space-x-1.5 sm:space-x-2 glass-card rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">JCI Accredited</span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2 glass-card rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">ISO Certified</span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2 glass-card rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">NABH Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
