import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, UserPlus, MapPin, Briefcase, Hash, Mail, Lock, Sparkles, ArrowRight, ShieldAlert, Clock } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SITES } from "@/components/RegistrationScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import aecLogo from "@/assets/aec-logo.png";
import { toast } from "@/hooks/use-toast";

const registerSchema = z.object({
    fullName: z.string().min(3, { message: "Nome completo é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    matricula: z.string().min(1, { message: "Matrícula é obrigatória" }),
    cargo: z.string().min(1, { message: "Cargo é obrigatório" }),
    site: z.string().min(1, { message: "Selecione a praça" }),
    role: z.enum(["manager", "coordinator", "supervisor", "instrutor"], { required_error: "Selecione o nível de acesso" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            matricula: "",
            cargo: "",
            site: "",
            role: "instrutor",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true);
        console.log("🚀 Iniciando cadastro administrativo:", values);
        try {
            const { error, data } = await signUp(values.email, values.password, {
                full_name: values.fullName,
                matricula: values.matricula,
                cargo: values.cargo,
                site: values.site,
                role: values.role,
                status: 'pending'
            });

            console.log("📥 Resultado do signUp:", { data, error });

            if (!error) {
                console.log("✅ Cadastro solicitado com sucesso. Redirecionando...");
                navigate("/login");
            }
        } catch (err) {
            console.error("❌ Erro inesperado no onSubmit:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const onError = (errors: any) => {
        console.error("🚩 Erros de validação no formulário:", errors);
        toast({
            title: "Verifique o formulário",
            description: "Alguns campos precisam de atenção.",
            variant: "destructive"
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12 font-sans relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-screen pointer-events-none opacity-10">
                <div className="absolute top-[5%] right-[5%] text-[15vw] font-black text-stroke leading-none opacity-10 select-none italic uppercase">
                    Register
                </div>
            </div>

            <div className="max-w-4xl w-full relative z-10 animate-fade-in border-4 border-foreground bg-background shadow-[20px_20px_0px_var(--secondary)] overflow-hidden">
                {/* Header Ribbon */}
                <div className="bg-foreground text-background p-6 flex justify-between items-center border-b-4 border-foreground">
                    <div className="flex items-center gap-4">
                        <img src={aecLogo} alt="AEC Logo" className="h-8 w-auto brightness-0 invert" />
                        <div className="h-8 w-1 bg-primary rotate-12" />
                        <span className="font-black text-lg uppercase italic tracking-tighter">Request // Access</span>
                    </div>
                    <div className="hidden md:block font-black text-[10px] uppercase tracking-[0.2em] opacity-50 italic">
                        Protocol: ADMIN_SOLICITATION_V2
                    </div>
                </div>

                <div className="flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-foreground">
                    {/* Left Panel: Context */}
                    <div className="md:w-1/3 p-8 bg-primary/5 flex flex-col justify-between space-y-12">
                        <div className="space-y-4">
                            <div className="bg-foreground text-background inline-block px-3 py-1 text-[10px] font-black uppercase italic tracking-widest">
                                Phase_00 // Identity
                            </div>
                            <h1 className="text-5xl font-black leading-none uppercase italic">
                                Solicitar<br />
                                <span className="text-primary text-7xl italic">Acesso</span>
                            </h1>
                            <p className="text-sm font-bold text-muted-foreground uppercase leading-tight italic">
                                Preencha suas credenciais corporativas para validação pelo comitê administrativo.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 border-2 border-foreground bg-background brutal-card rotate-[-1deg] shadow-sm">
                                <ShieldAlert className="w-8 h-8 mb-2 text-secondary" />
                                <p className="text-[10px] font-black uppercase opacity-50">Segurança</p>
                                <p className="text-xs font-bold leading-none italic uppercase tracking-tighter">Acesso sujeito a auditoria conforme LGPD.</p>
                            </div>
                            <div className="p-4 border-2 border-foreground bg-background brutal-card rotate-[1deg] shadow-sm">
                                <Clock className="h-8 w-8 mb-2 text-primary" />
                                <p className="text-[10px] font-black uppercase opacity-50">Tempo_Médio</p>
                                <p className="text-xs font-bold leading-none italic uppercase tracking-tighter">Aprovação em até 24h úteis.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="flex-1 p-8 md:p-12">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Full Name */}
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                                                    <UserPlus className="w-4 h-4 text-primary" /> Nome Completo
                                                </FormLabel>
                                                <FormControl>
                                                    <input {...field} disabled={isLoading} placeholder="SEU NOME" className="w-full bg-background border-4 border-foreground p-4 font-black text-xl placeholder:text-foreground/10 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none italic" />
                                                </FormControl>
                                                <FormMessage className="font-black text-[10px] uppercase italic text-secondary" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Email */}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-primary" /> Email Corp
                                                </FormLabel>
                                                <FormControl>
                                                    <input {...field} disabled={isLoading} type="email" placeholder="USER@AEC.COM.BR" className="w-full bg-background border-4 border-foreground p-4 font-black text-lg placeholder:text-foreground/10 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none italic" />
                                                </FormControl>
                                                <FormMessage className="font-black text-[10px] uppercase italic text-secondary" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Matricula */}
                                    <FormField
                                        control={form.control}
                                        name="matricula"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                                                    <Hash className="w-4 h-4 text-primary" /> Matrícula
                                                </FormLabel>
                                                <FormControl>
                                                    <input {...field} disabled={isLoading} placeholder="000000" className="w-full bg-background border-4 border-foreground p-4 font-black text-lg placeholder:text-foreground/10 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none italic" />
                                                </FormControl>
                                                <FormMessage className="font-black text-[10px] uppercase italic text-secondary" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Password */}
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-primary" /> Senha
                                                </FormLabel>
                                                <FormControl>
                                                    <input {...field} disabled={isLoading} type="password" placeholder="••••••••" className="w-full bg-background border-4 border-foreground p-4 font-black text-lg placeholder:text-foreground/10 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none" />
                                                </FormControl>
                                                <FormMessage className="font-black text-[10px] uppercase italic text-secondary" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Cargo */}
                                    <FormField
                                        control={form.control}
                                        name="cargo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-primary" /> Cargo
                                                </FormLabel>
                                                <FormControl>
                                                    <input {...field} disabled={isLoading} placeholder="EX: GERENTE" className="w-full bg-background border-4 border-foreground p-4 font-black text-lg placeholder:text-foreground/10 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none italic" />
                                                </FormControl>
                                                <FormMessage className="font-black text-[10px] uppercase italic text-secondary" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Site/Praça */}
                                    <FormField
                                        control={form.control}
                                        name="site"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-black uppercase text-xs tracking-widest text-foreground flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary" /> Praça
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full bg-background border-4 border-foreground p-7 font-black text-lg focus:bg-primary focus:ring-0 transition-all outline-none rounded-none italic h-auto">
                                                            <SelectValue placeholder="SELECIONE" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="border-4 border-foreground bg-background rounded-none">
                                                        {SITES.map((site) => (
                                                            <SelectItem key={site} value={site} className="font-black uppercase italic hover:bg-primary focus:bg-primary rounded-none">{site}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="font-black text-[10px] uppercase italic text-secondary" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Role/Hierarchy */}
                                    <FormField
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-1">
                                                <FormLabel className="font-black uppercase text-xs tracking-widest text-foreground">Nível_Acesso</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full bg-background border-4 border-foreground p-7 font-black text-lg focus:bg-primary focus:ring-0 transition-all outline-none rounded-none italic h-auto">
                                                            <SelectValue placeholder="SELECIONE" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="border-4 border-foreground bg-background rounded-none">
                                                        <SelectItem value="instrutor" className="font-black uppercase italic hover:bg-primary focus:bg-primary rounded-none">Instrutor</SelectItem>
                                                        <SelectItem value="supervisor" className="font-black uppercase italic hover:bg-primary focus:bg-primary rounded-none">Supervisor</SelectItem>
                                                        <SelectItem value="coordinator" className="font-black uppercase italic hover:bg-primary focus:bg-primary rounded-none">Coordenador</SelectItem>
                                                        <SelectItem value="manager" className="font-black uppercase italic hover:bg-primary focus:bg-primary rounded-none">Gerente</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="font-black text-[10px] uppercase italic text-secondary" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary text-primary-foreground font-black text-2xl py-6 border-b-8 border-r-8 border-foreground hover:translate-x-1 hover:translate-y-1 hover:border-b-4 hover:border-r-4 active:border-0 transition-all flex items-center justify-center gap-4 group italic"
                                    >
                                        {isLoading ? 'ENVIANDO_SOLICITAÇÃO...' : 'SOLICITAR CADASTRO'}
                                        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                                    </button>
                                </div>
                            </form>
                        </Form>

                        <div className="mt-8 text-center pt-8 border-t-2 border-foreground/10 flex flex-col md:flex-row items-center justify-center gap-4">
                            <span className="text-sm font-bold uppercase italic opacity-50">Já possui acesso autorizado?</span>
                            <Link to="/login" className="text-secondary font-black text-sm uppercase italic hover:underline flex items-center gap-2">
                                <ArrowRight className="w-4 h-4" />
                                Efetuar Login // Terminal
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Ticker */}
            <div className="fixed bottom-0 left-0 right-0 bg-foreground text-background py-2 overflow-hidden whitespace-nowrap z-0">
                <div className="flex animate-marquee font-black uppercase italic text-[10px] tracking-widest gap-12 opacity-30">
                    <span>AEC System 360 // Registration Node // Protocol: SEC-SOLICIT // AEC System 360 // Registration Node // Protocol: SEC-SOLICIT // AEC System 360 // Registration Node // Protocol: SEC-SOLICIT</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
