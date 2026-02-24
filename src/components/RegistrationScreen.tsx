import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { DotPattern } from "./DotPattern";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RegistrationScreenProps {
  onComplete: (data: { registration: string; name: string; email: string; cpf: string }) => void;
}

export const RegistrationScreen = ({ onComplete }: RegistrationScreenProps) => {
  const [registration, setRegistration] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  // Removed auto-fill logic as it's now focused on newcomers/manual entry

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!registration || !name || !email || !cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    onComplete({ registration, name, email, cpf });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-hidden">
      <WaveBackground />
      <DotPattern position="top-right" />
      <DotPattern position="bottom-left" />

      <Card className="max-w-2xl w-full p-6 sm:p-8 md:p-12 glass-card shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 mb-4 animate-float shadow-lg glow-purple">
            <UserCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-hero leading-tight">
            Cadastro
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto">
            Preencha seus dados para iniciar sua jornada
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8 text-left">
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
                className="h-12 text-base glass-card-hover border-border/50"
                disabled={loading}
                required
              />
            </div>

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
              <Label htmlFor="email" className="text-base flex items-center gap-2">
                <span className="text-purple-400">@</span> E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base glass-card-hover border-border/50"
                disabled={loading}
                required
              />
            </div>


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
