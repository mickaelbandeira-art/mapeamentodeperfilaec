import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Target, Users, LineChart, Download, RotateCcw } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { DotPattern } from "./DotPattern";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ResultsScreenProps {
  scores: { D: number; I: number; S: number; C: number };
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
  C: {
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

export const ResultsScreen = ({ scores, participantData, instructorData, onRestart }: ResultsScreenProps) => {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentages = {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100)
  };

  // Find dominant profile
  const dominant = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0][0] as 'D' | 'I' | 'S' | 'C';
  const profile = profileDescriptions[dominant];
  const Icon = profile.icon;

  // Find secondary profile
  const secondary = Object.entries(percentages).sort((a, b) => b[1] - a[1])[1][0] as 'D' | 'I' | 'S' | 'C';
  const secondaryProfile = profileDescriptions[secondary];

  // Save results to database
  useEffect(() => {
    const saveResults = async () => {
      try {
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
            class_id: participantData.class_id,
            instructor_name: instructorData.instructorName,
            instructor_registration: instructorData.instructorRegistration,
            instructor_email: instructorData.instructorEmail,
            class_name: instructorData.className,
          });

        if (error) throw error;

        toast({
          title: "Resultados salvos!",
          description: "Seus resultados foram salvos com sucesso no sistema.",
        });
      } catch (error: any) {
        console.error("Error saving results:", error);
        toast({
          title: "Erro ao salvar resultados",
          description: "Não foi possível salvar seus resultados. Por favor, entre em contato com o suporte.",
          variant: "destructive",
        });
      }
    };

    saveResults();
  }, [scores, participantData, dominant]);

  return (
    <div className="min-h-screen p-4 py-20 relative overflow-hidden">
      <WaveBackground />
      <DotPattern position="top-right" />
      <DotPattern position="bottom-left" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        <Card className="p-6 sm:p-8 md:p-10 glass-card shadow-2xl animate-fade-in text-center">
          <div
            className="inline-flex p-5 rounded-full mb-6 animate-float shadow-lg glow-purple"
            style={{ backgroundColor: `hsl(var(--${profile.color}))` }}
          >
            <Icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gradient-hero">
            Seu Perfil Principal: {profile.name}
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            {profile.description}
          </p>

          {/* Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {Object.entries(percentages).map(([type, percentage]) => {
              const typeProfile = profileDescriptions[type as 'D' | 'I' | 'S' | 'C'];
              const TypeIcon = typeProfile.icon;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <TypeIcon className="w-5 h-5" style={{ color: `hsl(var(--${typeProfile.color}))` }} />
                    <span className="font-bold text-lg">{percentage}%</span>
                  </div>
                  <div className="h-32 bg-gray-800 rounded-lg overflow-hidden relative">
                    <div
                      className="absolute bottom-0 w-full transition-all duration-1000 ease-out"
                      style={{
                        backgroundColor: `hsl(var(--${typeProfile.color}))`,
                        height: `${percentage}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">{typeProfile.name}</span>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <Card className="p-6 glass-card-hover">
              <h3 className="text-xl font-bold mb-4 text-gradient-primary">💪 Seus Pontos Fortes</h3>
              <ul className="space-y-2">
                {profile.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 glass-card-hover">
              <h3 className="text-xl font-bold mb-4 text-gradient-primary">🎯 Áreas de Desenvolvimento</h3>
              <ul className="space-y-2">
                {profile.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-400">→</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 glass-card-hover">
              <h3 className="text-xl font-bold mb-4 text-gradient-primary">🔥 O Que Te Motiva</h3>
              <p className="text-gray-300">{profile.motivation}</p>
            </Card>

            <Card className="p-6 glass-card-hover">
              <h3 className="text-xl font-bold mb-4 text-gradient-primary">💬 Como Se Comunicar Com Você</h3>
              <p className="text-gray-300">{profile.communication}</p>
            </Card>
          </div>

          {percentages[secondary] >= 20 && (
            <Card className="p-6 glass-card-hover mt-6">
              <h3 className="text-xl font-bold mb-3 text-gradient-primary">
                ➕ Perfil Secundário: {secondaryProfile.name} ({percentages[secondary]}%)
              </h3>
              <p className="text-gray-300">{secondaryProfile.description}</p>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={onRestart}
              size="lg"
              variant="outline"
              className="glass-card-hover"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Refazer Teste
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
