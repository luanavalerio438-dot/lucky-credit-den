import { Coins, Mail, MessageCircle, Shield, Clock, CreditCard } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(45,100%,50%)] to-[hsl(35,100%,45%)] flex items-center justify-center">
                <Coins className="w-6 h-6 text-[hsl(220,20%,6%)]" />
              </div>
              <span className="font-display text-xl font-bold text-gradient-gold">
                LuckySpin
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              A melhor plataforma de jogos online do Brasil. 
              Diversão garantida com segurança e transparência.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:bg-primary/10 transition-colors">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Jogos</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Roleta</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Blackjack</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Poker</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Slots</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Dados</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Central de Ajuda</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Termos de Uso</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Política de Privacidade</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Jogo Responsável</a></li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Garantias</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground text-sm">Pagamentos Seguros</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground text-sm">Saque em 5 minutos</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-accent" />
                <span className="text-muted-foreground text-sm">PIX Instantâneo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © 2026 LuckySpin. Todos os direitos reservados. Jogue com responsabilidade.
          </p>
          <p className="text-muted-foreground text-xs text-center md:text-right">
            +18 | Este site é destinado apenas para maiores de 18 anos.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
