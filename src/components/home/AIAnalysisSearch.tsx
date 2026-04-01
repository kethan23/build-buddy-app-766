import { useState, useRef, useEffect } from "react";
import { Brain, Search, Star, MapPin, ArrowRight, Loader2, Sparkles, Stethoscope, Package, Building2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface HospitalResult {
  id: string;
  name: string;
  city: string;
  rating: number | null;
  total_reviews: number | null;
  logo_url: string | null;
  cover_image_url: string | null;
  match_reason: string;
}

interface TreatmentResult {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string | null;
  duration_days: number | null;
  hospital_name: string;
  hospital_id: string;
  why_recommended: string;
}

interface DoctorResult {
  id: string;
  name: string;
  specialty: string;
  qualification: string | null;
  experience_years: number | null;
  photo_url: string | null;
  hospital_name: string;
  hospital_id: string;
  consultation_fee: number | null;
  why_recommended: string;
}

interface AnalysisResults {
  summary: string;
  hospitals: HospitalResult[];
  treatments: TreatmentResult[];
  doctors: DoctorResult[];
}

const AIAnalysisSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    setIsSearching(true);
    setShowResults(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-hospital-search", {
        body: { query },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults(data?.results || null);
    } catch (err) {
      console.error("AI analysis error:", err);
      setResults({ summary: "Unable to analyze right now. Please try again.", hospitals: [], treatments: [], doctors: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const hasResults = results && (results.hospitals.length > 0 || results.treatments.length > 0 || results.doctors.length > 0);

  return (
    <div ref={containerRef} className="relative max-w-3xl mx-auto mt-4 sm:mt-6 animate-fade-in" style={{ animationDelay: "500ms", animationFillMode: "backwards" }}>
      {/* Label */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">AI Medical Analysis</span>
        <span className="text-[10px] text-muted-foreground ml-1">— Describe your condition to find the right care</span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Brain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <Input
          placeholder="e.g. 'I have knee pain and need surgery' or 'heart bypass for 60 year old'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results && setShowResults(true)}
          className="pl-10 sm:pl-11 pr-28 h-11 sm:h-12 text-sm sm:text-base bg-background/80 border-primary/20 focus:border-primary/50 rounded-xl shadow-sm"
        />
        <Button
          size="sm"
          onClick={handleSearch}
          disabled={isSearching || query.trim().length < 3}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-gradient text-white h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-3.5 w-3.5 mr-1" />Analyze</>}
        </Button>
      </div>

      {/* Results Panel */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border/50 rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto">
          {/* Close button */}
          <button onClick={() => setShowResults(false)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted z-10">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {isSearching && (
            <div className="flex flex-col items-center gap-3 p-8">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-spin opacity-20" />
                <div className="absolute inset-1.5 rounded-full bg-background flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Analyzing your condition & finding best matches...</p>
            </div>
          )}

          {!isSearching && results && (
            <div className="p-3 sm:p-4 space-y-4">
              {/* AI Summary */}
              {results.summary && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">AI Analysis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">{results.summary}</p>
                </div>
              )}

              {/* Hospitals */}
              {results.hospitals.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Recommended Hospitals</span>
                  </div>
                  <div className="space-y-2">
                    {results.hospitals.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => navigate(`/hospital/${h.id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer border border-border/30 transition-colors"
                      >
                        <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted">
                          {h.logo_url || h.cover_image_url ? (
                            <img src={h.logo_url || h.cover_image_url || ""} alt={h.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold">{h.name.charAt(0)}</div>
                          )}
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

              {/* Treatment Packages */}
              {results.treatments.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs font-semibold text-foreground">Treatment Packages</span>
                  </div>
                  <div className="space-y-2">
                    {results.treatments.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/hospital/${t.hospital_id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer border border-border/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-sm block truncate">{t.name}</span>
                          <span className="text-xs text-muted-foreground">{t.hospital_name} • {t.category}</span>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.why_recommended}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="font-bold text-sm text-primary">${t.price.toLocaleString()}</span>
                          {t.duration_days && <span className="block text-[10px] text-muted-foreground">{t.duration_days} days</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctors */}
              {results.doctors.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Stethoscope className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs font-semibold text-foreground">Recommended Doctors</span>
                  </div>
                  <div className="space-y-2">
                    {results.doctors.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => navigate(`/hospital/${d.hospital_id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer border border-border/30 transition-colors"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted">
                          {d.photo_url ? (
                            <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">{d.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm block truncate">{d.name}</span>
                          <span className="text-xs text-muted-foreground">{d.specialty} • {d.hospital_name}</span>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            {d.experience_years && <span>{d.experience_years}yr exp</span>}
                            {d.qualification && <span>• {d.qualification}</span>}
                          </div>
                        </div>
                        {d.consultation_fee && (
                          <span className="shrink-0 text-xs font-medium text-primary">${d.consultation_fee}</span>
                        )}
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
    </div>
  );
};

export default AIAnalysisSearch;
