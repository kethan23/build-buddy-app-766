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
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch verified hospitals with their packages
    const { data: hospitals } = await supabase
      .from("hospitals")
      .select("id, name, city, country, rating, total_reviews, logo_url, cover_image_url, description")
      .eq("verification_status", "verified")
      .eq("is_active", true);

    const { data: packages } = await supabase
      .from("treatment_packages")
      .select("id, name, category, price, currency, duration_days, hospital_id, description")
      .eq("is_active", true);

    const { data: specialties } = await supabase
      .from("hospital_specialties")
      .select("hospital_id, specialty_name");

    if (!hospitals?.length) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context for AI
    const hospitalContext = hospitals.map((h) => {
      const hPackages = packages?.filter((p) => p.hospital_id === h.id) || [];
      const hSpecs = specialties?.filter((s) => s.hospital_id === h.id).map((s) => s.specialty_name) || [];
      return `Hospital: ${h.name} (ID: ${h.id}, City: ${h.city}, Rating: ${h.rating}/5, Reviews: ${h.total_reviews})
Specialties: ${hSpecs.join(", ") || "General"}
Packages: ${hPackages.map((p) => `${p.name} - ${p.category} - $${p.price} ${p.currency || "USD"} (${p.duration_days} days)`).join("; ") || "None listed"}`;
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
            content: `You are a medical tourism search assistant. Given a patient query and a list of available hospitals with their packages, return the most relevant matches. Only suggest hospitals from the provided list. Return results using the tool provided.`,
          },
          {
            role: "user",
            content: `Patient query: "${query}"\n\nAvailable hospitals:\n${hospitalContext}\n\nReturn the top matching hospitals and relevant treatment packages.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "search_results",
              description: "Return matched hospitals and treatments",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        hospital_id: { type: "string" },
                        hospital_name: { type: "string" },
                        city: { type: "string" },
                        match_reason: { type: "string", description: "Brief reason why this hospital matches" },
                        relevant_treatments: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              estimated_cost: { type: "string" },
                            },
                            required: ["name", "estimated_cost"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["hospital_id", "hospital_name", "city", "match_reason", "relevant_treatments"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["results"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "search_results" } },
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
      // Enrich with hospital data (images, ratings)
      const enriched = parsed.results.map((r: any) => {
        const h = hospitals.find((h) => h.id === r.hospital_id);
        return {
          ...r,
          rating: h?.rating,
          total_reviews: h?.total_reviews,
          logo_url: h?.logo_url,
          cover_image_url: h?.cover_image_url,
        };
      });
      return new Response(JSON.stringify({ results: enriched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ results: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-hospital-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
