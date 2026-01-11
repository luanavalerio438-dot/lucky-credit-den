import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Coins,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  Wallet,
  ArrowDownToLine,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Shield,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  totalUsers: number;
  totalCreditsInCirculation: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalGamesPlayed: number;
  totalBets: number;
  totalWins: number;
  houseProfitCredits: number;
  pendingWithdrawals: number;
  pendingWithdrawalsAmount: number;
  todayNewUsers: number;
  todayDeposits: number;
  todayGames: number;
  last7DaysGames: number;
}

interface GameStats {
  game: string;
  count: number;
  totalBets: number;
  totalWins: number;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<{
    deposits: number;
    withdrawals: number;
    games: number;
  }>({ deposits: 0, withdrawals: 0, games: 0 });
  const [loading, setLoading] = useState(true);

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
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all profiles for user stats
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Fetch all game sessions
      const { data: gameSessions, error: gamesError } = await supabase
        .from("game_sessions")
        .select("*");

      if (gamesError) throw gamesError;

      // Fetch pending withdrawals
      const { data: pendingWithdrawals, error: withdrawalsError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("status", "pending");

      if (withdrawalsError) throw withdrawalsError;

      // Fetch all withdrawals for total
      const { data: allWithdrawals, error: allWithdrawalsError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("status", "approved");

      if (allWithdrawalsError) throw allWithdrawalsError;

      // Calculate today's stats
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      const todayProfiles = (profiles || []).filter(
        (p) => p.created_at >= todayStart && p.created_at <= todayEnd
      );

      const todayGames = (gameSessions || []).filter(
        (g) => g.created_at >= todayStart && g.created_at <= todayEnd
      );

      // Last 7 days games
      const last7DaysStart = startOfDay(subDays(today, 7)).toISOString();
      const last7DaysGames = (gameSessions || []).filter(
        (g) => g.created_at >= last7DaysStart
      );

      // Calculate game stats by game type
      const gameStatsMap = new Map<string, GameStats>();
      (gameSessions || []).forEach((session) => {
        const existing = gameStatsMap.get(session.game) || {
          game: session.game,
          count: 0,
          totalBets: 0,
          totalWins: 0,
        };
        existing.count += 1;
        existing.totalBets += session.bet_amount || 0;
        existing.totalWins += session.win_amount || 0;
        gameStatsMap.set(session.game, existing);
      });

      setGameStats(Array.from(gameStatsMap.values()));

      // Calculate totals
      const totalCreditsInCirculation = (profiles || []).reduce(
        (acc, p) => acc + (p.credits || 0),
        0
      );
      const totalDeposited = (profiles || []).reduce(
        (acc, p) => acc + (p.total_deposited || 0),
        0
      );
      const totalWithdrawn = (allWithdrawals || []).reduce(
        (acc, w) => acc + Number(w.amount || 0),
        0
      );
      const totalBets = (gameSessions || []).reduce(
        (acc, g) => acc + (g.bet_amount || 0),
        0
      );
      const totalWins = (gameSessions || []).reduce(
        (acc, g) => acc + (g.win_amount || 0),
        0
      );
      const houseProfitCredits = totalBets - totalWins;
      const pendingAmount = (pendingWithdrawals || []).reduce(
        (acc, w) => acc + Number(w.amount || 0),
        0
      );

      // Calculate today deposits from transactions or profiles
      const todayDeposits = todayProfiles.reduce(
        (acc, p) => acc + (p.total_deposited || 0),
        0
      );

      setStats({
        totalUsers: (profiles || []).length,
        totalCreditsInCirculation,
        totalDeposited,
        totalWithdrawn,
        totalGamesPlayed: (gameSessions || []).length,
        totalBets,
        totalWins,
        houseProfitCredits,
        pendingWithdrawals: (pendingWithdrawals || []).length,
        pendingWithdrawalsAmount: pendingAmount,
        todayNewUsers: todayProfiles.length,
        todayDeposits,
        todayGames: todayGames.length,
        last7DaysGames: last7DaysGames.length,
      });

      setRecentActivity({
        deposits: todayDeposits,
        withdrawals: (pendingWithdrawals || []).length,
        games: todayGames.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGameLabel = (game: string) => {
    const labels: Record<string, string> = {
      roulette: "Roleta",
      slots: "Caça-níquel",
      blackjack: "Blackjack",
      poker: "Poker",
      dice: "Dados",
      baccarat: "Baccarat",
    };
    return labels[game] || game;
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

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/saques")}>
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Gerenciar Saques
            </Button>
          </div>
          <p className="text-muted-foreground">
            Visão geral do sistema • {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Usuários
                  </CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                  <p className="text-xs text-green-400">+{stats.todayNewUsers} hoje</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Créditos em Circulação
                  </CardTitle>
                  <Coins className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalCreditsInCirculation.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">créditos ativos</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Depositado
                  </CardTitle>
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {stats.totalDeposited.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">créditos comprados</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Sacado
                  </CardTitle>
                  <ArrowDownToLine className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">
                    R$ {stats.totalWithdrawn.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">pagos aos usuários</p>
                </CardContent>
              </Card>
            </div>

            {/* Games & Profit Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Jogadas
                  </CardTitle>
                  <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalGamesPlayed.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-400">+{stats.todayGames} hoje</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Apostado
                  </CardTitle>
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalBets.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">créditos apostados</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Ganho
                  </CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalWins.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">créditos pagos</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Lucro da Casa
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      stats.houseProfitCredits >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {stats.houseProfitCredits >= 0 ? "+" : ""}
                    {stats.houseProfitCredits.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">créditos de lucro</p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Withdrawals Alert */}
            {stats.pendingWithdrawals > 0 && (
              <Card className="bg-yellow-500/10 border-yellow-500/50 mb-8">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="font-medium text-foreground">
                        {stats.pendingWithdrawals} saques pendentes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total: R$ {stats.pendingWithdrawalsAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/admin/saques")}>
                    Revisar Saques
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Games Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Estatísticas por Jogo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gameStats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma jogada registrada
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {gameStats.map((game) => {
                        const profit = game.totalBets - game.totalWins;
                        return (
                          <div
                            key={game.game}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {getGameLabel(game.game)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {game.count} jogadas
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                Apostado: {game.totalBets.toLocaleString()}
                              </p>
                              <p
                                className={`font-medium ${
                                  profit >= 0 ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                Lucro: {profit >= 0 ? "+" : ""}
                                {profit.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-foreground">Entrada (Depósitos)</span>
                      </div>
                      <span className="font-bold text-green-400">
                        {stats.totalDeposited.toLocaleString()} créditos
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-foreground">Saída (Saques)</span>
                      </div>
                      <span className="font-bold text-red-400">
                        R$ {stats.totalWithdrawn.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Lucro dos Jogos</span>
                      </div>
                      <span
                        className={`font-bold ${
                          stats.houseProfitCredits >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {stats.houseProfitCredits >= 0 ? "+" : ""}
                        {stats.houseProfitCredits.toLocaleString()} créditos
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-foreground">Saques Pendentes</span>
                      </div>
                      <span className="font-bold text-yellow-400">
                        R$ {stats.pendingWithdrawalsAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Atividade Recente (Últimos 7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-foreground">
                      {stats.last7DaysGames}
                    </p>
                    <p className="text-sm text-muted-foreground">jogadas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <Users className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-foreground">{stats.todayNewUsers}</p>
                    <p className="text-sm text-muted-foreground">novos usuários hoje</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-2xl font-bold text-foreground">
                      {stats.pendingWithdrawals}
                    </p>
                    <p className="text-sm text-muted-foreground">saques aguardando</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
