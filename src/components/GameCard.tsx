import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Star, Users, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface GameCardProps {
  title: string;
  image: string;
  category: string;
  rating: number;
  players: string;
  isHot?: boolean;
  isNew?: boolean;
  route?: string;
  isPlayable?: boolean;
}

const GameCard = ({ title, image, category, rating, players, isHot, isNew, route, isPlayable }: GameCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlay = () => {
    if (route && isPlayable) {
      navigate(route);
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card border border-border/50 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isHot && (
            <Badge className="bg-destructive text-destructive-foreground border-0">
              🔥 Hot
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-secondary text-secondary-foreground border-0">
              ✨ Novo
            </Badge>
          )}
        </div>

        {/* Playable indicator */}
        {!isPlayable && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/80 text-muted-foreground text-xs">
              <Lock className="w-3 h-3" />
              Em breve
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant={isPlayable ? "gold" : "glass"} 
            size="lg" 
            className="rounded-full w-16 h-16 p-0"
            onClick={handlePlay}
            disabled={!isPlayable}
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {category}
        </p>
        <h3 className="font-display text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">{players}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
