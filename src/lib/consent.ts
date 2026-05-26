import { supabase } from "@/integrations/supabase/client";

/**
 * Record (or refresh) consent that a patient has shared medical documents with a hospital.
 * Idempotent — uses unique (patient_id, hospital_id, scope) constraint.
 */
export async function recordMedicalDataConsent(opts: {
  patientId: string;
  hospitalId: string;
  scope?: string;
}) {
  const { patientId, hospitalId, scope = "medical_documents" } = opts;
  // Re-grant if previously revoked.
  const { data: existing } = await supabase
    .from("medical_data_consents")
    .select("id, revoked_at")
    .eq("patient_id", patientId)
    .eq("hospital_id", hospitalId)
    .eq("scope", scope)
    .maybeSingle();

  if (existing) {
    if (existing.revoked_at) {
      await supabase
        .from("medical_data_consents")
        .update({ revoked_at: null, granted_at: new Date().toISOString() })
        .eq("id", existing.id);
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("medical_data_consents")
    .insert({ patient_id: patientId, hospital_id: hospitalId, scope })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
