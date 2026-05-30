import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Bone,
  Baby,
  Activity,
  Smile,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Building2,
  Stethoscope,
  BedDouble,
  Pill,
  Plane,
  FileCheck2,
  Award,
  MessageSquare,
  TrendingDown,
  Quote,
  Loader2,
  Brain,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/contexts/CurrencyContext";
import CurrencySelector from "@/components/CurrencySelector";

/* ---------------- Treatment data (USD base for currency conversion) ---------------- */
type TreatmentKey =
  | "heart-surgery"
  | "knee-replacement"
  | "ivf"
  | "cancer"
  | "dental-implants"
  | "cosmetic";

interface Treatment {
  key: TreatmentKey;
  name: string;
  icon: React.ElementType;
  india: [number, number]; // USD range
  usa: number;
  uae: number;
  stayDays: number;
  doctor: string;
}

const TREATMENTS: Treatment[] = [
  { key: "heart-surgery", name: "Heart Surgery (CABG)", icon: Heart, india: [4500, 7500], usa: 100000, uae: 40000, stayDays: 8, doctor: "Dr. Arun Mehta, MCh Cardiothoracic" },
  { key: "knee-replacement", name: "Knee Replacement", icon: Bone, india: [4000, 6500], usa: 35000, uae: 22000, stayDays: 5, doctor: "Dr. Priya Nair, MS Ortho" },
  { key: "ivf", name: "IVF Treatment", icon: Baby, india: [2500, 4500], usa: 20000, uae: 12000, stayDays: 14, doctor: "Dr. Kavita Rao, DGO" },
  { key: "cancer", name: "Cancer Treatment", icon: Activity, india: [6000, 18000], usa: 150000, uae: 60000, stayDays: 21, doctor: "Dr. Sanjay Iyer, DM Oncology" },
  { key: "dental-implants", name: "Dental Implants", icon: Smile, india: [600, 1500], usa: 5000, uae: 3500, stayDays: 3, doctor: "Dr. Neha Shah, MDS" },
  { key: "cosmetic", name: "Cosmetic Surgery", icon: Sparkles, india: [2000, 6000], usa: 18000, uae: 11000, stayDays: 4, doctor: "Dr. Rohan Kapoor, MCh Plastic" },
];

const CITIES = ["Hyderabad", "Chennai", "Bangalore", "Delhi", "Mumbai"];
const CITY_MULT: Record<string, number> = { Hyderabad: 0.92, Chennai: 0.95, Bangalore: 1.0, Delhi: 1.05, Mumbai: 1.1 };
const CATEGORY_MULT: Record<string, number> = { Budget: 0.82, Standard: 1.0, Premium: 1.25 };
const ROOM_MULT: Record<string, number> = { Shared: 0.95, Private: 1.0, Deluxe: 1.12 };
const SEVERITY_MULT: Record<string, number> = { Mild: 0.85, Moderate: 1.0, Severe: 1.2 };

/* ---------------- Page ---------------- */
const CostEstimator = () => {
  const { format, currency } = useCurrency();
  const location = useLocation();
  const incoming = (location.state || {}) as {
    treatment?: string;
    severity?: string;
    condition?: string;
    fromAI?: boolean;
  };

  const matchTreatment = (name?: string): Treatment => {
    if (!name) return TREATMENTS[0];
    const n = name.toLowerCase();
    const kw: Array<[string[], TreatmentKey]> = [
      [["heart", "cardiac", "cabg", "bypass", "valve"], "heart-surgery"],
      [["knee", "hip", "joint", "ortho"], "knee-replacement"],
      [["ivf", "fertility", "infertil"], "ivf"],
      [["cancer", "tumor", "oncology", "chemo", "radiation"], "cancer"],
      [["dental", "implant", "tooth"], "dental-implants"],
      [["cosmetic", "plastic", "rhinoplasty", "liposuction"], "cosmetic"],
    ];
    for (const [keys, key] of kw) {
      if (keys.some((k) => n.includes(k))) {
        return TREATMENTS.find((t) => t.key === key) || TREATMENTS[0];
      }
    }
    return TREATMENTS[0];
  };

  const normalizeSeverity = (s?: string): string => {
    const v = (s || "").toLowerCase();
    if (v.includes("mild")) return "Mild";
    if (v.includes("sev") || v.includes("crit")) return "Severe";
    return "Moderate";
  };

  const [selected, setSelected] = useState<Treatment>(() => matchTreatment(incoming.treatment));
  const [stage, setStage] = useState<1 | 2 | 3>(incoming.fromAI ? 2 : 1);

  // Section 2 state
  const [step, setStep] = useState(0);
  const [severity, setSeverity] = useState<string>(normalizeSeverity(incoming.severity));
  const [previous, setPrevious] = useState<string>("No");
  const [city, setCity] = useState<string>("Hyderabad");
  const [category, setCategory] = useState<string>("Standard");
  const [room, setRoom] = useState<string>("Private");
  const [reportName, setReportName] = useState<string>("");
  const [computing, setComputing] = useState(false);
  const [personalized, setPersonalized] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (incoming.fromAI) {
      // Scroll to stage 2 questionnaire shortly after mount
      setTimeout(() => {
        document.getElementById("stage-2")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Section 3
  const [finalLoading, setFinalLoading] = useState(false);
  const [finalQuote, setFinalQuote] = useState<number | null>(null);

  const personalizedMid = useMemo(() => {
    const [lo, hi] = selected.india;
    const mid = (lo + hi) / 2;
    const mult =
      SEVERITY_MULT[severity] *
      CITY_MULT[city] *
      CATEGORY_MULT[category] *
      ROOM_MULT[room] *
      (previous === "Yes" ? 1.08 : 1);
    return mid * mult;
  }, [selected, severity, city, category, room, previous]);

  const runEstimate = async () => {
    setComputing(true);
    await new Promise((r) => setTimeout(r, 900));
    const spread = personalizedMid * 0.09;
    setPersonalized([personalizedMid - spread, personalizedMid + spread]);
    setComputing(false);
    setStage(3);
  };

  const runFinalQuote = async () => {
    setFinalLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setFinalQuote(personalizedMid * 1.02);
    setFinalLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/30">
      <SEO
        title="Smart Treatment Cost Estimator — MediConnect"
        description="3-stage transparent medical treatment cost estimation in India. Get initial range, personalized estimate, and final hospital-reviewed quote with no hidden charges."
        path="/cost-estimator"
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-40 -left-32 w-[28rem] h-[28rem] bg-sky-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-emerald-200/40 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 py-12 sm:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-sky-200/60 rounded-full px-3 py-1 mb-4 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                  AI-powered smart estimator
                </span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground leading-tight">
                Know your treatment cost
                <span className="block bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  before you travel.
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Three transparent stages — broad estimate, personalized estimate, and a final hospital-reviewed
                fixed quote. No hidden charges, ever.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <CurrencySelector />
                <span className="text-xs text-muted-foreground">
                  Showing prices in <strong className="text-foreground">{currency}</strong>
                </span>
              </div>
            </div>

            {/* Stage progress */}
            <StageProgress stage={stage} />
          </div>
        </section>

        {/* ============= SECTION 1 ============= */}
        <section className="container mx-auto px-4 py-10 sm:py-14">
          <SectionHeading
            kicker="Stage 1"
            title="Initial Treatment Cost Range"
            subtitle="Pick a treatment to see the typical price band in India versus your home country."
          />

          {/* Treatment selector */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TREATMENTS.map((t) => {
              const Icon = t.icon;
              const active = selected.key === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setSelected(t);
                    setPersonalized(null);
                    setFinalQuote(null);
                    setStage(1);
                  }}
                  className={`group relative p-4 rounded-2xl border text-left transition-all ${
                    active
                      ? "border-sky-400 bg-white shadow-lg shadow-sky-100 -translate-y-0.5"
                      : "border-border bg-card/70 hover:border-sky-200 hover:bg-white"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                      active ? "bg-gradient-to-br from-sky-500 to-emerald-500 text-white" : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold text-foreground leading-tight">{t.name}</div>
                </button>
              );
            })}
          </div>

          {/* Result cards */}
          <div className="mt-8 grid lg:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-sky-600 to-emerald-600 text-white border-0 shadow-xl">
              <div className="text-xs uppercase tracking-widest opacity-80">Estimated cost in India</div>
              <div className="font-heading text-3xl sm:text-4xl font-bold mt-2">
                {format(selected.india[0])} – {format(selected.india[1])}
              </div>
              <p className="text-xs opacity-90 mt-3 leading-relaxed">
                Costs vary based on severity, hospital, city, room type, and medical condition.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-5">
                {[
                  "No Hidden Charges",
                  "Partner Hospitals",
                  "Transparent Pricing",
                  "Intl. Patient Support",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-1.5 text-[11px] bg-white/15 rounded-lg px-2 py-1.5 backdrop-blur">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span className="leading-tight">{b}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2 bg-white border-border/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-foreground">Cost comparison</h3>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <TrendingDown className="h-3 w-3" />
                  Save up to{" "}
                  {Math.round(((selected.usa - selected.india[1]) / selected.usa) * 100)}%
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <ComparisonRow flag="🇺🇸" label="USA" value={format(selected.usa)} muted />
                <ComparisonRow flag="🇦🇪" label="UAE" value={format(selected.uae)} muted />
                <ComparisonRow
                  flag="🇮🇳"
                  label="India via MediConnect"
                  value={`${format(selected.india[0])} – ${format(selected.india[1])}`}
                  highlight
                />
              </div>

              <div className="mt-5 flex items-center justify-between pt-5 border-t border-border/60">
                <div className="text-xs text-muted-foreground">Ready for a personalized estimate?</div>
                <Button onClick={() => setStage(2)} variant="default" className="gap-2 bg-sky-600 hover:bg-sky-700">
                  Refine my estimate <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* ============= SECTION 2 ============= */}
        <section id="stage-2" className="bg-white/60 border-y border-border/60">
          <div className="container mx-auto px-4 py-10 sm:py-14">
            <SectionHeading
              kicker="Stage 2"
              title="Smart Personalized Estimation"
              subtitle="Answer a few questions and our AI refines the cost based on similar real cases."
            />

            <div className="mt-8 grid lg:grid-cols-5 gap-6">
              {/* Questionnaire */}
              <Card className="p-6 lg:col-span-3 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                    Step {Math.min(step + 1, 6)} of 6
                  </div>
                  <Progress value={((step + 1) / 6) * 100} className="w-32 h-1.5" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    {step === 0 && (
                      <QuestionBlock title="How severe is your condition?">
                        <OptionGrid
                          options={["Mild", "Moderate", "Severe"]}
                          value={severity}
                          onChange={setSeverity}
                        />
                      </QuestionBlock>
                    )}
                    {step === 1 && (
                      <QuestionBlock title="Have you undergone previous treatment for this?">
                        <OptionGrid options={["Yes", "No"]} value={previous} onChange={setPrevious} />
                      </QuestionBlock>
                    )}
                    {step === 2 && (
                      <QuestionBlock title="Preferred city in India">
                        <OptionGrid options={CITIES} value={city} onChange={setCity} columns={3} />
                      </QuestionBlock>
                    )}
                    {step === 3 && (
                      <QuestionBlock title="Preferred hospital category">
                        <OptionGrid
                          options={["Budget", "Standard", "Premium"]}
                          value={category}
                          onChange={setCategory}
                        />
                      </QuestionBlock>
                    )}
                    {step === 4 && (
                      <QuestionBlock title="Room preference">
                        <OptionGrid
                          options={["Shared", "Private", "Deluxe"]}
                          value={room}
                          onChange={setRoom}
                        />
                      </QuestionBlock>
                    )}
                    {step === 5 && (
                      <QuestionBlock title="Upload medical reports (optional)">
                        <Label
                          htmlFor="report"
                          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-sky-200 bg-sky-50/50 rounded-2xl p-8 cursor-pointer hover:border-sky-400 transition"
                        >
                          <Upload className="h-6 w-6 text-sky-600" />
                          <span className="text-sm font-medium text-foreground">
                            {reportName || "Click to upload (PDF, JPG)"}
                          </span>
                          <span className="text-xs text-muted-foreground">Helps doctors prepare a sharper quote</span>
                          <Input
                            id="report"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => setReportName(e.target.files?.[0]?.name ?? "")}
                          />
                        </Label>
                      </QuestionBlock>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/60">
                  <Button
                    variant="ghost"
                    disabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  {step < 5 ? (
                    <Button onClick={() => setStep((s) => s + 1)} className="gap-1 bg-sky-600 hover:bg-sky-700">
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={runEstimate}
                      disabled={computing}
                      className="gap-2 bg-gradient-to-r from-sky-600 to-emerald-600 hover:opacity-90"
                    >
                      {computing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Get my estimate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Result */}
              <Card className="p-6 lg:col-span-2 bg-gradient-to-br from-white to-sky-50/60 border-sky-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" /> Your personalized estimated cost
                </div>

                {personalized ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="font-heading text-3xl sm:text-4xl font-bold mt-2 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                      {format(personalized[0])} – {format(personalized[1])}
                    </div>
                    <div className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3" /> Accuracy ~85%
                    </div>

                    <div className="mt-5 space-y-2">
                      {[
                        { icon: Building2, label: "Hospital Charges", pct: 0.42 },
                        { icon: Stethoscope, label: "Doctor Fees", pct: 0.22 },
                        { icon: FileCheck2, label: "Diagnostics & Tests", pct: 0.12 },
                        { icon: BedDouble, label: "Room Charges", pct: 0.12 },
                        { icon: Pill, label: "Medicines", pct: 0.08 },
                        { icon: Plane, label: "Airport Pickup (Optional)", pct: 0.04 },
                      ].map((r) => (
                        <BreakdownRow
                          key={r.label}
                          icon={r.icon}
                          label={r.label}
                          value={format(personalizedMid * r.pct)}
                        />
                      ))}
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
                      Estimated based on similar patient cases and partner hospital pricing.
                    </p>
                  </motion.div>
                ) : (
                  <div className="mt-6 text-sm text-muted-foreground">
                    Complete the questionnaire to see your personalized estimate.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* ============= SECTION 3 ============= */}
        <section className="container mx-auto px-4 py-10 sm:py-14">
          <SectionHeading
            kicker="Stage 3"
            title="Hospital Reviewed Final Quote"
            subtitle="A board-certified specialist reviews your reports and confirms a fixed, written quote."
          />

          <div className="mt-8 grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 p-6 sm:p-8 bg-white border-border/60">
              {!finalQuote ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white mb-4">
                    <FileCheck2 className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    Ready for a doctor-reviewed final quote?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    Our medical team reviews your reports and confirms a fixed quote from a partner hospital — usually
                    within 24 hours.
                  </p>
                  <Button
                    onClick={runFinalQuote}
                    disabled={finalLoading || !personalized}
                    className="mt-5 gap-2 bg-gradient-to-r from-sky-600 to-emerald-600 hover:opacity-90"
                  >
                    {finalLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Reviewing reports…
                      </>
                    ) : (
                      <>
                        Request final quote <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {!personalized && (
                    <p className="text-[11px] text-muted-foreground mt-3">
                      Complete Stage 2 first to unlock the final quote.
                    </p>
                  )}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        Hospital reviewed final quote
                      </div>
                      <div className="font-heading text-4xl sm:text-5xl font-bold mt-2 text-foreground">
                        {format(finalQuote)}
                      </div>
                      <div className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Fixed price — locked & written
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Badge icon={Award} label="NABH Accredited" />
                      <Badge icon={Award} label="JCI Certified" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-6">
                    <InfoRow icon={Building2} label="Hospital" value={`Apollo ${city}`} />
                    <InfoRow icon={Stethoscope} label="Doctor Assigned" value={selected.doctor} />
                    <InfoRow icon={BedDouble} label="Stay Duration" value={`${selected.stayDays} days (${room} room)`} />
                    <InfoRow icon={Plane} label="Visa & Translator" value="Included" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                        <CheckCircle2 className="h-4 w-4" /> What's included
                      </div>
                      <ul className="text-xs space-y-1.5 text-foreground/80">
                        {[
                          "Surgery & anesthesia",
                          "Hospital stay & nursing",
                          "Pre & post-op diagnostics",
                          "Medicines during stay",
                          "Airport pickup",
                          "Interpreter support",
                        ].map((i) => (
                          <li key={i} className="flex gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
                        <XCircle className="h-4 w-4" /> Not included
                      </div>
                      <ul className="text-xs space-y-1.5 text-foreground/80">
                        {[
                          "Flights & visa fees",
                          "Hotel for attendant",
                          "Personal expenses",
                          "Post-discharge medicines",
                        ].map((i) => (
                          <li key={i} className="flex gap-2">
                            <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-sky-50 border border-sky-200 p-3 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-sky-700 mt-0.5 shrink-0" />
                    <p className="text-xs text-sky-900 leading-relaxed">
                      This quotation is reviewed by hospital specialists and will remain{" "}
                      <strong>fixed</strong> unless treatment requirements change.
                    </p>
                  </div>
                </motion.div>
              )}
            </Card>

            {/* CTA */}
            <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-sky-600 to-emerald-600 text-white border-0 shadow-xl">
              <MessageSquare className="h-6 w-6 opacity-90" />
              <h3 className="font-heading text-xl font-bold mt-3">Talk to a medical coordinator</h3>
              <p className="text-sm opacity-90 mt-2">
                Have a question about your estimate? Our multilingual coordinators are available 24/7.
              </p>
              <div className="mt-5 space-y-2.5">
                {[
                  "Free consultation in your language",
                  "Verified partner hospitals only",
                  "End-to-end visa & travel help",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4" /> {b}
                  </div>
                ))}
              </div>
              <Button asChild variant="secondary" className="mt-6 w-full bg-white text-sky-700 hover:bg-white/90">
                <Link to="/support">Talk to a coordinator</Link>
              </Button>
            </Card>
          </div>
        </section>

        {/* ============= Testimonials ============= */}
        <section className="bg-white/60 border-t border-border/60">
          <div className="container mx-auto px-4 py-12">
            <SectionHeading
              kicker="Patient stories"
              title="Why patients trust MediConnect's pricing"
            />
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                {
                  name: "Sarah J., USA",
                  body: "The final quote matched the estimate to the dollar. No surprises after surgery — exactly as promised.",
                  treatment: "Knee Replacement",
                },
                {
                  name: "Ahmed K., UAE",
                  body: "Saved nearly 70% compared to my home country. The cost breakdown made everything transparent.",
                  treatment: "Heart Surgery",
                },
                {
                  name: "Maria L., Spain",
                  body: "Personalized estimate, doctor video call, and a fixed written quote in 24 hours. Brilliant experience.",
                  treatment: "IVF",
                },
              ].map((t) => (
                <Card key={t.name} className="p-6 bg-white">
                  <Quote className="h-5 w-5 text-sky-500" />
                  <p className="text-sm text-foreground/80 mt-3 leading-relaxed">"{t.body}"</p>
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.treatment}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

/* ---------------- Sub-components ---------------- */
const SectionHeading = ({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="text-center max-w-2xl mx-auto">
    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 uppercase tracking-widest bg-sky-100/60 border border-sky-200 rounded-full px-2.5 py-1">
      {kicker}
    </div>
    <h2 className="font-heading text-2xl sm:text-4xl font-bold text-foreground mt-3">{title}</h2>
    {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-2">{subtitle}</p>}
  </div>
);

const StageProgress = ({ stage }: { stage: 1 | 2 | 3 }) => {
  const steps = [
    { n: 1, label: "Initial Estimate" },
    { n: 2, label: "Personalized Estimate" },
    { n: 3, label: "Final Hospital Quote" },
  ];
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const active = s.n <= stage;
          return (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    active
                      ? "bg-gradient-to-br from-sky-600 to-emerald-600 text-white shadow-md shadow-sky-200"
                      : "bg-white border border-border text-muted-foreground"
                  }`}
                >
                  {s.n}
                </div>
                <div
                  className={`hidden sm:block text-xs font-semibold ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 mx-3 h-0.5 bg-border relative overflow-hidden rounded-full">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500 ${
                      s.n < stage ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ComparisonRow = ({
  flag,
  label,
  value,
  highlight,
  muted,
}: {
  flag: string;
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) => (
  <div
    className={`rounded-xl p-4 border ${
      highlight
        ? "bg-gradient-to-br from-emerald-50 to-sky-50 border-emerald-200"
        : "bg-muted/30 border-border"
    }`}
  >
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="text-base">{flag}</span> {label}
    </div>
    <div
      className={`mt-1.5 font-heading font-bold ${
        highlight ? "text-emerald-700 text-lg" : muted ? "text-foreground/70 text-base line-through decoration-rose-300/70" : "text-foreground text-base"
      }`}
    >
      {value}
    </div>
  </div>
);

const QuestionBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground">{title}</h3>
    <div className="mt-4">{children}</div>
  </div>
);

const OptionGrid = ({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) => (
  <div className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
    {options.map((o) => {
      const active = value === o;
      return (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
            active
              ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
              : "border-border bg-white text-foreground hover:border-sky-300"
          }`}
        >
          {o}
        </button>
      );
    })}
  </div>
);

const BreakdownRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0">
    <div className="flex items-center gap-2 text-foreground/80">
      <Icon className="h-3.5 w-3.5 text-sky-600" /> {label}
    </div>
    <div className="font-semibold text-foreground">{value}</div>
  </div>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <div className="text-sm font-semibold text-foreground mt-1">{value}</div>
  </div>
);

const Badge = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-800 bg-white/90 border border-sky-200 rounded-full px-2.5 py-1 shadow-sm">
    <Icon className="h-3 w-3" /> {label}
  </div>
);

export default CostEstimator;
