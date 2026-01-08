import { Button } from "@/components/ui/button";
import { Coins, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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
            <Button variant="ghost">Entrar</Button>
            <Button variant="gold" size="lg">
              Começar Agora
            </Button>
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
            <div className="flex flex-col gap-3">
              <Button variant="ghost" className="w-full">Entrar</Button>
              <Button variant="gold" size="lg" className="w-full">
                Começar Agora
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
