import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return new Response(JSON.stringify({ results: { hospitals: [], treatments: [], doctors: [], summary: "" } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all verified hospitals, packages, doctors, specialties
    const [hospitalsRes, packagesRes, doctorsRes, specialtiesRes] = await Promise.all([
      supabase.from("hospitals").select("id, name, city, country, rating, total_reviews, logo_url, cover_image_url, description").eq("verification_status", "verified").eq("is_active", true),
      supabase.from("treatment_packages").select("id, name, category, price, currency, duration_days, hospital_id, description, recovery_days, inclusions").eq("is_active", true),
      supabase.from("doctors").select("id, name, specialty, qualification, experience_years, photo_url, hospital_id, bio, consultation_fee, is_available").eq("is_available", true),
      supabase.from("hospital_specialties").select("hospital_id, specialty_name"),
    ]);

    const hospitals = hospitalsRes.data || [];
    const packages = packagesRes.data || [];
    const doctors = doctorsRes.data || [];
    const specialties = specialtiesRes.data || [];

    if (!hospitals.length) {
      return new Response(JSON.stringify({ results: { hospitals: [], treatments: [], doctors: [], summary: "No hospitals available at the moment." } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context
    const context = hospitals.map((h) => {
      const hPkgs = packages.filter((p) => p.hospital_id === h.id);
      const hDocs = doctors.filter((d) => d.hospital_id === h.id);
      const hSpecs = specialties.filter((s) => s.hospital_id === h.id).map((s) => s.specialty_name);
      return `Hospital: ${h.name} (ID: ${h.id}, City: ${h.city}, Rating: ${h.rating}/5)
Specialties: ${hSpecs.join(", ") || "General"}
Doctors: ${hDocs.map((d) => `${d.name} [ID:${d.id}] - ${d.specialty}, ${d.experience_years}yr exp, ${d.qualification}`).join("; ") || "None"}
Packages: ${hPkgs.map((p) => `${p.name} [ID:${p.id}] - ${p.category} - $${p.price} (${p.duration_days} days)`).join("; ") || "None"}`;
    }).join("\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a medical tourism analysis assistant for India. Analyze the patient's condition and recommend ONLY from the provided hospital data. Return a brief medical summary, matching hospitals, relevant treatment packages, and recommended doctors. Use EXACT IDs from the data.`,
          },
          {
            role: "user",
            content: `Patient says: "${query}"\n\nAvailable data:\n${context}\n\nAnalyze and return the best matches.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analysis_results",
              description: "Return AI analysis with matched hospitals, treatments, and doctors",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Brief analysis of the patient's condition and what they need" },
                  hospitals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        hospital_id: { type: "string" },
                        match_reason: { type: "string" },
                      },
                      required: ["hospital_id", "match_reason"],
                      additionalProperties: false,
                    },
                  },
                  treatments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        package_id: { type: "string" },
                        why_recommended: { type: "string" },
                      },
                      required: ["package_id", "why_recommended"],
                      additionalProperties: false,
                    },
                  },
                  doctors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        doctor_id: { type: "string" },
                        why_recommended: { type: "string" },
                      },
                      required: ["doctor_id", "why_recommended"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "hospitals", "treatments", "doctors"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analysis_results" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);

      // Enrich with real data
      const enrichedHospitals = parsed.hospitals.map((r: any) => {
        const h = hospitals.find((h) => h.id === r.hospital_id);
        return h ? { ...h, match_reason: r.match_reason } : null;
      }).filter(Boolean);

      const enrichedTreatments = parsed.treatments.map((r: any) => {
        const p = packages.find((p) => p.id === r.package_id);
        if (!p) return null;
        const h = hospitals.find((h) => h.id === p.hospital_id);
        return { ...p, hospital_name: h?.name, why_recommended: r.why_recommended };
      }).filter(Boolean);

      const enrichedDoctors = parsed.doctors.map((r: any) => {
        const d = doctors.find((d) => d.id === r.doctor_id);
        if (!d) return null;
        const h = hospitals.find((h) => h.id === d.hospital_id);
        return { ...d, hospital_name: h?.name, why_recommended: r.why_recommended };
      }).filter(Boolean);

      return new Response(JSON.stringify({
        results: {
          summary: parsed.summary,
          hospitals: enrichedHospitals,
          treatments: enrichedTreatments,
          doctors: enrichedDoctors,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No structured response");
  } catch (e) {
    console.error("ai-hospital-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
