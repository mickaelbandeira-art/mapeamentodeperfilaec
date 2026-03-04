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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden font-sans">
      {/* Radical Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[5%] text-[20vw] font-black text-stroke leading-none opacity-10 select-none">
          RADICAL // AEC
        </div>
        <div className="absolute bottom-[10%] right-[5%] text-[15vw] font-black text-stroke leading-none opacity-10 select-none">
          SYSTEM // 360
        </div>
      </div>

      <div className="max-w-7xl w-full relative z-10 animate-fade-in flex flex-col md:flex-row gap-0 border-4 border-foreground bg-background shadow-[20px_20px_0px_var(--primary)]">
        {/* Left Side: Massive Typography */}
        <div className="flex-1 p-8 md:p-16 border-b-4 md:border-b-0 md:border-r-4 border-foreground bg-background overflow-hidden">
          <div className="space-y-4">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 text-xs font-black uppercase tracking-widest mb-4">
              Sistema de Mapeamento AEC
            </div>
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black leading-[0.85] tracking-tighter text-foreground uppercase">
              Perfil<br />
              <span className="text-primary italic">360º</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold max-w-xl text-muted-foreground pt-8 border-t-2 border-foreground/10">
              DISC + MINDSET + VAC + <span className="underline decoration-primary decoration-4 underline-offset-4">AI CONSULTIVA</span>.<br />
              JORNADA DE AUTOCONHECIMENTO.
            </p>
          </div>
        </div>

        {/* Right Side: Actions & Info */}
        <div className="flex-[0.6] flex flex-col">
          <div className="flex-1 p-8 md:p-12 space-y-8 bg-secondary/5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-foreground bg-background brutal-card shadow-sm">
                <Zap className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-black text-sm uppercase">Comportamento</h3>
                <span className="text-[10px] opacity-50 font-bold">DISC</span>
              </div>
              <div className="p-4 border-2 border-foreground bg-background brutal-card shadow-sm">
                <Brain className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-black text-sm uppercase">Mentalidade</h3>
                <span className="text-[10px] opacity-50 font-bold">MINDSET</span>
              </div>
              <div className="p-4 border-2 border-foreground bg-background brutal-card shadow-sm">
                <MessageSquare className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-black text-sm uppercase">Comunicação</h3>
                <span className="text-[10px] opacity-50 font-bold">VAC</span>
              </div>
              <div className="p-4 border-2 border-foreground bg-background brutal-card shadow-sm">
                <Sparkles className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-black text-sm uppercase">Inteligência</h3>
                <span className="text-[10px] opacity-50 font-bold">AI</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={() => onStart('colaborador')}
                className="w-full bg-foreground text-background font-black text-xl py-6 border-b-8 border-r-8 border-primary hover:translate-x-1 hover:translate-y-1 hover:border-b-4 hover:border-r-4 transition-all flex items-center justify-center gap-4 group"
              >
                SOU COLABORADOR
                <Users className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={() => onStart('novato')}
                className="w-full bg-primary text-primary-foreground border-4 border-foreground font-black text-xl py-6 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
              >
                SOU NOVATO
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-foreground text-background flex justify-between items-center font-black text-[10px] uppercase tracking-widest leading-none">
            <span>Diagnóstico: 8-10 MIN</span>
            <span>Estágio: BETA_2026</span>
          </div>
        </div>
      </div>

      {/* Radical Footer Ticker */}
      <div className="absolute bottom-0 left-0 w-full bg-primary py-2 flex overflow-hidden whitespace-nowrap border-t-4 border-foreground">
        <div className="flex animate-marquee gap-8 font-black text-primary-foreground uppercase text-xs">
          {[...Array(10)].map((_, i) => (
            <span key={i}>Mapeamento de Perfil 360º AeC // Transformação // AI Driven // DISC // Mindset // VAC // </span>
          ))}
        </div>
      </div>
    </div>
  );
};
