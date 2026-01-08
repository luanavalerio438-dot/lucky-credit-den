import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GamesSection />
        <HowItWorksSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
