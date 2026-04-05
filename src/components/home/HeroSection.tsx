import { useState, useEffect } from "react";
import { Search, MapPin, Shield, Award, CheckCircle, Brain, Upload, ArrowRight, Sparkles, Zap, Building2, Users, Star, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlatformStats {
  hospitalCount: number;
  doctorCount: number;
  reviewCount: number;
  treatmentCount: number;
}

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<PlatformStats>({ hospitalCount: 0, doctorCount: 0, reviewCount: 0, treatmentCount: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, hospRes, docRes, revRes, pkgRes] = await Promise.all([
        supabase.from("treatment_categories").select("id, name").eq("is_active", true).order("display_order"),
        supabase.from("hospitals").select("id", { count: "exact", head: true }).eq("is_active", true).eq("verification_status", "verified"),
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_visible", true),
        supabase.from("treatment_packages").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      setCategories(catRes.data || []);
      setStats({
        hospitalCount: hospRes.count || 0,
        doctorCount: docRes.count || 0,
        reviewCount: revRes.count || 0,
        treatmentCount: pkgRes.count || 0,
      });
    };
    fetchData();
  }, []);

  const statItems = [
    { icon: Building2, value: stats.hospitalCount, label: "Verified Hospitals", color: "text-primary" },
    { icon: Stethoscope, value: stats.doctorCount, label: "Expert Doctors", color: "text-emerald-400" },
    { icon: Star, value: stats.reviewCount, label: "Happy Patients", color: "text-amber-400" },
    { icon: Sparkles, value: stats.treatmentCount, label: "Treatment Packages", color: "text-violet-400" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* ── MAIN HERO ── Search on top */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, hsl(210 40% 8%) 0%, hsl(200 35% 14%) 40%, hsl(195 30% 18%) 70%, hsl(210 35% 10%) 100%)' }}>
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px]" style={{ background: 'hsl(193 100% 43% / 0.07)' }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'hsl(42 69% 59% / 0.05)' }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="container mx-auto px-4 pt-10 sm:pt-14 md:pt-20 pb-8 sm:pb-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Headline */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="font-heading font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4 leading-tight animate-fade-in" style={{ animationDuration: '0.6s' }}>
                World-Class Healthcare
                <span className="block bg-gradient-to-r from-primary via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  at Affordable Prices
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '150ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}>
                Connect with top hospitals in India for quality medical treatments at up to 70% lower costs
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-3 sm:p-5 shadow-2xl shadow-black/30 animate-fade-in mb-6 sm:mb-8" style={{ animationDelay: '300ms', animationDuration: '0.7s', animationFillMode: 'backwards' }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                  <SelectTrigger className="w-full bg-white/95 border-0 h-11 sm:h-12 text-sm text-foreground shadow-lg rounded-xl">
                    <SelectValue placeholder="Select Treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="neurosurgery">Neurosurgery</SelectItem>
                        <SelectItem value="dental">Dental Care</SelectItem>
                        <SelectItem value="ivf">IVF & Fertility</SelectItem>
                        <SelectItem value="cosmetic">Cosmetic Surgery</SelectItem>
                        <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="City or Location"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-10 bg-white/95 border-0 h-11 sm:h-12 text-sm shadow-lg rounded-xl"
                  />
                </div>

                <Button
                  className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
                  size="lg"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (selectedTreatment) params.set('treatment', selectedTreatment);
                    if (locationQuery.trim()) params.set('city', locationQuery.trim());
                    navigate(`/hospitals${params.toString() ? '?' + params.toString() : ''}`);
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Hospitals
                </Button>
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '500ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}>
              {statItems.map((stat) => (
                <div key={stat.label} className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-xl p-3 sm:p-4 text-center hover:bg-white/[0.08] transition-colors">
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} mx-auto mb-1.5`} />
                  <div className="font-heading font-bold text-lg sm:text-2xl text-white">
                    {stat.value > 0 ? stat.value.toLocaleString() : "—"}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/50 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5 mt-6 sm:mt-8">
              <div className="flex items-center gap-1.5 text-white/40 text-[10px] sm:text-xs">
                <Shield className="h-3 w-3" /><span>JCI Accredited</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-[10px] sm:text-xs">
                <Award className="h-3 w-3" /><span>ISO Certified</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-[10px] sm:text-xs">
                <CheckCircle className="h-3 w-3" /><span>NABH Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI ANALYSIS CTA STRIP ── Below hero, clickable */}
      <div
        onClick={() => navigate("/patient/ai-analysis")}
        className="relative cursor-pointer group bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-y border-primary/10 hover:from-primary/15 hover:via-accent/10 hover:to-primary/15 transition-all duration-300"
      >
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-background" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-sm sm:text-base text-foreground">AI Medical Analysis</span>
                  <span className="bg-primary/15 text-primary text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wider">BETA</span>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Upload reports or describe your condition — get instant treatment matches
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-xs sm:text-sm shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
              <Zap className="h-3.5 w-3.5" />
              Try AI Analysis
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
