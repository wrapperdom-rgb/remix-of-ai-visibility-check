import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = await req.json();
    console.log("Dodo webhook event:", JSON.stringify(payload));

    const eventType = payload.type || payload.event_type;
    const data = payload.data || payload;

    // Handle subscription/payment success events
    if (
      eventType === "subscription.active" ||
      eventType === "payment.succeeded" ||
      eventType === "subscription.created"
    ) {
      const metadata = data.metadata || {};
      const userId = metadata.user_id;

      if (userId) {
        const { error } = await supabase
          .from("profiles")
          .update({ plan: "pro" })
          .eq("id", userId);

        if (error) {
          console.error("Failed to upgrade user:", error);
          throw error;
        }

        console.log(`User ${userId} upgraded to pro`);
      } else {
        // Try to find user by email
        const customerEmail = data.customer?.email || data.email;
        if (customerEmail) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", customerEmail)
            .limit(1);

          if (profiles && profiles.length > 0) {
            await supabase
              .from("profiles")
              .update({ plan: "pro" })
              .eq("id", profiles[0].id);
            console.log(`User ${profiles[0].id} upgraded to pro via email match`);
          }
        }
      }
    }

    // Handle subscription cancellation
    if (eventType === "subscription.cancelled" || eventType === "subscription.expired") {
      const metadata = data.metadata || {};
      const userId = metadata.user_id;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ plan: "free" })
          .eq("id", userId);
        console.log(`User ${userId} downgraded to free`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook processing failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
