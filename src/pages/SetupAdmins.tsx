import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Database, Key } from "lucide-react";

const admins = [
    { registration: '134187', name: 'JONATHAN LINS DA SILVA', email: 'jonathan.silva@aec.com.br', role: 'admin', site: 'MOC1' },
    { registration: '227625', name: 'KELCIANE CAVALCANTE DE LIMA', email: 'kelciane.lima@aec.com.br', role: 'coordinator', site: 'CG2' },
    { registration: '261064', name: 'IZAURA DE ARAUJO BEZERRA', email: 'a.izaura.bezerrra@aec.com.br', role: 'coordinator', site: 'JP1' },
    { registration: '461576', name: 'Mickael Bandeira da Silva', email: 'mickael.bandeira@aec.com.br', role: 'admin', site: 'MOC1' }
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
                const { error: signUpError } = await supabase.auth.signUp({
                    email: admin.email,
                    password: admin.registration,
                    options: {
                        data: {
                            full_name: admin.name,
                            matricula: admin.registration,
                            site: admin.site,
                        }
                    }
                });

                if (signUpError) {
                    if (signUpError.message.includes("User already registered")) {
                        newResults[admin.registration] = { status: 'success', message: "USER_EXISTS" };
                    } else {
                        throw signUpError;
                    }
                } else {
                    newResults[admin.registration] = { status: 'success', message: "DEPLOYED_OK" };
                }
                await supabase.auth.signOut();
            } catch (error: any) {
                console.error(`Error creating ${admin.email}:`, error);
                newResults[admin.registration] = { status: 'error', message: "FAIL_RECORD" };
            }
        }

        setResults(newResults);
        setLoading(false);
        toast({ title: "Setup_Finalized", description: "Verifique o log de execução abaixo." });
    };

    return (
        <div className="min-h-screen bg-background font-sans p-8 flex items-center justify-center overflow-x-hidden">
            <div className="max-w-4xl w-full border-8 border-foreground bg-background p-12 md:p-16 animate-in slide-in-from-bottom-8 duration-700 shadow-[15px_15px_0px_var(--primary)]">
                <div className="space-y-12">
                    <div className="border-b-8 border-foreground pb-8 flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="bg-foreground text-background inline-block px-4 py-1 text-[10px] font-black uppercase italic tracking-widest translate-x-1">
                                Critical // System // Setup
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black leading-[0.8] uppercase italic tracking-tighter">
                                Admin_Init
                            </h1>
                        </div>
                        <ShieldCheck className="w-16 h-16 text-primary" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-6 bg-foreground text-background border-4 border-foreground">
                            <Database className="w-8 h-8 shrink-0 text-primary" />
                            <p className="font-bold uppercase italic text-sm leading-tight">
                                Esta ferramenta injeta usuários administrativos no Supabase Auth Cluster.
                                A chave de acesso [PASS] será gerada via Matrícula_ID.
                            </p>
                        </div>

                        <button
                            onClick={handleCreateUsers}
                            disabled={loading}
                            className="w-full border-4 border-foreground bg-primary text-primary-foreground py-6 font-black uppercase italic text-xl hover:bg-secondary shadow-[8px_8px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <><Key className="w-6 h-6" /> Deployed_Protocol</>}
                        </button>

                        <div className="space-y-4 pt-10">
                            <h3 className="text-sm font-black uppercase italic tracking-widest border-l-4 border-primary pl-4 mb-6">Target_Queue</h3>
                            {admins.map((admin) => (
                                <div key={admin.registration} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-6 border-4 border-foreground bg-background hover:bg-foreground/5 transition-colors group">
                                    <div className="space-y-2">
                                        <div className="font-black uppercase italic text-lg group-hover:text-primary transition-colors">{admin.name}</div>
                                        <div className="text-[10px] font-bold uppercase opacity-40 flex items-center gap-2 italic">
                                            {admin.email} // PASS: {admin.registration}
                                        </div>
                                        <div className="bg-foreground text-background inline-block px-2 py-0.5 text-[8px] font-black uppercase italic">
                                            Praça: {admin.site}
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex items-center justify-center border-t-2 sm:border-t-0 sm:border-l-2 border-foreground/10 sm:pl-6 pt-4 sm:pt-0">
                                        {results[admin.registration] ? (
                                            results[admin.registration].status === 'success' ? (
                                                <span className="flex items-center font-black text-xs text-primary uppercase italic italic gap-2 transition-all scale-110">
                                                    <CheckCircle2 className="w-5 h-5" /> {results[admin.registration].message}
                                                </span>
                                            ) : (
                                                <span className="flex items-center font-black text-xs text-secondary uppercase italic gap-2 animate-pulse">
                                                    <XCircle className="w-5 h-5" /> {results[admin.registration].message}
                                                </span>
                                            )
                                        ) : (
                                            <span className="font-black text-xs uppercase italic opacity-20">Standby...</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupAdmins;
