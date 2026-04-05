import { useState } from "react";
import { Search, MapPin, Shield, Award, CheckCircle, Brain, Upload, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* ── AI ANALYSIS CTA BANNER ── Clickable, navigates to /patient/ai-analysis */}
      <div
        onClick={() => navigate("/patient/ai-analysis")}
        className="relative overflow-hidden cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, hsl(210 40% 12%) 0%, hsl(200 35% 18%) 40%, hsl(195 30% 22%) 70%, hsl(210 35% 15%) 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'hsl(193 100% 43% / 0.08)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'hsl(42 69% 59% / 0.06)' }} />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-10 md:py-14 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-5 sm:mb-6">
              <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-full px-4 py-1.5 mb-3 sm:mb-4">
                <div className="relative">
                  <Brain className="h-4 w-4 text-primary" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-white/80 tracking-wide">AI-Powered Medical Analysis</span>
                <span className="bg-primary/30 text-primary-foreground text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wider">BETA</span>
              </div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-white mb-2 leading-tight">
                Find Your Best Treatment in Seconds
              </h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto">
                Upload your medical reports or describe your condition — our AI instantly matches you with the right hospitals, doctors & treatment packages.
              </p>
            </div>

            {/* Fake search bar CTA */}
            <div className="bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/20 group-hover:border-white/[0.15] transition-all duration-300">
              <div className="relative mb-3">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                <div className="w-full pl-11 sm:pl-12 pr-4 h-12 sm:h-14 text-sm sm:text-base bg-white/95 text-muted-foreground rounded-xl flex items-center shadow-lg">
                  Describe your condition... e.g. 'knee replacement', 'heart bypass for 60 yr old'
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex items-center justify-center gap-2 flex-1 h-11 sm:h-12 rounded-xl border border-white/[0.1] text-white/60 text-xs sm:text-sm">
                  <Upload className="h-4 w-4" />
                  Upload Report <span className="hidden sm:inline text-white/50">· PDF, JPG, PNG</span>
                </div>

                <div className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm sm:text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group-hover:opacity-90 transition-opacity">
                  <Zap className="h-4 w-4" />
                  Analyze & Find Care
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Micro trust indicators */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-white/50 text-[10px] sm:text-xs">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" />HIPAA Compliant</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Verified Hospitals Only</span>
              <span className="flex items-center gap-1"><Zap className="h-3 w-3" />Instant Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO CONTENT ── Below the AI bar */}
      <div className="relative py-10 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background" />
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

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

            {/* Search Form */}
            <div 
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in"
              style={{ animationDelay: '300ms', animationDuration: '0.7s', animationFillMode: 'backwards' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                    <SelectTrigger className="w-full bg-background/50 border-border/50 h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Select Treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="neurosurgery">Neurosurgery</SelectItem>
                      <SelectItem value="dental">Dental Care</SelectItem>
                      <SelectItem value="ivf">IVF & Fertility</SelectItem>
                      <SelectItem value="cosmetic">Cosmetic Surgery</SelectItem>
                      <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                      <SelectItem value="spine">Spine Surgery</SelectItem>
                      <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City or Location"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 h-10 sm:h-11 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Button
                    className="w-full btn-gradient text-white h-10 sm:h-11 text-sm"
                    size="lg"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (selectedTreatment) params.set('treatment', selectedTreatment);
                      if (locationQuery.trim()) params.set('city', locationQuery.trim());
                      navigate(`/hospitals${params.toString() ? '?' + params.toString() : ''}`);
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t('hero.searchButton')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div 
              className="flex flex-wrap justify-center items-center gap-2 sm:gap-6 mt-6 sm:mt-10 animate-fade-in"
              style={{ animationDelay: '500ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}
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
      </div>
    </section>
  );
};

export default HeroSection;
