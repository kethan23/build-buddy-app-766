/**
 * Shared patient journey context.
 * Lets AI Analysis → Cost Estimator → Hospital Search → Inquiry pre-fill each other.
 * Persisted in sessionStorage so navigation across pages preserves it.
 */

const KEY = "mediconnect:patientContext";

export interface PatientContext {
  condition?: string;
  treatment?: string;
  treatmentKey?: string;
  severity?: "Mild" | "Moderate" | "Severe" | string;
  budgetMin?: number; // USD
  budgetMax?: number; // USD
  city?: string;
  source?: "ai-analysis" | "cost-estimator" | "hospitals" | "manual";
  updatedAt?: number;
}

export function getPatientContext(): PatientContext {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PatientContext) : {};
  } catch {
    return {};
  }
}

export function setPatientContext(ctx: Partial<PatientContext>) {
  if (typeof window === "undefined") return;
  const merged = { ...getPatientContext(), ...ctx, updatedAt: Date.now() };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* noop */
  }
}

export function clearPatientContext() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
