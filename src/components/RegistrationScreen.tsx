import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { UserCircle, Sparkles, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RegistrationScreenProps {
  onComplete: (data: { registration: string; name: string; email?: string; cpf: string; site: string; class_id?: string }) => void;
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
    if (selectedSite) {
      fetchClassesBySite(selectedSite);
    } else {
      setClasses([]);
    }
  }, [selectedSite]);

  const fetchClassesBySite = async (site: string) => {
    try {
      const query = supabase
        .from("training_classes")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      // Filter by site if site column exists (post-migration)
      const { data, error } = await query.or(`site.eq.${site},site.eq.`);
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
      if (!registration || !name) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha sua matrícula e verifique se seu nome foi carregado.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!name || (!cpf && mode === 'novato') || !selectedSite || (mode === 'novato' && !selectedClassId)) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios (*).",
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background font-sans">
      <div className="max-w-4xl w-full relative z-10 animate-fade-in border-4 border-foreground bg-background shadow-[15px_15px_0px_var(--secondary)] overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-foreground text-background p-4 flex justify-between items-center border-b-4 border-foreground">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-black text-xs uppercase hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="font-black text-xs uppercase tracking-tighter italic">
            AEC // REGISTRATION_MODULE // {mode.toUpperCase()}
          </div>
        </div>

        <div className="flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-foreground">
          {/* Left Panel: Context */}
          <div className="md:w-1/3 p-8 bg-primary/5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-foreground text-background inline-block px-3 py-1 text-[10px] font-black uppercase">
                Etapa 01
              </div>
              <h1 className="text-4xl font-black leading-none uppercase italic">
                {mode === 'colaborador' ? 'Acesso' : 'Cadastro'}<br />
                <span className="text-primary text-6xl">{mode === 'colaborador' ? 'MTR' : 'NVT'}</span>
              </h1>
              <p className="text-sm font-bold text-muted-foreground uppercase leading-tight">
                {mode === 'colaborador'
                  ? 'Identifique-se com sua matrícula AeC para iniciar o mapeamento.'
                  : 'Preencha seus dados para criar sua identidade no sistema.'}
              </p>
            </div>

            <div className="pt-8">
              <div className="p-4 border-2 border-foreground bg-background rotate-[-2deg] brutal-card shadow-sm">
                <UserCircle className="w-8 h-8 mb-2 text-secondary" />
                <p className="text-[10px] font-black uppercase opacity-50">Sessão Segura</p>
                <p className="text-xs font-bold leading-none">Seus dados estão protegidos.</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="flex-1 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {mode === 'colaborador' && (
                <div className="space-y-2 group">
                  <Label htmlFor="registration" className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                    <span className="text-secondary text-lg">#</span> Matrícula *
                  </Label>
                  <div className="relative">
                    <input
                      id="registration"
                      type="text"
                      placeholder="0000000"
                      value={registration}
                      onChange={(e) => setRegistration(e.target.value)}
                      className="w-full bg-background border-4 border-foreground p-4 font-black text-xl placeholder:text-foreground/20 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none"
                      required
                    />
                    {loading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                  <span className="text-secondary text-lg">@</span> Nome Completo *
                </Label>
                <input
                  id="name"
                  type="text"
                  placeholder="DIGITE SEU NOME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-background border-4 border-foreground p-4 font-black text-xl placeholder:text-foreground/20 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none ${isAutoFilled ? "bg-primary/10 border-primary" : ""
                    }`}
                  disabled={loading}
                  readOnly={isAutoFilled}
                  required
                />
              </div>

              {mode === 'novato' ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="font-black uppercase text-xs tracking-widest text-foreground">CPF *</Label>
                    <input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full bg-background border-4 border-foreground p-4 font-black text-lg focus:bg-primary transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site" className="font-black uppercase text-xs tracking-widest text-foreground">Praça *</Label>
                    <select
                      value={selectedSite}
                      onChange={(e) => setSelectedSite(e.target.value)}
                      className="w-full bg-background border-4 border-foreground p-4 font-black text-lg appearance-none focus:bg-primary transition-all outline-none"
                      required
                    >
                      <option value="">SELECIONE</option>
                      {SITES.map((site) => (
                        <option key={site} value={site}>{site}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="class" className="font-black uppercase text-xs tracking-widest text-foreground">Turma *</Label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full bg-background border-4 border-foreground p-4 font-black text-lg appearance-none focus:bg-primary transition-all outline-none"
                      required
                    >
                      <option value="">SELECIONE SUA TURMA</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site" className="font-black uppercase text-xs tracking-widest text-foreground">Praça *</Label>
                    <select
                      value={selectedSite}
                      onChange={(e) => setSelectedSite(e.target.value)}
                      className="w-full bg-background border-4 border-foreground p-4 font-black text-lg appearance-none focus:bg-primary transition-all outline-none"
                      required
                    >
                      <option value="">SELECIONE</option>
                      {SITES.map((site) => (
                        <option key={site} value={site}>{site}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-black uppercase text-xs tracking-widest text-foreground">E-mail</Label>
                    <input
                      id="email"
                      type="email"
                      placeholder="EMAIL@AEC.COM.BR"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-background border-4 border-foreground p-4 font-black text-lg focus:bg-primary transition-all outline-none ${isAutoFilled ? "bg-primary/10 border-primary" : ""
                        }`}
                      disabled={loading}
                      readOnly={isAutoFilled}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-black text-2xl py-6 border-b-8 border-r-8 border-foreground hover:translate-x-1 hover:translate-y-1 hover:border-b-4 hover:border-r-4 active:border-0 transition-all flex items-center justify-center gap-4 group"
                >
                  {loading ? 'PROCESSANDO...' : 'INICIAR TESTE'}
                  <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                </button>
              </div>

              {isAutoFilled && (
                <div className="p-4 bg-primary/20 border-2 border-primary font-bold text-xs uppercase flex items-center gap-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Dados de sistema sincronizados com sucesso.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
