import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, UserPlus, MapPin, Briefcase, Hash, Mail, Lock } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SITES } from "@/components/RegistrationScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import aecLogo from "@/assets/aec-logo.png";

const registerSchema = z.object({
    fullName: z.string().min(3, { message: "Nome completo é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    matricula: z.string().min(1, { message: "Matrícula é obrigatória" }),
    cargo: z.string().min(1, { message: "Cargo é obrigatório" }),
    site: z.string().min(1, { message: "Selecione a praça" }),
    role: z.enum(["admin", "manager", "coordinator"], { required_error: "Selecione o nível de acesso" }),
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
            role: "coordinator",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const { error } = await signUp(values.email, values.password, {
                full_name: values.fullName,
                matricula: values.matricula,
                cargo: values.cargo,
                site: values.site,
                role: values.role,
            });

            if (!error) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
            <Card className="w-full max-w-2xl glass-card">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <img src={aecLogo} alt="AEC Logo" className="h-16 w-auto brightness-0 invert" />
                    </div>
                    <CardTitle className="text-2xl text-center font-bold">Solicitar Acesso Administrativo</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Preencha seus dados para solicitar autorização de acesso ao painel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /> Nome Completo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Seu nome" {...field} disabled={isLoading} className="bg-white/5 border-white/10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email Corporativo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="seu.email@aec.com.br" type="email" {...field} disabled={isLoading} className="bg-white/5 border-white/10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Senha</FormLabel>
                                            <FormControl>
                                                <Input placeholder="••••••••" type="password" {...field} disabled={isLoading} className="bg-white/5 border-white/10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Matricula */}
                                <FormField
                                    control={form.control}
                                    name="matricula"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Hash className="w-4 h-4 text-primary" /> Matrícula</FormLabel>
                                            <FormControl>
                                                <Input placeholder="000000" {...field} disabled={isLoading} className="bg-white/5 border-white/10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Cargo */}
                                <FormField
                                    control={form.control}
                                    name="cargo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Cargo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Supervisor" {...field} disabled={isLoading} className="bg-white/5 border-white/10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Site/Praça */}
                                <FormField
                                    control={form.control}
                                    name="site"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Praça</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10">
                                                        <SelectValue placeholder="Selecione sua praça" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="glass-card border-white/10">
                                                    {SITES.map((site) => (
                                                        <SelectItem key={site} value={site}>{site}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Role/Hierarchy */}
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="flex items-center gap-2">Nível de Acesso Desejado</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10">
                                                        <SelectValue placeholder="Selecione o nível" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="glass-card border-white/10">
                                                    <SelectItem value="coordinator">Coordenador</SelectItem>
                                                    <SelectItem value="manager">Gerente</SelectItem>
                                                    <SelectItem value="admin">Administrador (Developer)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90 transition-all shadow-lg" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando solicitação...
                                    </>
                                ) : (
                                    "Solicitar Cadastro"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-white/5 pt-6">
                    <p className="text-sm text-muted-foreground">
                        Já possui acesso?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Fazer Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
