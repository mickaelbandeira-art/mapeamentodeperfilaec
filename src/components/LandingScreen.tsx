import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users, LineChart, Sparkles } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { DotPattern } from "./DotPattern";

interface LandingScreenProps {
  onStart: () => void;
}

export const LandingScreen = ({ onStart }: LandingScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      <WaveBackground />
      <DotPattern position="top-right" />
      <DotPattern position="bottom-left" />
      
      <Card className="max-w-5xl w-full p-6 sm:p-8 md:p-12 lg:p-16 glass-card shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center space-y-6 md:space-y-8">
          <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 mb-4 animate-float shadow-lg glow-purple">
            <Brain className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gradient-hero leading-tight px-4">
            Mapeamento de Perfil DISC
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Descubra seu perfil comportamental através de uma jornada interativa. 
            <span className="text-gradient-primary font-semibold"> 30 perguntas </span> 
            que revelam sua essência.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-8 md:my-12 px-2">
            <div className="p-4 sm:p-6 rounded-xl glass-card-hover glow-hover-purple group">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-disc-dominance transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-base sm:text-lg text-disc-dominance mb-1">Dominante</h3>
              <p className="text-xs sm:text-sm text-gray-400">Resultados</p>
            </div>
            
            <div className="p-4 sm:p-6 rounded-xl glass-card-hover glow-hover-purple group">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-disc-influence transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-base sm:text-lg text-disc-influence mb-1">Influente</h3>
              <p className="text-xs sm:text-sm text-gray-400">Pessoas</p>
            </div>
            
            <div className="p-4 sm:p-6 rounded-xl glass-card-hover glow-hover-purple group">
              <LineChart className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-disc-stability transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-base sm:text-lg text-disc-stability mb-1">Estável</h3>
              <p className="text-xs sm:text-sm text-gray-400">Harmonia</p>
            </div>
            
            <div className="p-4 sm:p-6 rounded-xl glass-card-hover glow-hover-purple group">
              <Brain className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-disc-conformity transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-base sm:text-lg text-disc-conformity mb-1">Conforme</h3>
              <p className="text-xs sm:text-sm text-gray-400">Precisão</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 md:pt-6">
            <Button 
              onClick={onStart} 
              size="lg"
              className="text-base sm:text-lg md:text-xl px-8 sm:px-12 py-6 sm:py-7 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 shadow-2xl glow-purple hover:scale-105 transition-all duration-300 font-bold"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Iniciar Teste
            </Button>
            
            <p className="text-sm sm:text-base text-gray-400 flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl">⏱️</span> 
              Tempo estimado: 5-7 minutos
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
