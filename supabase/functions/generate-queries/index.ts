import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { startupName, website, description, isPro } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const queryCount = isPro ? 25 : 10;

    const prompt = `You are an AI visibility analyst. A startup wants to know if AI chatbots mention them.

Startup: "${startupName}"
Website: ${website}
Description: ${description}

Generate exactly ${queryCount} search queries that a real user would type into AI chatbots (ChatGPT, Perplexity, Claude, Gemini, etc.) where this startup SHOULD ideally appear in the answer.

Rules:
- Queries must be specific to THIS startup's actual industry/domain (e.g. if it's an electric car company, queries should be about electric cars, EVs, automotive, NOT about SaaS tools)
- Include a mix of: "best X" queries, comparison queries, "what is" queries, recommendation queries, and problem-solving queries
- Make them realistic - these are things actual users ask AI
- Do NOT use generic SaaS/tech templates if the startup isn't a SaaS company
- Tailor every query to the startup's specific category and market`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You return ONLY a JSON array of strings. No markdown, no explanation." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_queries",
            description: "Return the generated search queries",
            parameters: {
              type: "object",
              properties: {
                queries: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of search queries"
                }
              },
              required: ["queries"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_queries" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let queries: string[] = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      queries = parsed.queries || [];
    }

    // Ensure we have the right count
    queries = queries.slice(0, queryCount);

    return new Response(JSON.stringify({ queries }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-queries error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
