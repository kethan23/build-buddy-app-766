import { Search, MapPin } from "lucide-react";
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
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="mb-10">
            <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = '/auth'}>
              {t('hero.getStarted')}
            </Button>
          </div>

          {/* Search Form */}
          <div className="bg-card rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Select>
                  <SelectTrigger className="w-full">
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
              <div className="md:col-span-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="City or Location" className="pl-10" />
                </div>
              </div>
              <div className="md:col-span-1">
                <Button className="w-full h-full" size="lg">
                  <Search className="h-5 w-5 mr-2" />
                  {t('hero.searchButton')}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Verified Hospitals</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-accent">10,000+</div>
                <div className="text-sm text-muted-foreground">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-2xl text-success">50+</div>
                <div className="text-sm text-muted-foreground">Specialties</div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-10">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-success"></div>
              <span className="text-sm text-muted-foreground">JCI Accredited</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-success"></div>
              <span className="text-sm text-muted-foreground">ISO Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-success"></div>
              <span className="text-sm text-muted-foreground">NABH Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
