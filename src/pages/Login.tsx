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
      const { error } = await signIn(values.email, values.password, values.site);

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Erro no login:", error);
      // O toast já é disparado pelo useAuth, mas podemos reforçar aqui se necessário
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity group"
        >
          <Loader2 className="w-4 h-4 -rotate-90 group-hover:-translate-x-1 transition-transform" />
          Voltar para o Início
        </button>
        <CardHeader className="space-y-4 pt-12">
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
