import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingDown, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Estimate {
  treatment_key: string;
  treatment_name: string;
  india_avg_usd: number;
  us_avg_usd: number;
  uk_avg_usd: number | null;
  uae_avg_usd: number | null;
}

const ORIGIN_KEYS = [
  { key: "us_avg_usd", label: "United States", flag: "🇺🇸" },
  { key: "uk_avg_usd", label: "United Kingdom", flag: "🇬🇧" },
  { key: "uae_avg_usd", label: "United Arab Emirates", flag: "🇦🇪" },
] as const;

export const CostEstimator = () => {
  const { format } = useCurrency();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [treatment, setTreatment] = useState<string>("");
  const [origin, setOrigin] = useState<string>("us_avg_usd");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("treatment_cost_estimates")
        .select("treatment_key, treatment_name, india_avg_usd, us_avg_usd, uk_avg_usd, uae_avg_usd")
        .order("treatment_name");
      if (data) {
        setEstimates(data as Estimate[]);
        if (data[0]) setTreatment(data[0].treatment_key);
      }
    })();
  }, []);

  const selected = estimates.find((e) => e.treatment_key === treatment);
  const originPrice = selected ? (selected[origin as keyof Estimate] as number | null) : null;
  const indiaPrice = selected?.india_avg_usd ?? null;
  const savings =
    originPrice && indiaPrice ? Math.round(((originPrice - indiaPrice) / originPrice) * 100) : null;

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-3">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Cost estimator
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              See How Much You Could Save in India
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl mx-auto">
              Average treatment prices — verified hospital partners, no obligations.
            </p>
          </div>

          <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 sm:p-8 shadow-xl">
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Treatment</label>
                <Select value={treatment} onValueChange={setTreatment}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {estimates.map((e) => (
                      <SelectItem key={e.treatment_key} value={e.treatment_key}>
                        {e.treatment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Compare from</label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORIGIN_KEYS.map((o) => (
                      <SelectItem key={o.key} value={o.key}>
                        <span className="mr-2">{o.flag}</span>{o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selected && originPrice && indiaPrice ? (
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">In your country</div>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-foreground line-through decoration-rose-400/60">
                    {format(originPrice)}
                  </div>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                  <div className="text-[10px] uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> In India
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-primary">
                    {format(indiaPrice)}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">You save</div>
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-emerald-600 dark:text-emerald-400">
                    {savings}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ≈ {format(originPrice - indiaPrice)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                {estimates.length === 0 ? "Loading cost data…" : "Comparison not available for this combination."}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-5 text-center">
              Estimates only — your final quote depends on hospital, complexity and recovery needs.
            </p>

            <div className="mt-5 flex justify-center">
              <Button asChild className="gap-2 bg-gradient-to-r from-sky-600 to-emerald-600 hover:opacity-90 text-white">
                <Link to="/cost-estimator">
                  Try the Smart Cost Estimator <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CostEstimator;
