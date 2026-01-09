import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Usuário não autenticado");

    const { session_id, credits } = await req.json();
    if (!session_id) throw new Error("Session ID é obrigatório");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== "paid") {
      throw new Error("Pagamento não confirmado");
    }

    // Verificar se o user_id no metadata corresponde
    if (session.metadata?.user_id !== user.id) {
      throw new Error("Sessão não pertence a este usuário");
    }

    const creditsToAdd = parseInt(session.metadata?.credits || credits || "0");
    const amountPaid = parseInt(session.metadata?.amount || "0");

    // Buscar perfil atual
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits, total_deposited")
      .eq("user_id", user.id)
      .single();

    if (profileError) throw profileError;

    // Atualizar créditos e total depositado
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        credits: (profile.credits || 0) + creditsToAdd,
        total_deposited: (profile.total_deposited || 0) + amountPaid,
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Registrar transação
    await supabaseClient.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: amountPaid,
      description: `Depósito de R$${amountPaid} - ${creditsToAdd} créditos`,
    });

    return new Response(JSON.stringify({ success: true, credits: creditsToAdd }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
