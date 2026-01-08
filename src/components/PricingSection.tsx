import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Iniciante",
    price: "5",
    credits: "50",
    features: [
      "50 créditos para jogar",
      "Acesso a jogos básicos",
      "Roleta Clássica",
      "Slots Populares",
      "Suporte via chat",
    ],
    popular: false,
    buttonVariant: "outline" as const,
  },
  {
    name: "Popular",
    price: "10",
    credits: "120",
    features: [
      "120 créditos para jogar",
      "Acesso a todos os jogos",
      "Roleta Premium + VIP",
      "Blackjack e Poker",
      "Bônus de 20%",
      "Suporte prioritário",
    ],
    popular: true,
    buttonVariant: "gold" as const,
  },
  {
    name: "VIP",
    price: "25",
    credits: "350",
    features: [
      "350 créditos para jogar",
      "Acesso VIP exclusivo",
      "Todos os jogos + Novidades",
      "Bônus de 40%",
      "Cashback semanal",
      "Gerente de conta dedicado",
    ],
    popular: false,
    buttonVariant: "emerald" as const,
  },
];

const PricingSection = () => {
  return (
    <section id="precos" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider mb-3">
            Preços
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Escolha seu <span className="text-gradient-gold">Plano</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quanto mais você deposita, mais créditos você recebe. 
            Aproveite nossos bônus exclusivos!
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative animate-fade-in ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-[hsl(45,100%,50%)] to-[hsl(35,100%,45%)] text-[hsl(220,20%,6%)] text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    Mais Popular
                  </div>
                </div>
              )}
              
              <div className={`h-full rounded-2xl p-6 md:p-8 border transition-all duration-300 ${
                plan.popular 
                  ? 'glass-card border-primary/50 shadow-xl shadow-primary/10' 
                  : 'glass-card border-border/50 hover:border-primary/30'
              }`}>
                {/* Plan Name */}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-muted-foreground text-lg">R$</span>
                  <span className="font-display text-5xl font-bold text-gradient-gold">
                    {plan.price}
                  </span>
                </div>
                
                {/* Credits */}
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border/50">
                  <Zap className="w-5 h-5 text-secondary" />
                  <span className="text-foreground font-semibold">{plan.credits} créditos</span>
                </div>
                
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Button 
                  variant={plan.buttonVariant} 
                  size="lg" 
                  className="w-full"
                >
                  Depositar Agora
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
