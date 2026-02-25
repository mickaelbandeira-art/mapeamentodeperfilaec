import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Sparkles, Loader2, CheckCircle2, ArrowLeft, GraduationCap } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { DotPattern } from "./DotPattern";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegistrationScreenProps {
  onComplete: (data: { registration: string; name: string; email: string; cpf: string; site: string; class_id?: string }) => void;
  initialMode: 'colaborador' | 'novato';
  onBack: () => void;
}

export const SITES = [
  "ARP1", "ARP3", "CG", "CG2", "CPS1", "ES1", "ES3", "EST", "GV1",
  "JN", "JN2", "JP1", "JP2", "JP3", "MOC1", "MOC3", "MOC4", "MSS",
  "ORION", "PDI", "PTS", "RJ", "SP1", "SP2", "SP3", "SP5", "VN"
].sort();

export const RegistrationScreen = ({ onComplete, initialMode, onBack }: RegistrationScreenProps) => {
  const [mode, setMode] = useState<'colaborador' | 'novato'>(initialMode);
  const [registration, setRegistration] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classes, setClasses] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("training_classes")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    if (mode === 'novato') {
      setIsAutoFilled(false);
      return;
    }

    const fetchParticipant = async () => {
      if (registration.length < 3) {
        setName("");
        setEmail("");
        setIsAutoFilled(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("participants")
          .select("name, email")
          .eq("registration", registration)
          .eq("is_active", true)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setName(data.name);
          setEmail(data.email);
          setIsAutoFilled(true);
          toast({
            title: "✓ Participante encontrado!",
            description: "Nome e email preenchidos automaticamente.",
          });
        } else {
          setName("");
          setEmail("");
          setIsAutoFilled(false);
        }
      } catch (error: any) {
        console.error("❌ Erro ao buscar participante:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchParticipant();
    }, 500);

    return () => clearTimeout(debounce);
  }, [registration, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'colaborador') {
      if (!registration || !name || !email) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha sua matrícula e verifique se seu nome e e-mail foram carregados.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!name || !cpf || !selectedSite || !selectedClassId) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha seu nome, CPF, praça e selecione sua turma.",
          variant: "destructive",
        });
        return;
      }
    }

    onComplete({
      registration: mode === 'colaborador' ? registration : `NOVATO_${Date.now()}`,
      name,
      email,
      cpf: mode === 'novato' ? cpf : "",
      site: selectedSite,
      class_id: mode === 'novato' ? selectedClassId : undefined
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      <WaveBackground />
      <DotPattern position="top-right" />
      <DotPattern position="bottom-left" />

      <Card className="max-w-2xl w-full p-6 sm:p-8 md:p-12 glass-card shadow-2xl relative z-10 animate-fade-in pt-16 sm:pt-20">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute left-6 top-6 text-gray-400 hover:text-white flex items-center gap-2 group z-50 bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Voltar
        </Button>
        <div className="text-center space-y-6">
          <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 mb-4 animate-float shadow-lg glow-purple">
            <UserCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-hero leading-tight">
            {mode === 'colaborador' ? 'Acesso Colaborador' : 'Cadastro Novato'}
          </h1>

          <p className="text-lg text-gray-400">
            {mode === 'colaborador'
              ? 'Identifique-se com sua matrícula para iniciar'
              : 'Preencha seus dados para iniciar o mapeamento'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {mode === 'colaborador' && (
              <div className="space-y-2">
                <Label htmlFor="registration" className="text-base flex items-center gap-2">
                  <span className="text-purple-400">#</span> Matrícula *
                </Label>
                <div className="relative">
                  <Input
                    id="registration"
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    className="h-12 text-base glass-card-hover border-border/50"
                    required
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-purple-400" /> Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`h-12 text-base glass-card-hover border-border/50 ${isAutoFilled ? "border-green-500/50 bg-green-500/5" : ""
                  }`}
                disabled={loading}
                readOnly={isAutoFilled}
                required
              />
            </div>

            {mode === 'novato' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-base flex items-center gap-2">
                    <span className="text-purple-400">ID</span> CPF *
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="h-12 text-base glass-card-hover border-border/50"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site" className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" /> Selecione sua Praça *
                  </Label>
                  <Select value={selectedSite} onValueChange={setSelectedSite} required>
                    <SelectTrigger className="h-12 text-base glass-card-hover border-border/50 bg-transparent">
                      <SelectValue placeholder="Sua praça de atuação" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10 max-h-[300px]">
                      {SITES.map((site) => (
                        <SelectItem key={site} value={site} className="focus:bg-purple-500/20">
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class" className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" /> Selecione sua Turma *
                  </Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
                    <SelectTrigger className="h-12 text-base glass-card-hover border-border/50 bg-transparent">
                      <SelectValue placeholder="Escolha sua turma" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10">
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="focus:bg-purple-500/20">
                          {c.name}
                        </SelectItem>
                      ))}
                      {classes.length === 0 && (
                        <SelectItem value="none" disabled>Nenhuma turma disponível</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {mode === 'colaborador' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="colab-site" className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" /> Selecione sua Praça *
                  </Label>
                  <Select value={selectedSite} onValueChange={setSelectedSite} required>
                    <SelectTrigger className="h-12 text-base glass-card-hover border-border/50 bg-transparent">
                      <SelectValue placeholder="Sua praça de atuação" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10 max-h-[300px]">
                      {SITES.map((site) => (
                        <SelectItem key={site} value={site} className="focus:bg-purple-500/20">
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base flex items-center gap-2">
                    <span className="text-purple-400">@</span> E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-12 text-base glass-card-hover border-border/50 ${isAutoFilled ? "border-green-500/50 bg-green-500/5" : ""
                      }`}
                    disabled={loading}
                    readOnly={isAutoFilled}
                    required
                  />
                </div>
              </>
            )}

            {isAutoFilled && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Dados encontrados e preenchidos automaticamente!
                </p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 shadow-2xl glow-purple hover:scale-105 transition-all duration-300 font-bold"
              disabled={loading}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Continuar para o Teste
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
