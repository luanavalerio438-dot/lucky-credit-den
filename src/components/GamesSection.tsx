import GameCard from "./GameCard";
import gameRoulette from "@/assets/game-roulette.jpg";
import gameBlackjack from "@/assets/game-blackjack.jpg";
import gameSlots from "@/assets/game-slots.jpg";
import gamePoker from "@/assets/game-poker.jpg";
import gameDice from "@/assets/game-dice.jpg";
import gameBaccarat from "@/assets/game-baccarat.jpg";

const games = [
  {
    title: "Roleta Premium",
    image: gameRoulette,
    category: "Roleta",
    rating: 4.9,
    players: "2.5k",
    isHot: true,
  },
  {
    title: "Blackjack VIP",
    image: gameBlackjack,
    category: "Cartas",
    rating: 4.8,
    players: "1.8k",
    isNew: true,
  },
  {
    title: "Mega Slots 777",
    image: gameSlots,
    category: "Slots",
    rating: 4.7,
    players: "3.2k",
    isHot: true,
  },
  {
    title: "Texas Hold'em",
    image: gamePoker,
    category: "Poker",
    rating: 4.9,
    players: "1.5k",
  },
  {
    title: "Dados da Sorte",
    image: gameDice,
    category: "Dados",
    rating: 4.6,
    players: "980",
    isNew: true,
  },
  {
    title: "Baccarat Gold",
    image: gameBaccarat,
    category: "Cartas",
    rating: 4.8,
    players: "1.2k",
  },
];

const GamesSection = () => {
  return (
    <section id="jogos" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider mb-3">
            Nossos Jogos
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Escolha Seu <span className="text-gradient-gold">Favorito</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore nossa coleção de jogos exclusivos. De roleta clássica a slots modernos, 
            temos algo para todos os gostos.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {games.map((game, index) => (
            <div 
              key={game.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <GameCard {...game} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
