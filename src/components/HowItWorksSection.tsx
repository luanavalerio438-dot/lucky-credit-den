import { UserPlus, CreditCard, Gamepad2, Wallet } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Crie sua Conta",
    description: "Cadastro rápido e simples em menos de 1 minuto. Apenas email e senha.",
    color: "primary",
  },
  {
    icon: CreditCard,
    title: "Faça seu Depósito",
    description: "Depósito mínimo de R$ 5,00 via PIX. Créditos liberados instantaneamente.",
    color: "secondary",
  },
  {
    icon: Gamepad2,
    title: "Escolha e Jogue",
    description: "Acesse +50 jogos exclusivos: roleta, blackjack, poker, slots e muito mais.",
    color: "accent",
  },
  {
    icon: Wallet,
    title: "Saque seus Ganhos",
    description: "Saque via PIX em até 5 minutos. Sem taxas, sem burocracia.",
    color: "primary",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-32 relative bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-secondary font-semibold uppercase tracking-wider mb-3">
            Como Funciona
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Comece em <span className="text-gradient-emerald">4 Passos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Processo simples e rápido para você começar a jogar agora mesmo.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="glass-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(45,100%,50%)] to-[hsl(35,100%,45%)] flex items-center justify-center font-display font-bold text-[hsl(220,20%,6%)] text-sm">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-${step.color}/10 flex items-center justify-center mb-4`}>
                  <step.icon className={`w-7 h-7 text-${step.color}`} />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
