import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin } from "lucide-react";
import { SITES } from "@/components/RegistrationScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import aecLogo from "@/assets/aec-logo.png";
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  site: z.string().min(1, { message: "Selecione a praça" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      site: "",
    },
  });

  // Removido auto-navigate para garantir que a validação na onSubmit seja executada
  /*
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  */

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log("🚀 Iniciando processo de login para:", values.email);
      const { error, data } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      if (data.user) {
        console.log("🔑 Usuário autenticado, validando perfil...");

        // Tentativa 1: Busca completa (com site e matricula)
        let { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("site, role, matricula")
          .eq("id", data.user.id)
          .maybeSingle();

        // Se falhar por erro de coluna (schema mismatch), tenta o fallback básico
        if (profileError && (profileError.code === "PGRST204" || profileError.message?.includes("column"))) {
          console.warn("⚠️ Schema desatualizado. Tentando busca simplificada...");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!fallbackError) {
            profileData = fallbackData as any;
            profileError = null;
            toast({
              title: "Aviso de Compatibilidade",
              description: "O banco de dados ainda não possui as colunas de 'Praça'. O acesso foi liberado mas as travas de site estão desativadas.",
              variant: "default",
            });
          }
        }

        if (profileError) {
          console.error("❌ Erro fatal ao buscar perfil:", profileError);
          await supabase.auth.signOut();
          throw new Error("Erro de acesso. Por favor, execute o script SQL de atualização.");
        }

        if (!profileData) {
          console.error("❌ Perfil não encontrado para o ID:", data.user.id);
          await supabase.auth.signOut();
          throw new Error("Seu perfil ainda não foi criado. Entre em contato com o administrador.");
        }

        // Validação de Status (Aprovação)
        if (profileData.status && profileData.status !== "approved") {
          console.warn(`🚫 BLOQUEIO: Usuário com status '${profileData.status}'`);
          await supabase.auth.signOut();
          setIsLoading(false);

          if (profileData.status === "pending") {
            toast({
              title: "Acesso em Análise",
              description: "Sua solicitação está aguardando liberação do administrador.",
              variant: "default",
            });
          } else {
            toast({
              title: "Acesso Negado",
              description: "Sua solicitação de acesso não foi aprovada.",
              variant: "destructive",
            });
          }
          return;
        }

        const userSite = profileData.site?.trim().toUpperCase();
        const selectedSite = values.site.trim().toUpperCase();

        console.log(`📊 Validação: Registrada=${userSite || 'N/A'}, Selecionada=${selectedSite}`);

        // Só valida se a coluna 'site' existir no banco (userSite não será undefined)
        if (userSite && userSite !== selectedSite) {
          console.warn(`🚫 BLOQUEIO: Praça incompatível.`);
          await supabase.auth.signOut();
          setIsLoading(false);
          toast({
            title: "Acesso Inválido para esta Praça",
            description: `Sua matrícula (${profileData.matricula || 'ADM'}) está vinculada exclusivamente à praça ${profileData.site}. Selecione a unidade correta.`,
            variant: "destructive",
          });
          return;
        }

        // Se o usuário tem site vazio mas a coluna existe, vinculamos agora
        if (profileData.hasOwnProperty('site') && !profileData.site) {
          console.log(`📍 Vinculando praça ao perfil: ${values.site}`);
          await supabase
            .from("profiles")
            .update({ site: values.site })
            .eq("id", data.user.id);
        }

        console.log("✅ Acesso liberado.");
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("❌ Erro fatal no login:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro ao fazer login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={aecLogo} alt="AEC Logo" className="h-16 w-auto brightness-0 invert" />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Login Administrativo</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Acesse o painel de controle do teste DISC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu.email@aec.com.br"
                        type="email"
                        {...field}
                        disabled={isLoading}
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                        disabled={isLoading}
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Praça
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                          <SelectValue placeholder="Selecione sua praça" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px] glass-card border-white/10">
                        {SITES.map((site) => (
                          <SelectItem key={site} value={site} className="hover:bg-primary/20">
                            {site}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem acesso administrative?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Solicitar Cadastro
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
