import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DODO_API_URL = "https://live.dodopayments.com";
const PRODUCT_ID = "pdt_0NboK3lCqeOmfXvi4Z24w";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const DODO_API_KEY = Deno.env.get("DODO_PAYMENTS_API_KEY");
    if (!DODO_API_KEY) {
      throw new Error("DODO_PAYMENTS_API_KEY is not configured");
    }

    // Verify user is authenticated
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get return URL from request body
    const body = await req.json().catch(() => ({}));
    const returnUrl = body.return_url || "https://poolabs.in/settings";

    // Create Dodo Payments checkout session
    const response = await fetch(`${DODO_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DODO_API_KEY}`,
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: PRODUCT_ID,
            quantity: 1,
          },
        ],
        customer: {
          email: user.email || "",
          name: user.user_metadata?.full_name || "",
        },
        return_url: returnUrl,
        metadata: {
          user_id: user.id,
          plan: "pro",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Dodo Payments API error [${response.status}]:`, errorText);
      throw new Error(`Dodo Payments API error: ${response.status}`);
    }

    const session = await response.json();

    return new Response(
      JSON.stringify({ checkout_url: session.checkout_url, session_id: session.session_id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create checkout session" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
