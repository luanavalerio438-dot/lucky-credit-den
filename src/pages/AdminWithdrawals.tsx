import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Loader2, ArrowLeft, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  credits_amount: number;
  pix_key: string;
  pix_key_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
  profiles?: {
    email: string | null;
    display_name: string | null;
  };
}

const AdminWithdrawals = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, adminLoading, user, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchWithdrawals();
    }
  }, [isAdmin, filter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data: withdrawalsData, error } = await query;

      if (error) throw error;

      // Fetch profiles for each withdrawal
      const userIds = [...new Set((withdrawalsData || []).map(w => w.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, email, display_name")
        .in("user_id", userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, { email: p.email, display_name: p.display_name }])
      );

      const enrichedWithdrawals = (withdrawalsData || []).map(w => ({
        ...w,
        profiles: profilesMap.get(w.user_id) || { email: null, display_name: null },
      }));

      setWithdrawals(enrichedWithdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações de saque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedWithdrawal || !action) return;

    setProcessing(selectedWithdrawal.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const response = await supabase.functions.invoke("process-withdrawal", {
        body: {
          withdrawalId: selectedWithdrawal.id,
          action,
          notes: notes || undefined,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: action === "approve" ? "Saque aprovado" : "Saque rejeitado",
        description: action === "approve" 
          ? "O saque foi aprovado com sucesso." 
          : "O saque foi rejeitado e os créditos foram devolvidos.",
      });

      fetchWithdrawals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
      setSelectedWithdrawal(null);
      setAction(null);
      setNotes("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPixKeyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cpf: "CPF",
      cnpj: "CNPJ",
      email: "E-mail",
      phone: "Telefone",
      random: "Chave Aleatória",
    };
    return labels[type] || type;
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Painel Admin - Saques</h1>
          </div>
          <p className="text-muted-foreground">Gerencie as solicitações de saque dos usuários</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              size="sm"
            >
              {f === "pending" && "Pendentes"}
              {f === "approved" && "Aprovados"}
              {f === "rejected" && "Rejeitados"}
              {f === "all" && "Todos"}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Pendentes</p>
            <p className="text-2xl font-bold text-yellow-400">
              {withdrawals.filter(w => w.status === "pending").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Valor Pendente</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {withdrawals
                .filter(w => w.status === "pending")
                .reduce((acc, w) => acc + Number(w.amount), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Aprovados Hoje</p>
            <p className="text-2xl font-bold text-green-400">
              {withdrawals.filter(w => 
                w.status === "approved" && 
                new Date(w.processed_at || "").toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Pago Hoje</p>
            <p className="text-2xl font-bold text-green-400">
              R$ {withdrawals
                .filter(w => 
                  w.status === "approved" && 
                  new Date(w.processed_at || "").toDateString() === new Date().toDateString()
                )
                .reduce((acc, w) => acc + Number(w.amount), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>PIX</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(withdrawal.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {withdrawal.profiles?.display_name || "Sem nome"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {withdrawal.profiles?.email || withdrawal.user_id.slice(0, 8)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {withdrawal.credits_amount}
                    </TableCell>
                    <TableCell className="font-bold text-green-400">
                      R$ {Number(withdrawal.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {getPixKeyTypeLabel(withdrawal.pix_key_type)}
                        </p>
                        <p className="font-mono text-sm text-foreground">
                          {withdrawal.pix_key}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(withdrawal.status)}
                      {withdrawal.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {withdrawal.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setAction("approve");
                            }}
                            disabled={processing === withdrawal.id}
                          >
                            {processing === withdrawal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setAction("reject");
                            }}
                            disabled={processing === withdrawal.id}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {withdrawal.status !== "pending" && withdrawal.processed_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(withdrawal.processed_at), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedWithdrawal && !!action} onOpenChange={() => {
        setSelectedWithdrawal(null);
        setAction(null);
        setNotes("");
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" ? "Aprovar Saque" : "Rejeitar Saque"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" 
                ? `Confirma a aprovação do saque de R$ ${Number(selectedWithdrawal?.amount || 0).toFixed(2)} para ${selectedWithdrawal?.profiles?.email || "este usuário"}?`
                : `Confirma a rejeição do saque? Os ${selectedWithdrawal?.credits_amount} créditos serão devolvidos ao usuário.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium text-foreground">
              Observações (opcional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={action === "approve" ? "Ex: Pagamento realizado via PIX" : "Ex: Dados PIX inválidos"}
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {action === "approve" ? "Aprovar" : "Rejeitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminWithdrawals;
