import { useState, useRef, useCallback } from "react";
import { Search, MapPin, Shield, Award, CheckCircle, Brain, FileText, Upload, Loader2, X, Star, ArrowRight, Package, Building2, Stethoscope, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HospitalResult {
  id: string; name: string; city: string; rating: number | null; logo_url: string | null; cover_image_url: string | null; match_reason: string;
}
interface TreatmentResult {
  id: string; name: string; category: string; price: number; currency: string | null; duration_days: number | null; hospital_name: string; hospital_id: string; why_recommended: string;
}
interface DoctorResult {
  id: string; name: string; specialty: string; qualification: string | null; experience_years: number | null; photo_url: string | null; hospital_name: string; hospital_id: string; consultation_fee: number | null; why_recommended: string;
}
interface AnalysisResults {
  summary: string; hospitals: HospitalResult[]; treatments: TreatmentResult[]; doctors: DoctorResult[];
}

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        try {
          const { data, error } = await supabase.functions.invoke("extract-text", {
            body: { fileBase64: base64, fileType: file.type, fileName: file.name },
          });
          if (error) throw error;
          resolve(data?.text || "");
        } catch {
          resolve("");
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleAnalyze = async () => {
    let searchQuery = query.trim();

    if (uploadedFile) {
      setIsAnalyzing(true);
      setShowResults(true);
      setResults(null);
      const extractedText = await extractTextFromFile(uploadedFile);
      searchQuery = extractedText ? `${searchQuery} ${extractedText}`.trim() : searchQuery;
    }

    if (searchQuery.length < 3) {
      toast({ title: "Please describe your condition or upload a report", variant: "destructive" });
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    setShowResults(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-hospital-search", {
        body: { query: searchQuery },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data?.results || null);
    } catch (err) {
      console.error("AI analysis error:", err);
      setResults({ summary: "Unable to analyze right now. Please try again.", hospitals: [], treatments: [], doctors: [] });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB allowed", variant: "destructive" });
        return;
      }
      setUploadedFile(file);
    }
  };

  const hasResults = results && (results.hospitals.length > 0 || results.treatments.length > 0 || results.doctors.length > 0);

  return (
    <section className="relative overflow-hidden">
      {/* ── AI ANALYSIS BANNER ── Top of page, full-width premium gradient */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(210 40% 12%) 0%, hsl(200 35% 18%) 40%, hsl(195 30% 22%) 70%, hsl(210 35% 15%) 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'hsl(193 100% 43% / 0.08)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'hsl(42 69% 59% / 0.06)' }} />
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
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

            {/* Search Input */}
            <div className="bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/20">
              <div className="relative mb-3">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                <input
                  placeholder="Describe your condition... e.g. 'knee replacement', 'heart bypass for 60 yr old'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="w-full pl-11 sm:pl-12 pr-4 h-12 sm:h-14 text-sm sm:text-base bg-white/95 text-foreground placeholder:text-muted-foreground rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* File upload */}
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 flex-1 h-11 sm:h-12 rounded-xl border border-white/[0.1] hover:border-white/20 hover:bg-white/[0.04] transition-all text-white/60 hover:text-white/90 text-xs sm:text-sm"
                >
                  <Upload className="h-4 w-4" />
                  {uploadedFile ? (
                    <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                  ) : (
                    <>Upload Report <span className="hidden sm:inline text-white/50">· PDF, JPG, PNG</span></>
                  )}
                </button>

                {/* Analyze button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (query.trim().length < 3 && !uploadedFile)}
                  className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 font-semibold text-sm sm:text-base shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><Zap className="h-4 w-4 mr-2" />Analyze & Find Care</>
                  )}
                </Button>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-white/60">
                  <FileText className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                  <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-300 hover:text-red-200 underline underline-offset-2">Remove</button>
                </div>
              )}
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

      {/* Results Panel — below the banner */}
      {showResults && (
        <div className="bg-muted/30 border-b border-border/50">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div ref={resultsRef} className="max-w-3xl mx-auto elegant-card rounded-2xl p-4 sm:p-6 animate-fade-in text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-sm block">Analysis Results</span>
                    <span className="text-[10px] text-muted-foreground">Based on your medical information</span>
                  </div>
                </div>
                <button onClick={() => setShowResults(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {isAnalyzing && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-spin opacity-20" />
                    <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                      <Brain className="h-7 w-7 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Analyzing your condition...</p>
                    <p className="text-xs text-muted-foreground mt-1">Matching with verified hospitals, doctors & treatments</p>
                  </div>
                </div>
              )}

              {!isAnalyzing && results && (
                <div className="space-y-5">
                  {results.summary && (
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs sm:text-sm text-foreground leading-relaxed">{results.summary}</p>
                      </div>
                    </div>
                  )}

                  {results.hospitals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-heading font-semibold">Recommended Hospitals</span>
                        <span className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full">{results.hospitals.length}</span>
                      </div>
                      <div className="space-y-2">
                        {results.hospitals.map((h) => (
                          <div key={h.id} onClick={() => navigate(`/hospital/${h.id}`)} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer border border-border/40 hover:border-primary/20 transition-all hover:shadow-sm">
                            <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center ring-1 ring-border/50">
                              {h.logo_url || h.cover_image_url ? <img src={h.logo_url || h.cover_image_url || ""} alt={h.name} className="w-full h-full object-cover" /> : <span className="text-primary font-bold text-lg">{h.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">{h.name}</span>
                                {h.rating && <span className="flex items-center gap-0.5 text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md"><Star className="h-3 w-3 fill-current" />{h.rating}</span>}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="h-3 w-3" />{h.city}</div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{h.match_reason}</p>
                            </div>
                            <ArrowRight className="shrink-0 h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.treatments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-accent" />
                        <span className="text-sm font-heading font-semibold">Treatment Packages</span>
                        <span className="bg-accent/10 text-accent text-[10px] font-medium px-2 py-0.5 rounded-full">{results.treatments.length}</span>
                      </div>
                      <div className="space-y-2">
                        {results.treatments.map((pkg) => (
                          <div key={pkg.id} onClick={() => navigate(`/hospital/${pkg.hospital_id}`)} className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent/5 cursor-pointer border border-border/40 hover:border-accent/20 transition-all hover:shadow-sm">
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-sm block truncate group-hover:text-accent transition-colors">{pkg.name}</span>
                              <span className="text-xs text-muted-foreground">{pkg.hospital_name} • {pkg.category}</span>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{pkg.why_recommended}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="font-bold text-base text-primary">${pkg.price.toLocaleString()}</span>
                              {pkg.duration_days && <span className="block text-[10px] text-muted-foreground">{pkg.duration_days} days</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.doctors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="h-4 w-4 text-success" />
                        <span className="text-sm font-heading font-semibold">Recommended Doctors</span>
                        <span className="bg-success/10 text-success text-[10px] font-medium px-2 py-0.5 rounded-full">{results.doctors.length}</span>
                      </div>
                      <div className="space-y-2">
                        {results.doctors.map((d) => (
                          <div key={d.id} onClick={() => navigate(`/hospital/${d.hospital_id}`)} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-success/5 cursor-pointer border border-border/40 hover:border-success/20 transition-all hover:shadow-sm">
                            <div className="shrink-0 w-11 h-11 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-border/30">
                              {d.photo_url ? <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" /> : <span className="text-primary font-bold">{d.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm block truncate group-hover:text-success transition-colors">{d.name}</span>
                              <span className="text-xs text-muted-foreground">{d.specialty} • {d.hospital_name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                {d.experience_years && <span>{d.experience_years}yr exp</span>}
                                {d.qualification && <span>• {d.qualification}</span>}
                              </div>
                            </div>
                            {d.consultation_fee && <span className="shrink-0 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">${d.consultation_fee}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasResults && results.summary && (
                    <p className="text-sm text-muted-foreground text-center py-4">No matching results found in our network.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
