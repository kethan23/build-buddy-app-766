import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { images } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error("No images provided");
    }

    const extractedTexts: string[] = [];

    for (const img of images) {
      const { base64, mimeType, fileName } = img;

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
              content: "You are a medical document OCR specialist. Extract ALL text from the provided medical report image exactly as it appears. Preserve the structure, tables, values, units, and formatting. If it's a lab report, maintain the test name, value, unit, and reference range in a clear format. Output only the extracted text, no commentary.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract all text from this medical report image (${fileName}). Preserve all values, units, reference ranges, and formatting.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OCR error for ${fileName}:`, response.status, errorText);
        extractedTexts.push(`[Could not extract text from ${fileName}]`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || `[No text extracted from ${fileName}]`;
      extractedTexts.push(`--- ${fileName} ---\n${text}`);
    }

    return new Response(JSON.stringify({ extractedText: extractedTexts.join("\n\n") }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
