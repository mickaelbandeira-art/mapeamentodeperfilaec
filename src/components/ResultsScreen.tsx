import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users, LineChart, Download, RotateCcw, Zap, Sparkles, MessageSquare, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { generateConsultativeInsights } from "@/lib/gemini";
import { useAuth } from "@/hooks/useAuth";

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
        const { error } = await supabase
          .from("test_results")
          .insert({
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
            user_id: user?.id || null,
          });

        if (error) throw error;
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
    <div className="min-h-screen p-4 py-8 bg-background font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10">

        {/* Massive Hero Header */}
        <div className="border-b-8 border-foreground pb-8 flex flex-col md:flex-row justify-between items-end gap-8 overflow-hidden">
          <div className="space-y-4">
            <div className="bg-primary text-primary-foreground inline-block px-4 py-1 text-xs font-black uppercase italic tracking-widest translate-x-1">
              Assessment // Result // Final
            </div>
            <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.8] uppercase italic italic tracking-tighter">
              {profile.name}
            </h1>
            <p className="text-2xl font-bold uppercase text-muted-foreground leading-none">
              Perfis Dominantes Detectados para {participantData.name.split(' ')[0]}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-8xl font-black italic text-primary leading-none">
              {percentages[dominant]}%
            </div>
            <div className="font-black text-xs uppercase opacity-30">Dominance Level</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Visual Data */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 border-4 border-foreground bg-background brutal-card shadow-[10px_10px_0px_var(--secondary)]">
              <h3 className="text-2xl font-black uppercase italic mb-8 border-b-4 border-foreground pb-2 flex items-center justify-between">
                DISC Matrix
                <Zap className="w-6 h-6 text-primary fill-primary" />
              </h3>
              <div className="space-y-8">
                {Object.entries(percentages).map(([type, percentage]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-end font-black uppercase text-xs">
                      <span>{(profileDescriptions as any)[type]?.name}</span>
                      <span className="text-xl italic">{percentage}%</span>
                    </div>
                    <div className="h-6 border-4 border-foreground bg-background overflow-hidden">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="border-4 border-foreground p-6 bg-primary text-primary-foreground rotate-[-2deg] brutal-card">
                <Sparkles className="w-8 h-8 mb-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">Mindset</h4>
                <p className="text-xl font-black uppercase italic leading-none">{mindset}</p>
              </div>
              <div className="border-4 border-foreground p-6 bg-secondary text-secondary-foreground rotate-[2deg] brutal-card">
                <MessageSquare className="w-8 h-8 mb-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">Canal VAC</h4>
                <p className="text-xl font-black uppercase italic leading-none">{vac}</p>
              </div>
            </div>

            <div className="border-4 border-foreground p-8 bg-foreground text-background">
              <Icon className="w-12 h-12 mb-6" />
              <p className="font-bold text-sm leading-tight uppercase">
                {profile.description}
              </p>
            </div>
          </div>

          {/* AI Insights & Actions */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex-1 border-4 border-foreground bg-background p-8 md:p-12 relative overflow-hidden flex flex-col shadow-[15px_15px_0px_var(--foreground)]">
              {/* Background Label */}
              <div className="absolute top-0 right-0 text-[10vw] font-black italic opacity-5 pointer-events-none select-none -mr-10 -mt-10 uppercase">
                Insights
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-16 h-16 bg-foreground text-background flex items-center justify-center border-4 border-foreground shrink-0">
                    <Brain className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl font-black uppercase italic italic leading-none tracking-tighter">
                    IA Consultiva<br />
                    <span className="text-primary">Estratégica</span>
                  </h3>
                </div>

                {isGeneratingAi ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="text-2xl font-black uppercase italic animate-pulse">Cruzando Dados...</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Analisando DISC + Mindset + VAC</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto pr-4 custom-scrollbar">
                    {aiInsights && aiInsights.length > 0 ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {String(aiInsights).split('\n').map((line, i) => {
                          if (line.trim() === '') return null;
                          if (line.startsWith('#')) {
                            return <h3 key={i} className="text-2xl font-black uppercase italic border-l-8 border-primary pl-4 mt-8 mb-4">{line.replace(/^#+\s*/, '')}</h3>;
                          }
                          if (line.startsWith('-')) {
                            return (
                              <div key={i} className="flex gap-4 items-start group">
                                <ArrowRight className="w-5 h-5 mt-1 shrink-0 text-primary group-hover:translate-x-1 transition-transform" />
                                <p className="font-bold text-sm md:text-base uppercase leading-tight italic">{line.replace(/^-/, '')}</p>
                              </div>
                            );
                          }
                          return <p key={i} className="text-sm font-medium leading-relaxed opacity-70">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-20">
                        <p className="text-6xl font-black uppercase italic">No Data</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button
                onClick={onRestart}
                className="flex-1 border-4 border-foreground bg-background p-6 font-black uppercase italic hover:bg-secondary hover:text-secondary-foreground transition-all shadow-[8px_8px_0px_var(--foreground)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Reiniciar
                </div>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-[2] border-4 border-foreground bg-foreground text-background p-6 font-black uppercase italic hover:bg-primary hover:text-primary-foreground transition-all shadow-[8px_8px_0px_var(--secondary)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Exportar Resultado
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Meta */}
        <div className="pt-8 border-t-8 border-foreground flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase opacity-30 italic">
          <div className="flex gap-6">
            <span>Turma: {instructorData.className}</span>
            <span>Instrutor: {instructorData.instructorName}</span>
          </div>
          <div className="bg-foreground text-background px-2 py-1">
            AeC // ASSESSMENT // v2.0 // © 2024
          </div>
        </div>
      </div>
    </div>
  );
};
