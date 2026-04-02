import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini',
  copilot: 'Microsoft Copilot', meta_ai: 'Meta AI', mistral: 'Mistral', grok: 'Grok',
  you_com: 'You.com', phind: 'Phind', poe: 'Poe', pi: 'Pi', deepseek: 'DeepSeek',
  qwen: 'Qwen', llama: 'Llama', reka: 'Reka', command_r: 'Command R',
  duckduckgo_ai: 'DuckDuckGo AI', brave_leo: 'Brave Leo', notion_ai: 'Notion AI',
  slack_ai: 'Slack AI', canva_ai: 'Canva AI', jasper: 'Jasper',
  writesonic: 'Writesonic', microsoft_designer: 'Microsoft Designer',
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { startupName, website, description, query, platforms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const platformList = (platforms as string[]).map(p => PLATFORM_NAMES[p] || p).join(", ");

    const prompt = `You are simulating how different AI chatbots would answer a user query. 

Startup: "${startupName}"
Website: ${website}
Description: ${description}

User query: "${query}"

For each of these AI platforms: ${platformList}

Determine whether each platform would likely mention "${startupName}" in its response to this query, based on:
- How well-known the startup is
- Whether the startup is relevant to the query
- The platform's training data and knowledge
- Whether competitors are more commonly known

For each platform, provide:
- is_visible: true/false
- mention_snippet: If visible, a realistic 1-sentence snippet of how the AI would mention it. If not visible, null.
- competitors_found: If NOT visible, list 1-3 real competitors that the AI would likely mention instead. These must be REAL companies in the same space. If visible, null.`;

    const platformKeys = platforms as string[];
    const properties: Record<string, any> = {};
    platformKeys.forEach(p => {
      properties[p] = {
        type: "object",
        properties: {
          is_visible: { type: "boolean" },
          mention_snippet: { type: ["string", "null"] },
          competitors_found: { 
            type: ["array", "null"],
            items: { type: "string" }
          }
        },
        required: ["is_visible", "mention_snippet", "competitors_found"],
        additionalProperties: false
      };
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an AI visibility analyst. Be realistic about which startups AI platforms would actually mention." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_visibility",
            description: "Return visibility analysis per platform",
            parameters: {
              type: "object",
              properties,
              required: platformKeys,
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_visibility" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let results: Record<string, any> = {};

    if (toolCall?.function?.arguments) {
      results = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-visibility error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
