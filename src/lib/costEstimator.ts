/* Pure cost-estimation logic for the /cost-estimator page.
 * All amounts are USD base values; UI converts to the selected currency.
 * These are INDICATIVE estimates only — not medical advice and not a
 * confirmed hospital price. The treating hospital confirms final cost.
 */

export type TreatmentKey =
  | "heart-surgery"
  | "knee-replacement"
  | "ivf"
  | "cancer"
  | "dental-implants"
  | "cosmetic";

export interface TreatmentInfo {
  key: TreatmentKey;
  name: string;
  india: [number, number]; // USD range
  usa: number;
  uae: number;
  stayDays: number;
  doctor: string;
}

export const TREATMENTS: TreatmentInfo[] = [
  { key: "heart-surgery", name: "Heart Surgery (CABG)", india: [4500, 7500], usa: 100000, uae: 40000, stayDays: 8, doctor: "Dr. Arun Mehta, MCh Cardiothoracic" },
  { key: "knee-replacement", name: "Knee Replacement", india: [4000, 6500], usa: 35000, uae: 22000, stayDays: 5, doctor: "Dr. Priya Nair, MS Ortho" },
  { key: "ivf", name: "IVF Treatment", india: [2500, 4500], usa: 20000, uae: 12000, stayDays: 14, doctor: "Dr. Kavita Rao, DGO" },
  { key: "cancer", name: "Cancer Treatment", india: [6000, 18000], usa: 150000, uae: 60000, stayDays: 21, doctor: "Dr. Sanjay Iyer, DM Oncology" },
  { key: "dental-implants", name: "Dental Implants", india: [600, 1500], usa: 5000, uae: 3500, stayDays: 3, doctor: "Dr. Neha Shah, MDS" },
  { key: "cosmetic", name: "Cosmetic Surgery", india: [2000, 6000], usa: 18000, uae: 11000, stayDays: 4, doctor: "Dr. Rohan Kapoor, MCh Plastic" },
];

export const CITIES = ["Hyderabad", "Chennai", "Bangalore", "Delhi", "Mumbai"];
export const CITY_MULT: Record<string, number> = { Hyderabad: 0.92, Chennai: 0.95, Bangalore: 1.0, Delhi: 1.05, Mumbai: 1.1 };
export const CATEGORY_MULT: Record<string, number> = { Budget: 0.82, Standard: 1.0, Premium: 1.25 };
export const ROOM_MULT: Record<string, number> = { Shared: 0.95, Private: 1.0, Deluxe: 1.12 };
export const SEVERITY_MULT: Record<string, number> = { Mild: 0.85, Moderate: 1.0, Severe: 1.2 };

/** Width of the personalized estimate band, as a fraction of the midpoint. */
export const RANGE_SPREAD = 0.09;
/** Final detailed estimate is the personalized midpoint plus a 2% planning buffer. */
export const FINAL_BUFFER = 0.02;
/** Uplift applied when the patient has had previous surgery for the same condition. */
export const PREVIOUS_SURGERY_MULT = 1.08;

const KEYWORD_MAP: Array<[string[], TreatmentKey]> = [
  [["heart", "cardiac", "cabg", "bypass", "valve"], "heart-surgery"],
  [["knee", "hip", "joint", "ortho"], "knee-replacement"],
  [["ivf", "fertility", "infertil"], "ivf"],
  [["cancer", "tumor", "oncology", "chemo", "radiation"], "cancer"],
  [["dental", "implant", "tooth"], "dental-implants"],
  [["cosmetic", "plastic", "rhinoplasty", "liposuction"], "cosmetic"],
];

export function matchTreatment(name?: string): TreatmentInfo {
  if (!name) return TREATMENTS[0];
  const n = name.toLowerCase();
  for (const [keys, key] of KEYWORD_MAP) {
    if (keys.some((k) => n.includes(k))) {
      return TREATMENTS.find((t) => t.key === key) || TREATMENTS[0];
    }
  }
  return TREATMENTS[0];
}

export function normalizeSeverity(s?: string): string {
  const v = (s || "").toLowerCase();
  if (v.includes("mild")) return "Mild";
  if (v.includes("sev") || v.includes("crit")) return "Severe";
  return "Moderate";
}

export interface EstimateInputs {
  treatmentKey: TreatmentKey;
  severity: string;
  city: string;
  category: string;
  room: string;
  previousSurgery: boolean;
}

/** Midpoint of the personalized (Stage 2) estimate in USD. */
export function computePersonalizedMid(inputs: EstimateInputs): number {
  const treatment = TREATMENTS.find((t) => t.key === inputs.treatmentKey) || TREATMENTS[0];
  const [lo, hi] = treatment.india;
  const mid = (lo + hi) / 2;
  const mult =
    (SEVERITY_MULT[inputs.severity] ?? 1) *
    (CITY_MULT[inputs.city] ?? 1) *
    (CATEGORY_MULT[inputs.category] ?? 1) *
    (ROOM_MULT[inputs.room] ?? 1) *
    (inputs.previousSurgery ? PREVIOUS_SURGERY_MULT : 1);
  return mid * mult;
}

/** Personalized estimate band (± RANGE_SPREAD around the midpoint). */
export function computePersonalizedRange(mid: number): [number, number] {
  const spread = mid * RANGE_SPREAD;
  return [mid - spread, mid + spread];
}

/** Detailed (Stage 3) estimate: personalized midpoint plus a planning buffer. */
export function computeFinalEstimate(mid: number): number {
  return mid * (1 + FINAL_BUFFER);
}
