import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DepositSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const verifyDeposit = async () => {
      const sessionId = searchParams.get("session_id");
      const creditsParam = searchParams.get("credits");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-deposit", {
          body: { session_id: sessionId, credits: creditsParam },
        });

        if (error) throw error;

        setCredits(data.credits);
        setStatus("success");
        toast({
          title: "Depósito confirmado! 🎉",
          description: `${data.credits} créditos foram adicionados à sua conta.`,
        });
      } catch (error: any) {
        console.error("Erro ao verificar depósito:", error);
        setStatus("error");
        toast({
          title: "Erro na verificação",
          description: error.message || "Não foi possível verificar o pagamento.",
          variant: "destructive",
        });
      }
    };

    verifyDeposit();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <h1 className="font-display text-2xl mb-2">Verificando pagamento...</h1>
            <p className="text-muted-foreground">Por favor, aguarde.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-display text-2xl text-gradient-gold mb-2">
              Depósito Confirmado!
            </h1>
            <p className="text-muted-foreground mb-6">
              <span className="text-primary font-bold">{credits} créditos</span> foram adicionados à sua conta.
            </p>
            <Button variant="gold" onClick={() => navigate("/")}>
              Voltar e Jogar
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl mb-2">Erro na Verificação</h1>
            <p className="text-muted-foreground mb-6">
              Não foi possível confirmar o pagamento. Se você foi cobrado, entre em contato com o suporte.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar ao Início
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default DepositSuccess;
