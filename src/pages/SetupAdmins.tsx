
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const admins = [
    { registration: '134187', name: 'JONATHAN LINS DA SILVA', email: 'jonathan.silva@aec.com.br', role: 'admin' },
    { registration: '227625', name: 'KELCIANE CAVALCANTE DE LIMA', email: 'kelciane.lima@aec.com.br', role: 'coordinator' },
    { registration: '261064', name: 'IZAURA DE ARAUJO BEZERRA', email: 'a.izaura.bezerrra@aec.com.br', role: 'coordinator' },
    { registration: '461576', name: 'Mickael Bandeira da Silva', email: 'mickael.bandeira@aec.com.br', role: 'admin' }
];

const SetupAdmins = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Record<string, { status: 'success' | 'error', message: string }>>({});

    const handleCreateUsers = async () => {
        setLoading(true);
        const newResults: Record<string, { status: 'success' | 'error', message: string }> = {};

        for (const admin of admins) {
            try {
                console.log(`Creating user: ${admin.email}`);

                // 1. Sign Up User
                const { error: signUpError } = await supabase.auth.signUp({
                    email: admin.email,
                    password: admin.registration, // Using matricula as password
                    options: {
                        data: {
                            full_name: admin.name,
                            matricula: admin.registration,
                        }
                    }
                });

                if (signUpError) {
                    // Check if user already exists
                    if (signUpError.message.includes("User already registered")) {
                        newResults[admin.registration] = { status: 'success', message: "Usuário já existe." };
                    } else {
                        throw signUpError;
                    }
                } else {
                    newResults[admin.registration] = { status: 'success', message: "Usuário criado com sucesso!" };
                }

                // Logout to ensure clean state for next user (though signUp doesn't automatically login if email confirmation is on, it might if off)
                await supabase.auth.signOut();

            } catch (error: any) {
                console.error(`Error creating ${admin.email}:`, error);
                newResults[admin.registration] = { status: 'error', message: error.message };
            }
        }

        setResults(newResults);
        setLoading(false);
        toast({
            title: "Processo Finalizado",
            description: "Verifique o status de cada usuário abaixo.",
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl glass-card">
                <CardHeader>
                    <CardTitle>Configuração de Administradores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-300">
                        Esta ferramenta irá criar os usuários administrativos no Supabase Auth.
                        A senha de cada usuário será sua própria matrícula.
                    </p>

                    <Button
                        onClick={handleCreateUsers}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Usuários
                    </Button>

                    <div className="space-y-2 mt-4">
                        {admins.map((admin) => (
                            <div key={admin.registration} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10">
                                <div>
                                    <div className="font-bold">{admin.name}</div>
                                    <div className="text-sm text-gray-400">{admin.email} (Senha: {admin.registration})</div>
                                </div>
                                <div>
                                    {results[admin.registration] ? (
                                        results[admin.registration].status === 'success' ? (
                                            <span className="flex items-center text-green-400"><CheckCircle2 className="w-4 h-4 mr-2" /> {results[admin.registration].message}</span>
                                        ) : (
                                            <span className="flex items-center text-red-400"><XCircle className="w-4 h-4 mr-2" /> {results[admin.registration].message}</span>
                                        )
                                    ) : (
                                        <span className="text-gray-500">Pendente</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default SetupAdmins;
