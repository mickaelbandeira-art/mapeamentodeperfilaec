import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users, LineChart, Sparkles, Zap, MessageSquare, Cpu } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { DotPattern } from "./DotPattern";

interface LandingScreenProps {
  onStart: (type: 'colaborador' | 'novato') => void;
}

export const LandingScreen = ({ onStart }: LandingScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-hidden bg-[#0A0A0B]">
      <WaveBackground />
      <DotPattern position="top-right" />
      <DotPattern position="bottom-left" />

      <Card className="max-w-5xl w-full p-6 sm:p-8 md:p-12 lg:p-16 glass-card border-white/10 shadow-2xl relative z-10 animate-fade-in overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-all duration-1000" />

        <div className="text-center space-y-6 md:space-y-8 relative z-10">
          <div className="inline-flex p-6 rounded-[2rem] bg-gradient-to-br from-purple-600 via-fuchsia-600 to-blue-600 mb-4 animate-float shadow-2xl glow-purple border border-white/20">
            <Cpu className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>

          <div className="space-y-2">
            <span className="text-purple-400 font-bold uppercase tracking-[0.3em] text-xs sm:text-sm">Sistema Inteligente AeC</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight">
              Mapeamento de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">Perfil 360º</span>
            </h1>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Uma jornada consultiva integrando <span className="text-white font-bold">DISC</span>, <span className="text-white font-bold">Mindset</span> e <span className="text-white font-bold">VAC</span> com interpretação de <span className="text-purple-400 font-bold">Inteligência Artificial</span>.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-8 md:my-12 px-2">
            <div className="p-4 sm:p-6 rounded-2xl glass-card border-white/5 hover:border-purple-500/30 transition-all duration-500 group">
              <Zap className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white mb-1">DISC</h3>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Comportamento</p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl glass-card border-white/5 hover:border-purple-500/30 transition-all duration-500 group">
              <Brain className="w-8 h-8 mx-auto mb-3 text-fuchsia-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white mb-1">Mindset</h3>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Mentalidade</p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl glass-card border-white/5 hover:border-purple-500/30 transition-all duration-500 group">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white mb-1">VAC</h3>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Comunicação</p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl glass-card border-white/5 hover:border-purple-500/30 transition-all duration-500 group">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white mb-1">IA</h3>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Consultiva</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
            <Button
              onClick={() => onStart('colaborador')}
              size="lg"
              className="group relative overflow-hidden rounded-2xl px-10 py-8 bg-white text-black hover:text-white transition-all duration-500 font-black text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 flex items-center">
                <Users className="w-5 h-5 mr-3" />
                SOU COLABORADOR
              </span>
            </Button>

            <Button
              onClick={() => onStart('novato')}
              size="lg"
              variant="outline"
              className="rounded-2xl px-10 py-8 bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 text-white transition-all duration-500 font-black text-lg"
            >
              <span className="flex items-center">
                <Sparkles className="w-5 h-5 mr-3 text-purple-400" />
                SOU NOVATO
              </span>
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 mt-8">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SISTEMA ATUALIZADO 2024
            </p>
            <p className="text-gray-400 text-sm italic">
              Aprox. 8-10 minutos para o diagnóstico completo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
