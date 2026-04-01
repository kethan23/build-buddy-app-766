import { useState, useRef, useEffect } from "react";
import { Brain, Search, Star, MapPin, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  hospital_id: string;
  hospital_name: string;
  city: string;
  match_reason: string;
  relevant_treatments: { name: string; estimated_cost: string }[];
  rating?: number;
  total_reviews?: number;
  logo_url?: string;
  cover_image_url?: string;
}

const AIHospitalSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError("");
    setShowResults(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-hospital-search", {
        body: { query: searchQuery },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResults(data?.results || []);
    } catch (err: any) {
      console.error("AI search error:", err);
      setError("Unable to search right now. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const onInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 800);
  };

  return (
    <div ref={containerRef} className="relative max-w-3xl mx-auto mt-4 sm:mt-6">
      {/* Label */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">AI-Powered Search</span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Brain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <Input
          placeholder="Describe your condition... e.g. 'I need knee replacement surgery'"
          value={query}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-10 sm:pl-11 pr-24 h-11 sm:h-12 text-sm sm:text-base bg-background/80 border-primary/20 focus:border-primary/50 rounded-xl shadow-sm"
        />
        <Button
          size="sm"
          onClick={() => handleSearch(query)}
          disabled={isSearching || query.trim().length < 3}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-gradient text-white h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-3.5 w-3.5 mr-1" />Find</>}
        </Button>
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border/50 rounded-xl shadow-xl max-h-[60vh] overflow-y-auto">
          {isSearching && (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Finding the best hospitals for you...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-destructive">{error}</div>
          )}

          {!isSearching && !error && results.length === 0 && query.length >= 3 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No matching hospitals found. Try a different description.
            </div>
          )}

          {!isSearching && results.map((r) => (
            <div
              key={r.hospital_id}
              onClick={() => navigate(`/hospital/${r.hospital_id}`)}
              className="flex items-start gap-3 p-3 sm:p-4 hover:bg-muted/50 cursor-pointer border-b border-border/30 last:border-0 transition-colors"
            >
              {/* Hospital Image */}
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-muted">
                {r.logo_url || r.cover_image_url ? (
                  <img
                    src={r.logo_url || r.cover_image_url || ""}
                    alt={r.hospital_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                    {r.hospital_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">{r.hospital_name}</h4>
                  {r.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      {r.rating}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {r.city}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.match_reason}</p>
                {r.relevant_treatments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {r.relevant_treatments.slice(0, 3).map((t, i) => (
                      <span key={i} className="inline-flex items-center text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {t.name} • {t.estimated_cost}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ArrowRight className="shrink-0 h-4 w-4 text-muted-foreground mt-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIHospitalSearch;
