import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Usuário não autenticado");

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw roleError;
    if (!roleData) throw new Error("Acesso negado: você não é administrador");

    const { withdrawalId, action, notes } = await req.json();

    if (!withdrawalId || !action) {
      throw new Error("ID do saque e ação são obrigatórios");
    }

    if (!["approve", "reject"].includes(action)) {
      throw new Error("Ação inválida");
    }

    // Get withdrawal
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (withdrawalError) throw withdrawalError;
    if (!withdrawal) throw new Error("Saque não encontrado");
    if (withdrawal.status !== "pending") throw new Error("Este saque já foi processado");

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update withdrawal status
    const { error: updateError } = await supabaseClient
      .from("withdrawals")
      .update({
        status: newStatus,
        notes: notes || null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) throw updateError;

    // If rejected, return credits to user
    if (action === "reject") {
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("credits")
        .eq("user_id", withdrawal.user_id)
        .single();

      if (profileError) throw profileError;

      const { error: refundError } = await supabaseClient
        .from("profiles")
        .update({ credits: profile.credits + withdrawal.credits_amount })
        .eq("user_id", withdrawal.user_id);

      if (refundError) throw refundError;

      // Record refund transaction
      await supabaseClient.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "refund",
        amount: withdrawal.credits_amount,
        description: `Estorno de saque rejeitado - ${withdrawal.credits_amount} créditos devolvidos`,
      });
    } else {
      // Record approved withdrawal completion
      await supabaseClient.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal_completed",
        amount: Number(withdrawal.amount),
        description: `Saque aprovado - R$${Number(withdrawal.amount).toFixed(2)} enviado via PIX`,
      });

      // Update total_withdrawn on profile
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("total_withdrawn")
        .eq("user_id", withdrawal.user_id)
        .single();

      if (!profileError && profile) {
        await supabaseClient
          .from("profiles")
          .update({ 
            total_withdrawn: Number(profile.total_withdrawn || 0) + Number(withdrawal.amount) 
          })
          .eq("user_id", withdrawal.user_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: action === "approve" ? "Saque aprovado com sucesso" : "Saque rejeitado e créditos devolvidos",
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
