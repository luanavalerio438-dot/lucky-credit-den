import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gamepad2, 
  Loader2,
  Coins,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  game: string | null;
  created_at: string;
}

const TransactionHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
      case "withdrawal":
        return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
      case "win":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "loss":
      case "bet":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Gamepad2 className="w-5 h-5 text-primary" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "win":
        return "text-emerald-500";
      case "withdrawal":
        return "text-orange-500";
      case "loss":
      case "bet":
        return "text-red-500";
      default:
        return "text-foreground";
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Depósito";
      case "withdrawal":
        return "Saque";
      case "win":
        return "Ganho";
      case "loss":
        return "Perda";
      case "bet":
        return "Aposta";
      default:
        return type;
    }
  };

  const formatAmount = (type: string, amount: number) => {
    const isPositive = type === "deposit" || type === "win";
    const prefix = isPositive ? "+" : "-";
    return `${prefix} ${Math.abs(amount).toFixed(2)}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-gradient-gold">
                Histórico de Transações
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Acompanhe seus depósitos, saques e jogadas
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {transactions && transactions.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-4 text-center">
                <ArrowDownLeft className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Depósitos</p>
                <p className="font-bold text-foreground">
                  {transactions.filter(t => t.type === "deposit").length}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <Gamepad2 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Jogadas</p>
                <p className="font-bold text-foreground">
                  {transactions.filter(t => ["win", "loss", "bet"].includes(t.type)).length}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <ArrowUpRight className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Saques</p>
                <p className="font-bold text-foreground">
                  {transactions.filter(t => t.type === "withdrawal").length}
                </p>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {getTransactionLabel(transaction.type)}
                      </span>
                      {transaction.game && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {transaction.game}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {transaction.description || "Sem descrição"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(transaction.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                    </div>
                  </div>

                  <div className={`text-right font-bold ${getTransactionColor(transaction.type)}`}>
                    <div className="flex items-center gap-1">
                      {transaction.type === "deposit" || transaction.type === "withdrawal" ? (
                        <>R$ {formatAmount(transaction.type, transaction.amount)}</>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          {formatAmount(transaction.type, transaction.amount)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-card">
                <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl mb-2">Nenhuma transação</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Faça seu primeiro depósito para começar a jogar!
                </p>
                <Button variant="gold" onClick={() => navigate("/")}>
                  Voltar ao início
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionHistory;
