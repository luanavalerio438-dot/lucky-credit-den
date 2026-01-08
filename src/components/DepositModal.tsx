import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAddDeposit } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Zap } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const depositPlans = [
  { amount: 20, credits: 100, bonus: 0 },
  { amount: 30, credits: 180, bonus: 20 },
  { amount: 40, credits: 280, bonus: 40 },
  { amount: 50, credits: 400, bonus: 60 },
];

const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const addDeposit = useAddDeposit();
  const { toast } = useToast();

  const handleDeposit = async () => {
    if (selectedPlan === null) return;
    
    const plan = depositPlans[selectedPlan];
    setLoading(true);

    try {
      await addDeposit.mutateAsync({
        amount: plan.amount,
        credits: plan.credits,
      });
      
      toast({
        title: "Depósito realizado! 🎉",
        description: `${plan.credits} créditos adicionados à sua conta.`,
      });
      onClose();
      setSelectedPlan(null);
    } catch (error: any) {
      toast({
        title: "Erro no depósito",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center text-gradient-gold">
            Adicionar Créditos
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {depositPlans.map((plan, index) => (
            <button
              key={plan.amount}
              onClick={() => setSelectedPlan(index)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedPlan === index
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border/50 bg-muted/30 hover:border-primary/50"
              }`}
            >
              {plan.bonus > 0 && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                  +{plan.bonus}%
                </div>
              )}
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-muted-foreground text-sm">R$</span>
                <span className="font-display text-3xl font-bold text-foreground">
                  {plan.amount}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{plan.credits} créditos</span>
              </div>

              {selectedPlan === index && (
                <div className="absolute top-2 left-2">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            💳 Pagamento simulado para demonstração. 
            <br />
            Os créditos são adicionados instantaneamente.
          </p>
        </div>

        <Button
          variant="gold"
          size="lg"
          className="w-full mt-4"
          onClick={handleDeposit}
          disabled={selectedPlan === null || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            `Depositar R$ ${selectedPlan !== null ? depositPlans[selectedPlan].amount : "0"},00`
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
