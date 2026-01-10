import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import AuthModal from "./AuthModal";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import { Coins, Menu, X, LogOut, Wallet, ArrowDownToLine, History } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const openLogin = () => {
    setAuthModalTab("login");
    setShowAuthModal(true);
  };

  const openSignup = () => {
    setAuthModalTab("signup");
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(45,100%,50%)] to-[hsl(35,100%,45%)] flex items-center justify-center">
                <Coins className="w-6 h-6 text-[hsl(220,20%,6%)]" />
              </div>
              <span className="font-display text-xl md:text-2xl font-bold text-gradient-gold">
                LuckySpin
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#jogos" className="text-foreground/80 hover:text-primary transition-colors font-medium">
                Jogos
              </a>
              <a href="#como-funciona" className="text-foreground/80 hover:text-primary transition-colors font-medium">
                Como Funciona
              </a>
              <a href="#precos" className="text-foreground/80 hover:text-primary transition-colors font-medium">
                Preços
              </a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <button 
                    onClick={() => navigate("/historico")}
                    className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">{profile?.credits || 0}</span>
                  </button>
                  <Button variant="emerald" size="lg" onClick={() => setShowDepositModal(true)}>
                    <Wallet className="w-4 h-4" />
                    Depositar
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setShowWithdrawModal(true)}>
                    <ArrowDownToLine className="w-4 h-4" />
                    Sacar
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/historico")} title="Histórico">
                    <History className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={openLogin}>Entrar</Button>
                  <Button variant="gold" size="lg" onClick={openSignup}>
                    Começar Agora
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-6 animate-fade-in">
              <nav className="flex flex-col gap-4 mb-6">
                <a href="#jogos" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                  Jogos
                </a>
                <a href="#como-funciona" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                  Como Funciona
                </a>
                <a href="#precos" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                  Preços
                </a>
              </nav>
              
              {user ? (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate("/historico")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-card hover:border-primary/50 transition-colors"
                  >
                    <Coins className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground text-lg">{profile?.credits || 0} créditos</span>
                  </button>
                  <Button variant="emerald" size="lg" className="w-full" onClick={() => setShowDepositModal(true)}>
                    <Wallet className="w-4 h-4" />
                    Depositar
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => setShowWithdrawModal(true)}>
                    <ArrowDownToLine className="w-4 h-4" />
                    Sacar
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => navigate("/historico")}>
                    <History className="w-4 h-4" />
                    Histórico
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="ghost" className="w-full" onClick={openLogin}>Entrar</Button>
                  <Button variant="gold" size="lg" className="w-full" onClick={openSignup}>
                    Começar Agora
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultTab={authModalTab}
      />
      <DepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
      <WithdrawModal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)} 
      />
    </>
  );
};

export default Header;
