import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateCredits } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Coins, Minus, Plus, RotateCw } from "lucide-react";

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

type BetType = "red" | "black" | "green" | "odd" | "even" | number;

const Roulette = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const updateCredits = useUpdateCredits();
  const { toast } = useToast();

  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const getNumberColor = (num: number): "red" | "black" | "green" => {
    if (num === 0) return "green";
    return RED_NUMBERS.includes(num) ? "red" : "black";
  };

  const checkWin = (bet: BetType, resultNum: number): boolean => {
    if (typeof bet === "number") return bet === resultNum;
    if (bet === "green") return resultNum === 0;
    if (bet === "red") return RED_NUMBERS.includes(resultNum) && resultNum !== 0;
    if (bet === "black") return !RED_NUMBERS.includes(resultNum) && resultNum !== 0;
    if (bet === "odd") return resultNum % 2 === 1 && resultNum !== 0;
    if (bet === "even") return resultNum % 2 === 0 && resultNum !== 0;
    return false;
  };

  const getMultiplier = (bet: BetType): number => {
    if (typeof bet === "number") return bet === 0 ? 35 : 35;
    if (bet === "green") return 35;
    return 2;
  };

  const spin = useCallback(async () => {
    if (!user || !profile || selectedBet === null) return;
    if (profile.credits < betAmount) {
      toast({
        title: "Créditos insuficientes",
        description: "Faça um depósito para continuar jogando.",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Deduct bet
    try {
      await updateCredits.mutateAsync({ amount: betAmount, type: "subtract" });
    } catch (error) {
      setIsSpinning(false);
      return;
    }

    // Generate random result
    const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winningNumber = ROULETTE_NUMBERS[randomIndex];
    
    // Calculate rotation
    const segmentAngle = 360 / ROULETTE_NUMBERS.length;
    const targetRotation = 360 * 5 + (randomIndex * segmentAngle);
    setRotation(prev => prev + targetRotation);

    // Wait for animation
    setTimeout(async () => {
      setResult(winningNumber);
      setIsSpinning(false);

      const won = checkWin(selectedBet, winningNumber);
      const multiplier = getMultiplier(selectedBet);
      const winAmount = won ? betAmount * multiplier : 0;

      // Record game session
      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game: "roulette",
        bet_amount: betAmount,
        result: won ? "win" : "lose",
        win_amount: winAmount,
        details: { bet: selectedBet, result: winningNumber }
      });

      if (won) {
        await updateCredits.mutateAsync({ amount: winAmount, type: "add" });
        
        // Update total won
        await supabase
          .from("profiles")
          .update({ total_won: (profile.total_won || 0) + winAmount })
          .eq("user_id", user.id);

        toast({
          title: `🎉 Você ganhou ${winAmount} créditos!`,
          description: `O número ${winningNumber} caiu!`,
        });
      } else {
        // Update total lost
        await supabase
          .from("profiles")
          .update({ total_lost: (profile.total_lost || 0) + betAmount })
          .eq("user_id", user.id);

        toast({
          title: "Não foi dessa vez...",
          description: `O número ${winningNumber} caiu. Tente novamente!`,
          variant: "destructive",
        });
      }

      refetchProfile();
    }, 4000);
  }, [user, profile, selectedBet, betAmount, updateCredits, toast, refetchProfile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Faça login para jogar</h1>
          <Button variant="gold" onClick={() => navigate("/")}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="font-display text-xl text-gradient-gold">Roleta Premium</h1>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <Coins className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">{profile?.credits || 0}</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Roulette Wheel */}
          <div className="flex justify-center mb-8">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Wheel */}
              <div
                className="w-full h-full rounded-full border-8 border-primary/50 overflow-hidden shadow-2xl shadow-primary/20 transition-transform duration-[4000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="w-full h-full relative">
                  {ROULETTE_NUMBERS.map((num, i) => {
                    const angle = (360 / ROULETTE_NUMBERS.length) * i;
                    const color = getNumberColor(num);
                    return (
                      <div
                        key={i}
                        className="absolute w-full h-full origin-center"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div
                          className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1/2 flex items-start justify-center pt-2 text-xs font-bold ${
                            color === "red" ? "bg-red-600" : color === "green" ? "bg-emerald-600" : "bg-gray-900"
                          } text-white`}
                          style={{
                            clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)"
                          }}
                        >
                          {num}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-primary z-10" 
                   style={{ borderTopWidth: '24px' }}/>
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(45,100%,50%)] to-[hsl(35,100%,45%)] flex items-center justify-center shadow-lg">
                <span className="font-display text-2xl font-bold text-background">
                  {result !== null ? result : "?"}
                </span>
              </div>
            </div>
          </div>

          {/* Bet Amount */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-muted-foreground">Aposta:</span>
            <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setBetAmount(Math.max(5, betAmount - 5))}
                disabled={isSpinning}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-bold text-foreground w-16 text-center">{betAmount}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setBetAmount(betAmount + 5)}
                disabled={isSpinning}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Betting Options */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button
              variant={selectedBet === "red" ? "gold" : "outline"}
              className="h-14 bg-red-600/20 border-red-600/50 hover:bg-red-600/40"
              onClick={() => setSelectedBet("red")}
              disabled={isSpinning}
            >
              Vermelho (2x)
            </Button>
            <Button
              variant={selectedBet === "green" ? "gold" : "outline"}
              className="h-14 bg-emerald-600/20 border-emerald-600/50 hover:bg-emerald-600/40"
              onClick={() => setSelectedBet("green")}
              disabled={isSpinning}
            >
              Zero (35x)
            </Button>
            <Button
              variant={selectedBet === "black" ? "gold" : "outline"}
              className="h-14 bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50"
              onClick={() => setSelectedBet("black")}
              disabled={isSpinning}
            >
              Preto (2x)
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button
              variant={selectedBet === "odd" ? "gold" : "outline"}
              className="h-12"
              onClick={() => setSelectedBet("odd")}
              disabled={isSpinning}
            >
              Ímpar (2x)
            </Button>
            <Button
              variant={selectedBet === "even" ? "gold" : "outline"}
              className="h-12"
              onClick={() => setSelectedBet("even")}
              disabled={isSpinning}
            >
              Par (2x)
            </Button>
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-8">
            {[0, ...Array.from({ length: 36 }, (_, i) => i + 1)].map((num) => {
              const color = getNumberColor(num);
              return (
                <Button
                  key={num}
                  variant={selectedBet === num ? "gold" : "outline"}
                  className={`h-10 text-sm font-bold ${
                    color === "red"
                      ? "bg-red-600/30 border-red-600/50 hover:bg-red-600/50"
                      : color === "green"
                      ? "bg-emerald-600/30 border-emerald-600/50 hover:bg-emerald-600/50"
                      : "bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50"
                  }`}
                  onClick={() => setSelectedBet(num)}
                  disabled={isSpinning}
                >
                  {num}
                </Button>
              );
            })}
          </div>

          {/* Spin Button */}
          <Button
            variant="gold"
            size="xl"
            className="w-full"
            onClick={spin}
            disabled={isSpinning || selectedBet === null}
          >
            {isSpinning ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                Girando...
              </>
            ) : (
              <>
                <RotateCw className="w-5 h-5" />
                Girar Roleta
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Roulette;
