import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wallet, AlertCircle, ArrowDownToLine } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDITS_TO_BRL_RATE = 0.15; // 1 crédito = R$0.15
const MIN_WITHDRAWAL_CREDITS = 100;

const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
  const [credits, setCredits] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const creditsNum = parseInt(credits) || 0;
  const amountBRL = creditsNum * CREDITS_TO_BRL_RATE;
  const availableCredits = profile?.credits || 0;

  const isValid = 
    creditsNum >= MIN_WITHDRAWAL_CREDITS && 
    creditsNum <= availableCredits && 
    pixKey.trim() !== "" && 
    pixKeyType !== "";

  const handleWithdraw = async () => {
    if (!isValid) return;
    
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("request-withdrawal", {
        body: { 
          credits: creditsNum,
          pixKey: pixKey.trim(),
          pixKeyType
        },
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada! ✅",
        description: `Saque de R$${amountBRL.toFixed(2)} solicitado. Processamento em até 24h.`,
      });

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar saque",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCredits("");
    setPixKey("");
    setPixKeyType("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center text-gradient-gold">
            Solicitar Saque
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Saldo disponível */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
            <p className="font-display text-3xl font-bold text-primary">
              {availableCredits} <span className="text-lg text-muted-foreground">créditos</span>
            </p>
          </div>

          {/* Quantidade de créditos */}
          <div className="space-y-2">
            <Label htmlFor="credits">Quantidade de créditos</Label>
            <Input
              id="credits"
              type="number"
              placeholder={`Mínimo ${MIN_WITHDRAWAL_CREDITS}`}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="bg-muted/30"
            />
            {creditsNum > 0 && (
              <p className="text-sm text-muted-foreground">
                Você receberá: <span className="text-secondary font-bold">R$ {amountBRL.toFixed(2)}</span>
              </p>
            )}
            {creditsNum > availableCredits && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Saldo insuficiente
              </p>
            )}
          </div>

          {/* Tipo de chave PIX */}
          <div className="space-y-2">
            <Label>Tipo de chave PIX</Label>
            <Select value={pixKeyType} onValueChange={setPixKeyType}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
                <SelectItem value="aleatoria">Chave aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chave PIX */}
          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              type="text"
              placeholder="Digite sua chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
            <p className="text-xs text-muted-foreground text-center">
              ⏱️ Processamento em até 24 horas úteis.
              <br />
              Taxa de conversão: 1 crédito = R$ {CREDITS_TO_BRL_RATE.toFixed(2)}
            </p>
          </div>

          <Button
            variant="emerald"
            size="lg"
            className="w-full"
            onClick={handleWithdraw}
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                Solicitar Saque
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
