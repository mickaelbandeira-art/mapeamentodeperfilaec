import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users, LineChart, Download, RotateCcw, Zap, Sparkles, MessageSquare, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { generateConsultativeInsights } from "@/lib/gemini";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ResultsScreenProps {
  scores: { D: number; I: number; S: number; C: number };
  mindset: string;
  vac: string;
  participantData: {
    registration: string;
    name: string;
    email: string;
    cpf: string;
    site: string;
    class_id?: string;
  };
  instructorData: {
    instructorName: string;
    instructorRegistration: string;
    instructorEmail: string;
    className: string;
  };
  onRestart: () => void;
}

const profileDescriptions = {
  D: {
    name: "Dominante",
    icon: Target,
    color: "var(--secondary)",
    description: "Você é orientado a resultados, direto e focado em desafios. Toma decisões rápidas e gosta de estar no controle.",
    code: "DOM"
  },
  I: {
    name: "Influente",
    icon: Users,
    color: "var(--primary)",
    description: "Você é carismático, comunicativo e inspira outros. Gosta de trabalhar em equipe e ser reconhecido.",
    code: "INF"
  },
  S: {
    name: "Estável",
    icon: LineChart,
    color: "var(--secondary)",
    description: "Você é paciente, leal e busca harmonia. Valoriza relacionamentos duradouros e ambientes estáveis.",
    code: "EST"
  },
  C: {
    name: "Conforme",
    icon: Brain,
    color: "var(--primary)",
    description: "Você é analítico, detalhista e busca perfeição. Valoriza qualidade, precisão e organização.",
    code: "CON"
  }
};

const getDiscColorCode = (type: string) => {
  switch (type) {
    case 'D': return 'var(--secondary)'; // Signal Orange
    case 'I': return 'var(--primary)';   // Acid Green
    case 'S': return 'var(--secondary)';
    case 'C': return 'var(--primary)';
    default: return 'var(--foreground)';
  }
};

export const ResultsScreen = ({ scores, mindset, vac, participantData, instructorData, onRestart }: ResultsScreenProps) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentages = {
    D: Math.round((scores.D / (total || 1)) * 100),
    I: Math.round((scores.I / (total || 1)) * 100),
    S: Math.round((scores.S / (total || 1)) * 100),
    C: Math.round((scores.C / (total || 1)) * 100)
  };

  const dominant = (Object.entries(percentages).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'D') as 'D' | 'I' | 'S' | 'C';
  const profile = (profileDescriptions as any)[dominant] || profileDescriptions.D;
  const Icon = profile.icon;
  const { user } = useAuth();

  useEffect(() => {
    const generateAndSave = async () => {
      setIsGeneratingAi(true);
      try {
        const insights = await generateConsultativeInsights({
          disc: percentages,
          mindset,
          vac,
          userName: participantData.name
        });

        if (!insights || insights.startsWith("Erro") || insights.includes("não pôde ser gerado")) {
          throw new Error(insights || "Falha ao gerar insights da IA.");
        }

        setAiInsights(insights);
        setIsSaving(true);

        await api.post("/test-results", {
          registration: participantData.registration,
          name: participantData.name,
          email: participantData.email,
          cpf: participantData.cpf,
          site: participantData.site,
          score_d: scores.D,
          score_i: scores.I,
          score_s: scores.S,
          score_c: scores.C,
          dominant_profile: dominant,
          mindset_tipo: mindset,
          vac_dominante: vac,
          insights_consultivos: insights,
          class_id: participantData.class_id || null,
          instructor_name: instructorData.instructorName,
          instructor_registration: instructorData.instructorRegistration,
          instructor_email: instructorData.instructorEmail,
          class_name: instructorData.className,
        });

      } catch (error: any) {
        console.error("Error in results process:", error);
        toast({
          title: "Aviso",
          description: error.message || "Os resultados foram gerados, mas pode ter ocorrido uma falha ao salvá-los permanentemente.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingAi(false);
        setIsSaving(false);
      }
    };

    generateAndSave();
  }, [scores, participantData, dominant, user?.id]);


  return (
    <div className="h-[100dvh] overflow-hidden p-4 bg-background font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 animate-fade-in relative z-10 gap-6">

        {/* Massive Hero Header - Compact */}
        <div className="border-b-4 border-foreground pb-4 flex flex-col md:flex-row justify-between items-end gap-4 shrink-0">
          <div className="space-y-2">
            <div className="bg-primary text-primary-foreground inline-block px-3 py-0.5 text-[10px] font-black uppercase italic tracking-widest translate-x-1">
              Assessment // Result // Final
            </div>
            <h1 className="text-[10vw] md:text-[5vw] font-black leading-[0.8] uppercase italic tracking-tighter">
              {profile.name}
            </h1>
            <p className="text-xl font-bold uppercase text-muted-foreground leading-none">
              Detectado para {participantData.name.split(' ')[0]}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-6xl font-black italic text-primary leading-none">
              {percentages[dominant]}%
            </div>
            <div className="font-black text-[8px] uppercase opacity-30 tracking-widest">Dominance Level</div>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0 pb-4">
          {/* Main Visual Data - Sidebar with internal scroll if needed */}
          <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            <Card className="p-5 border-4 border-foreground bg-background brutal-card shadow-[8px_8px_0px_var(--secondary)] shrink-0">
              <h3 className="text-lg font-black uppercase italic mb-4 border-b-2 border-foreground pb-2 flex items-center justify-between">
                DISC Matrix
                <Zap className="w-5 h-5 text-primary fill-primary" />
              </h3>
              <div className="space-y-4">
                {Object.entries(percentages).map(([type, percentage]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between items-end font-black uppercase text-[9px]">
                      <span>{(profileDescriptions as any)[type]?.name}</span>
                      <span className="text-base italic">{percentage}%</span>
                    </div>
                    <div className="h-3 border-2 border-foreground bg-background overflow-hidden font-black">
                      <div
                        className="h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getDiscColorCode(type)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 shrink-0">
              <div className="group relative border-4 border-foreground p-4 bg-primary text-primary-foreground brutal-card overflow-hidden">
                <div className="absolute top-0 right-0 text-4xl font-black italic opacity-10 pointer-events-none select-none uppercase">Mindset</div>
                <Sparkles className="w-5 h-5 mb-2 relative z-10" />
                <h4 className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Mentalidade</h4>
                <p className="text-xl font-black uppercase italic leading-none relative z-10">{mindset}</p>
              </div>

              <div className="group relative border-4 border-foreground p-4 bg-secondary text-secondary-foreground brutal-card overflow-hidden">
                <div className="absolute top-0 right-0 text-4xl font-black italic opacity-10 pointer-events-none select-none uppercase">VAC</div>
                <MessageSquare className="w-5 h-5 mb-2 relative z-10" />
                <h4 className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Canal VAC</h4>
                <p className="text-xl font-black uppercase italic leading-none relative z-10">{vac}</p>
              </div>
            </div>

            <div className="space-y-2 flex-1 min-h-0 flex flex-col">
              <div className="bg-foreground text-background p-2 font-black text-[9px] uppercase tracking-widest flex justify-between shrink-0">
                <span>Matriz de Perfil</span>
                <span>Details // 360</span>
              </div>
              <div className="grid gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
                {Object.entries(profileDescriptions).map(([key, desc]) => {
                  const isDominant = key === dominant;
                  return (
                    <div
                      key={key}
                      className={cn(
                        "border-4 border-foreground p-3 transition-all duration-300",
                        isDominant ? "bg-foreground text-background shadow-[5px_5px_0px_var(--primary)]" : "bg-background text-foreground opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 border-2", isDominant ? "border-background" : "border-foreground")}>
                          <desc.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black uppercase italic text-sm truncate">{desc.name}</h4>
                          <p className="text-[8px] font-bold leading-tight uppercase line-clamp-2 mt-0.5">
                            {desc.description}
                          </p>
                        </div>
                        <div className="ml-auto text-xl font-black italic shrink-0">
                          {percentages[key as keyof typeof percentages]}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Insights - Contained and scrollable */}
          <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
            <div className="flex-1 border-4 border-foreground bg-background p-6 md:p-8 relative overflow-hidden flex flex-col shadow-[10px_10px_0px_var(--foreground)] min-h-0">
              {/* Background Label */}
              <div className="absolute top-0 right-0 text-[8vw] font-black italic opacity-5 pointer-events-none select-none -mr-8 -mt-8 uppercase">
                Insights
              </div>

              <div className="relative z-10 flex flex-col h-full min-h-0">
                <div className="flex items-center gap-4 mb-8 shrink-0">
                  <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center border-4 border-foreground shrink-0">
                    <Brain className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic leading-none tracking-tighter">
                    IA Consultiva<br />
                    <span className="text-primary">Estratégica</span>
                  </h3>
                </div>

                {isGeneratingAi ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="text-xl font-black uppercase italic animate-pulse">Cruzando Dados...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar min-h-0">
                    {aiInsights && aiInsights.length > 0 ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {String(aiInsights).split('\n').map((line, i) => {
                          if (line.trim() === '') return null;
                          if (line.startsWith('#')) {
                            return <h3 key={i} className="text-xl font-black uppercase italic border-l-4 border-primary pl-3 mt-4 mb-2">{line.replace(/^#+\s*/, '')}</h3>;
                          }
                          if (line.startsWith('-')) {
                            return (
                              <div key={i} className="flex gap-3 items-start group">
                                <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-primary group-hover:translate-x-1 transition-transform" />
                                <p className="font-bold text-xs md:text-sm uppercase leading-tight italic">{line.replace(/^-/, '')}</p>
                              </div>
                            );
                          }
                          return <p key={i} className="text-xs font-medium leading-relaxed opacity-70">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-20">
                        <p className="text-4xl font-black uppercase italic">No Data</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <button
                onClick={onRestart}
                className="flex-1 border-4 border-foreground bg-background p-4 font-black uppercase italic hover:bg-secondary hover:text-secondary-foreground transition-all shadow-[5px_5px_0px_var(--foreground)] active:shadow-none active:translate-x-1 active:translate-y-1 text-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </div>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-[2] border-4 border-foreground bg-foreground text-background p-4 font-black uppercase italic hover:bg-primary hover:text-primary-foreground transition-all shadow-[5px_5px_0px_var(--secondary)] active:shadow-none active:translate-x-1 active:translate-y-1 text-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Resultado
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Meta - Fixed footer */}
        <div className="pt-4 border-t-4 border-foreground flex justify-between items-center gap-4 text-[8px] font-black uppercase opacity-30 italic shrink-0 pb-2">
          <div className="flex gap-4">
            <span>Turma: {instructorData.className}</span>
            <span>Instrutor: {instructorData.instructorName}</span>
          </div>
          <div className="bg-foreground text-background px-2 py-0.5">
            AeC // ASSESSMENT // v2.0
          </div>
        </div>
      </div>
    </div>
  );
};
