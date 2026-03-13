import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { reportText, patientInfo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert medical analyst AI for a medical tourism platform focused on India. 
Analyze the provided medical report text and patient information. Return a structured JSON response using the tool provided.

Guidelines:
- Be thorough but clear in your analysis
- Always recommend seeking professional medical advice
- Focus on treatments available in Indian hospitals
- Provide realistic cost estimates in USD for treatment in India
- Consider the patient's age, gender, and medical history
- Severity levels: mild, moderate, severe, critical
- Always include at least 2-3 treatment options
- Recommend specific Indian cities known for the treatment`;

    const userPrompt = `Patient Information:
- Name: ${patientInfo.name || 'Not provided'}
- Age: ${patientInfo.age || 'Not provided'}
- Gender: ${patientInfo.gender || 'Not provided'}
- Country: ${patientInfo.country || 'Not provided'}
- Medical Condition: ${patientInfo.condition || 'Not provided'}
- Previous Treatments: ${patientInfo.previousTreatments || 'None'}
- Budget Range: ${patientInfo.budget || 'Not specified'}
- Preferred City: ${patientInfo.preferredCity || 'Any'}

Medical Report Content:
${reportText || 'No report uploaded - analyze based on patient information only.'}

Analyze this information and provide diagnosis, treatment recommendations, hospital suggestions, and cost estimates.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "medical_analysis",
              description: "Return structured medical analysis results",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Brief medical summary for the patient" },
                  detectedConditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        condition: { type: "string" },
                        severity: { type: "string", enum: ["mild", "moderate", "severe", "critical"] },
                        confidence: { type: "string", enum: ["low", "medium", "high"] },
                        description: { type: "string" },
                      },
                      required: ["condition", "severity", "confidence", "description"],
                      additionalProperties: false,
                    },
                  },
                  recommendedTreatments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        treatment: { type: "string" },
                        description: { type: "string" },
                        estimatedCostUSD: { type: "string" },
                        durationDays: { type: "string" },
                        successRate: { type: "string" },
                      },
                      required: ["treatment", "description", "estimatedCostUSD", "durationDays", "successRate"],
                      additionalProperties: false,
                    },
                  },
                  recommendedHospitals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        city: { type: "string" },
                        specialty: { type: "string" },
                        whyRecommended: { type: "string" },
                        estimatedCost: { type: "string" },
                        accreditation: { type: "string" },
                      },
                      required: ["name", "city", "specialty", "whyRecommended", "estimatedCost", "accreditation"],
                      additionalProperties: false,
                    },
                  },
                  costBreakdown: {
                    type: "object",
                    properties: {
                      surgeryCost: { type: "string" },
                      hospitalStay: { type: "string" },
                      doctorFees: { type: "string" },
                      medicineCost: { type: "string" },
                      additionalCharges: { type: "string" },
                      totalEstimate: { type: "string" },
                    },
                    required: ["surgeryCost", "hospitalStay", "doctorFees", "medicineCost", "additionalCharges", "totalEstimate"],
                    additionalProperties: false,
                  },
                  urgencyLevel: { type: "string", enum: ["routine", "soon", "urgent", "emergency"] },
                  disclaimer: { type: "string" },
                },
                required: ["summary", "detectedConditions", "recommendedTreatments", "recommendedHospitals", "costBreakdown", "urgencyLevel", "disclaimer"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "medical_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No structured response from AI");
  } catch (e) {
    console.error("analyze-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
