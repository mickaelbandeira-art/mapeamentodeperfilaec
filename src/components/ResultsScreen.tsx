import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users, LineChart, Download, RotateCcw, Zap, Sparkles, MessageSquare, Briefcase, GraduationCap } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { DotPattern } from "./DotPattern";
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
    color: "disc-dominance",
    description: "Você é orientado a resultados, direto e focado em desafios. Toma decisões rápidas e gosta de estar no controle.",
    strengths: ["Determinação", "Liderança", "Foco em resultados", "Coragem para decisões difíceis"],
    improvements: ["Paciência", "Escuta ativa", "Empatia", "Considerar detalhes"],
    motivation: "Desafios, autonomia e vitórias",
    communication: "Seja direto, objetivo e foque em resultados"
  },
  I: {
    name: "Influente",
    icon: Users,
    color: "disc-influence",
    description: "Você é carismático, comunicativo e inspira outros. Gosta de trabalhar em equipe e ser reconhecido.",
    strengths: ["Comunicação", "Entusiasmo", "Persuasão", "Networking"],
    improvements: ["Foco", "Atenção aos detalhes", "Organização", "Cumprimento de prazos"],
    motivation: "Reconhecimento, interação social e variedade",
    communication: "Seja entusiasmado, positivo e dê reconhecimento"
  },
  S: {
    name: "Estável",
    icon: LineChart,
    color: "disc-stability",
    description: "Você é paciente, leal e busca harmonia. Valoriza relacionamentos duradouros e ambientes estáveis.",
    strengths: ["Paciência", "Lealdade", "Cooperação", "Confiabilidade"],
    improvements: ["Adaptação a mudanças", "Assertividade", "Tomar iniciativa", "Expressar opiniões"],
    motivation: "Segurança, estabilidade e harmonia",
    communication: "Seja gentil, claro e demonstre apreciação"
  },
  60: {
    name: "Conforme",
    icon: Brain,
    color: "disc-conformity",
    description: "Você é analítico, detalhista e busca perfeição. Valoriza qualidade, precisão e organização.",
    strengths: ["Análise", "Precisão", "Organização", "Qualidade"],
    improvements: ["Flexibilidade", "Velocidade", "Aceitar imperfeição", "Tomar riscos"],
    motivation: "Qualidade, precisão e clareza",
    communication: "Seja lógico, detalhado e forneça dados"
  }
};

const getDiscColorCode = (type: string) => {
  switch (type) {
    case 'D': return '#EF4444';
    case 'I': return '#F59E0B';
    case 'S': return '#10B981';
    case 'C': return '#3B82F6';
    default: return '#8B5CF6';
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

  const dominant = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0][0] as 'D' | 'I' | 'S' | 'C';
  const profile = (profileDescriptions as any)[dominant];
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

        // Validar se a resposta da IA foi gerada com sucesso
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
            user_id: user?.id || null, // Vínculo com user_id para RLS
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
    <div className="min-h-screen p-4 py-12 relative overflow-hidden bg-[#0A0A0B]">
      <WaveBackground />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 transition-all duration-700">
        {/* Top Header Card */}
        <Card className="p-8 sm:p-12 glass-card border-white/10 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500" />

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center relative group shrink-0"
              style={{ background: `linear-gradient(135deg, ${getDiscColorCode(dominant)} 0%, #000 100%)` }}
            >
              <div className="absolute inset-0 rounded-3xl blur-xl opacity-50 bg-current transition-opacity group-hover:opacity-75" />
              <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white relative z-10" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <span className="text-purple-400 font-bold uppercase tracking-[0.2em] text-xs">Mapeamento 360º Completo</span>
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  {participantData.name.split(' ')[0]}, seu perfil é <span style={{ color: getDiscColorCode(dominant) }}>{profile.name}</span>
                </h1>
              </div>
              <p className="text-gray-400 text-lg sm:text-xl max-w-3xl leading-relaxed">
                {profile.description}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Core Metrics */}
          <div className="lg:col-span-1 space-y-8">
            {/* DISC Chart Card */}
            <Card className="p-6 glass-card border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Intensidade DISC
              </h3>
              <div className="space-y-6">
                {Object.entries(percentages).map(([type, percentage]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 font-medium">
                        {(profileDescriptions as any)[type]?.name || type}
                      </span>
                      <span className="font-bold text-white" style={{ color: getDiscColorCode(type) }}>{percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
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

            {/* Mindset & VAC Card */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6 glass-card border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-fuchsia-600/20 text-fuchsia-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mindset Predominante</h4>
                    <p className="text-xl font-bold text-white">{mindset}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 glass-card border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Canal VAC (Comunicação)</h4>
                    <p className="text-xl font-bold text-white">{vac}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - AI Insights */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 glass-card border-white/10 min-h-[400px] relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600/20">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  Insights da IA Consultiva AeC
                </h3>
              </div>

              {isGeneratingAi ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-white font-bold text-lg animate-pulse">Cruzando dados de DISC, Mindset e VAC...</p>
                    <p className="text-gray-400 text-sm">Gerando seu plano de desenvolvimento personalizado</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-gray-300 prose prose-invert max-w-none prose-headings:text-white prose-p:leading-relaxed overflow-auto max-h-[600px] pr-4 custom-scrollbar">
                  {aiInsights ? (
                    <div className="whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      {aiInsights.split('\n').map((line, i) => {
                        if (line.startsWith('#')) return <h3 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.replace(/^#+\s*/, '')}</h3>;
                        if (line.startsWith('-')) return <li key={i} className="ml-4 mb-2 list-none flex gap-2"><span className="text-purple-400">•</span> {line.replace(/^-/, '')}</li>;
                        return <p key={i} className="mb-4">{line}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 mt-20 italic">Aguardando geração dos insights...</p>
                  )}
                </div>
              )}
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
              <div className="text-sm text-gray-500 italic mr-auto mb-4 sm:mb-0">
                Mapeamento interpretado por Inteligência Artificial Consultiva.
              </div>
              <Button
                variant="outline"
                onClick={onRestart}
                className="bg-transparent border-white/10 hover:bg-white/5 text-gray-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refazer Teste
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Salvar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 mt-12 border-t border-white/5 pt-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Turma: {instructorData.className}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Instrutor: {instructorData.instructorName}</span>
          </div>
          <div className="md:text-right">
            <span>© 2024 AeC - Perfil 360º Consultivo Inteligente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
