import { useState, useEffect } from "react";
import { Search, MapPin, Shield, Award, CheckCircle, Brain, ArrowRight, Sparkles, Zap, Building2, Users, Star, Stethoscope } from "lucide-react";
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
    { icon: Building2, value: stats.hospitalCount, label: "Verified Hospitals", gradient: "from-sky-400/20 to-blue-500/20", iconColor: "text-sky-400", borderColor: "border-sky-400/20" },
    { icon: Stethoscope, value: stats.doctorCount, label: "Expert Doctors", gradient: "from-emerald-400/20 to-green-500/20", iconColor: "text-emerald-400", borderColor: "border-emerald-400/20" },
    { icon: Users, value: stats.reviewCount, label: "Happy Patients", gradient: "from-amber-400/20 to-orange-500/20", iconColor: "text-amber-400", borderColor: "border-amber-400/20" },
    { icon: Sparkles, value: stats.treatmentCount, label: "Treatment Packages", gradient: "from-violet-400/20 to-purple-500/20", iconColor: "text-violet-400", borderColor: "border-violet-400/20" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* ── MAIN HERO ── */}
      <div className="relative min-h-[85vh] sm:min-h-0 flex flex-col justify-center" style={{ background: 'linear-gradient(160deg, hsl(220 45% 6%) 0%, hsl(210 40% 10%) 30%, hsl(200 35% 14%) 60%, hsl(195 30% 12%) 100%)' }}>
        {/* Ambient glow effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] rounded-full blur-[200px] opacity-40" style={{ background: 'radial-gradient(circle, hsl(193 100% 43% / 0.15), transparent 70%)' }} />
          <div className="absolute -bottom-20 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-30" style={{ background: 'radial-gradient(circle, hsl(270 70% 50% / 0.1), transparent 70%)' }} />
          <div className="absolute top-1/2 -left-20 w-[300px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, hsl(160 80% 40% / 0.15), transparent 70%)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="container mx-auto px-4 py-10 sm:py-16 md:py-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="text-center mb-5 sm:mb-6 animate-fade-in" style={{ animationDuration: '0.5s' }}>
              <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-medium text-white/60 tracking-widest uppercase">Trusted by patients worldwide</span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center mb-7 sm:mb-10">
              <h1 className="font-heading font-bold text-[26px] leading-[1.15] sm:text-4xl md:text-5xl lg:text-[3.5rem] text-white mb-3 sm:mb-5 animate-fade-in tracking-tight" style={{ animationDuration: '0.6s' }}>
                World-Class Healthcare
                <br />
                <span className="bg-gradient-to-r from-sky-300 via-primary to-emerald-300 bg-clip-text text-transparent">
                  at Affordable Prices
                </span>
              </h1>
              <p className="text-xs sm:text-base md:text-lg text-white/45 max-w-xl sm:max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '100ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}>
                Connect with India's top hospitals for quality treatments at up to <span className="text-white/70 font-semibold">70% lower costs</span>
              </p>
            </div>

            {/* Search Form Card */}
            <div className="relative animate-fade-in mb-7 sm:mb-10" style={{ animationDelay: '200ms', animationDuration: '0.7s', animationFillMode: 'backwards' }}>
              {/* Glow behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-sky-400/10 to-emerald-400/20 rounded-[20px] blur-xl opacity-50" />
              <div className="relative bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-3.5 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                    <SelectTrigger className="w-full bg-white border-0 h-11 sm:h-[52px] text-sm text-foreground shadow-md rounded-xl ring-0 focus:ring-2 focus:ring-primary/30">
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
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                    <Input
                      placeholder="City or Location"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="pl-10 bg-white border-0 h-11 sm:h-[52px] text-sm shadow-md rounded-xl ring-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>

                  <Button
                    className="w-full h-11 sm:h-[52px] rounded-xl font-semibold text-sm shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 bg-gradient-to-r from-primary via-primary to-sky-500 text-primary-foreground hover:brightness-110"
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
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 animate-fade-in" style={{ animationDelay: '400ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}>
              {statItems.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`relative group bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border ${stat.borderColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center hover:scale-[1.03] transition-all duration-300`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-1.5 sm:mb-2`}>
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                  </div>
                  <div className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-white tabular-nums">
                    {stat.value > 0 ? (
                      <>
                        {stat.value.toLocaleString()}
                        <span className="text-xs sm:text-sm font-medium text-white/30 ml-0.5">+</span>
                      </>
                    ) : "—"}
                  </div>
                  <div className="text-[9px] sm:text-[11px] text-white/40 font-medium tracking-wide uppercase mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8 animate-fade-in" style={{ animationDelay: '550ms', animationDuration: '0.6s', animationFillMode: 'backwards' }}>
              {[
                { icon: Shield, label: "JCI Accredited" },
                { icon: Award, label: "ISO Certified" },
                { icon: CheckCircle, label: "NABH Verified" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 text-white/30 text-[10px] sm:text-xs">
                  <badge.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/25" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ── AI ANALYSIS CTA ── */}
      <div
        onClick={() => navigate("/patient/ai-analysis")}
        className="relative cursor-pointer group overflow-hidden"
      >
        {/* Subtle animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.06] via-accent/[0.03] to-violet-500/[0.06]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.08] via-accent/[0.06] to-violet-500/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

        <div className="container mx-auto px-4 py-4 sm:py-5 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-background" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-semibold text-sm text-foreground">AI Medical Analysis</span>
                  <span className="bg-gradient-to-r from-primary/15 to-violet-500/15 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider border border-primary/10">BETA</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Upload reports or describe your condition — get instant AI-powered matches
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-primary-foreground font-semibold text-xs sm:text-sm shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/35 group-hover:brightness-110 transition-all duration-300">
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
