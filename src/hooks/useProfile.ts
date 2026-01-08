import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  credits: number;
  total_deposited: number;
  total_won: number;
  total_lost: number;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateCredits = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount, type }: { amount: number; type: "add" | "subtract" }) => {
      if (!user) throw new Error("Not authenticated");

      // First get current credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const newCredits = type === "add" 
        ? profile.credits + amount 
        : profile.credits - amount;

      if (newCredits < 0) throw new Error("Insufficient credits");

      const { error } = await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("user_id", user.id);

      if (error) throw error;
      return newCredits;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useAddDeposit = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount, credits }: { amount: number; credits: number }) => {
      if (!user) throw new Error("Not authenticated");

      // Get current profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits, total_deposited")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Update profile with new credits
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          credits: profile.credits + credits,
          total_deposited: profile.total_deposited + amount
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "deposit",
          amount: credits,
          description: `Depósito de R$ ${amount},00`
        });

      if (transactionError) throw transactionError;

      return profile.credits + credits;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
