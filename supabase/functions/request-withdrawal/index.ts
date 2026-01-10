import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDITS_TO_BRL_RATE = 0.15; // 1 crédito = R$0.15
const MIN_WITHDRAWAL_CREDITS = 100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Usuário não autenticado");

    const { credits, pixKey, pixKeyType } = await req.json();

    // Validate input
    if (!credits || credits < MIN_WITHDRAWAL_CREDITS) {
      throw new Error(`Mínimo de ${MIN_WITHDRAWAL_CREDITS} créditos para saque`);
    }
    if (!pixKey || !pixKeyType) {
      throw new Error("Chave PIX é obrigatória");
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Perfil não encontrado");

    // Check if user has enough credits
    if (profile.credits < credits) {
      throw new Error("Saldo insuficiente");
    }

    // Calculate BRL amount
    const amountBRL = credits * CREDITS_TO_BRL_RATE;

    // Deduct credits from user
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ credits: profile.credits - credits })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Create withdrawal request
    const { error: withdrawalError } = await supabaseClient
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount: amountBRL,
        credits_amount: credits,
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        status: "pending",
      });

    if (withdrawalError) throw withdrawalError;

    // Record transaction
    await supabaseClient.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      amount: amountBRL,
      description: `Saque de ${credits} créditos - R$${amountBRL.toFixed(2)} via PIX`,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        amount: amountBRL,
        credits: credits,
        message: "Solicitação de saque criada com sucesso" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
