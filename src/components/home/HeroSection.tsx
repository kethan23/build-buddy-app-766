import { useState, useRef, useCallback } from "react";
import { Search, MapPin, Shield, Award, CheckCircle, Brain, FileText, Upload, Loader2, X, Star, ArrowRight, Package, Building2, Stethoscope, Sparkles } from "lucide-react";
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
    <section className="relative overflow-hidden py-10 sm:py-16 md:py-24">
      {/* Background */}
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

          {/* AI Analysis Card - Primary CTA */}
          <div 
            className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in mb-6"
            style={{ animationDelay: '250ms', animationDuration: '0.7s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-heading font-semibold text-sm sm:text-base text-foreground">AI-Powered Medical Analysis</span>
              <span className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full">NEW</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Describe your condition or upload medical reports — our AI finds the best hospitals, treatments & doctors for you.
            </p>

            {/* Input area */}
            <div className="space-y-3">
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="e.g. 'I have knee pain and need surgery' or 'heart bypass for 60 year old'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="pl-10 pr-4 h-11 sm:h-12 text-sm sm:text-base bg-background/50 border-border/50 rounded-xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {/* File upload */}
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-10 sm:h-11 text-xs sm:text-sm border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5"
                >
                  <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                  {uploadedFile ? (
                    <span className="truncate max-w-[180px]">{uploadedFile.name}</span>
                  ) : (
                    "Upload Medical Report (PDF/Image)"
                  )}
                </Button>

                {/* Analyze button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (query.trim().length < 3 && !uploadedFile)}
                  className="flex-1 sm:flex-none btn-gradient text-white h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><Brain className="h-4 w-4 mr-2" />Analyze & Find Care</>
                  )}
                </Button>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{uploadedFile.name}</span>
                  <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-destructive hover:underline">Remove</button>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          {showResults && (
            <div ref={resultsRef} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in text-left mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Analysis Results</span>
                </div>
                <button onClick={() => setShowResults(false)} className="p-1 rounded-full hover:bg-muted">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {isAnalyzing && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-spin opacity-20" />
                    <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                      <Brain className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Analyzing your condition & finding best matches...</p>
                </div>
              )}

              {!isAnalyzing && results && (
                <div className="space-y-4">
                  {results.summary && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">{results.summary}</p>
                    </div>
                  )}

                  {results.hospitals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold">Recommended Hospitals</span>
                      </div>
                      <div className="space-y-2">
                        {results.hospitals.map((h) => (
                          <div key={h.id} onClick={() => navigate(`/hospital/${h.id}`)} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer border border-border/30 transition-colors">
                            <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              {h.logo_url || h.cover_image_url ? <img src={h.logo_url || h.cover_image_url || ""} alt={h.name} className="w-full h-full object-cover" /> : <span className="text-primary font-bold">{h.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{h.name}</span>
                                {h.rating && <span className="flex items-center gap-0.5 text-xs text-amber-500"><Star className="h-3 w-3 fill-current" />{h.rating}</span>}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{h.city}</div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{h.match_reason}</p>
                            </div>
                            <ArrowRight className="shrink-0 h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.treatments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package className="h-3.5 w-3.5 text-accent" />
                        <span className="text-xs font-semibold">Treatment Packages</span>
                      </div>
                      <div className="space-y-2">
                        {results.treatments.map((pkg) => (
                          <div key={pkg.id} onClick={() => navigate(`/hospital/${pkg.hospital_id}`)} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer border border-border/30 transition-colors">
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-sm block truncate">{pkg.name}</span>
                              <span className="text-xs text-muted-foreground">{pkg.hospital_name} • {pkg.category}</span>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{pkg.why_recommended}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="font-bold text-sm text-primary">${pkg.price.toLocaleString()}</span>
                              {pkg.duration_days && <span className="block text-[10px] text-muted-foreground">{pkg.duration_days} days</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.doctors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Stethoscope className="h-3.5 w-3.5 text-success" />
                        <span className="text-xs font-semibold">Recommended Doctors</span>
                      </div>
                      <div className="space-y-2">
                        {results.doctors.map((d) => (
                          <div key={d.id} onClick={() => navigate(`/hospital/${d.hospital_id}`)} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer border border-border/30 transition-colors">
                            <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                              {d.photo_url ? <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" /> : <span className="text-primary font-bold text-sm">{d.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm block truncate">{d.name}</span>
                              <span className="text-xs text-muted-foreground">{d.specialty} • {d.hospital_name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                {d.experience_years && <span>{d.experience_years}yr exp</span>}
                                {d.qualification && <span>• {d.qualification}</span>}
                              </div>
                            </div>
                            {d.consultation_fee && <span className="shrink-0 text-xs font-medium text-primary">${d.consultation_fee}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasResults && results.summary && (
                    <p className="text-sm text-muted-foreground text-center py-2">No matching results found in our network.</p>
                  )}
                </div>
              )}
            </div>
          )}

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
