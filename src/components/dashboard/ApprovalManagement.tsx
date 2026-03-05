import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, UserCheck, UserX, Clock, ShieldCheck, Mail, MapPin, Briefcase, Hash } from "lucide-react";

export const ApprovalManagement = () => {
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPendingUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPendingUsers(data || []);
        } catch (error: any) {
            toast({
                title: "Erro de Conexão",
                description: "Falha ao sincronizar registros pendentes.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApproval = async (userId: string, status: "approved" | "rejected") => {
        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    status,
                    approved_at: status === "approved" ? new Date().toISOString() : null,
                    approved_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq("id", userId);

            if (error) throw error;

            toast({
                title: status === "approved" ? "ACESSO_CONCEDIDO" : "REQUISIÇÃO_NEGADA",
                description: `O terminal foi ${status === "approved" ? "liberado" : "bloqueado"} com sucesso.`,
            });

            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error: any) {
            toast({
                title: "Erro_Execução",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-24 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header Mini-Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-foreground text-background p-6 border-4 border-foreground shadow-[10px_10px_0px_var(--secondary)]">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-12 h-12 text-primary" />
                    <div>
                        <h2 className="text-2xl font-black uppercase italic italic leading-none">Status de Segurança</h2>
                        <p className="font-black text-xs uppercase italic opacity-70 tracking-tighter">
                            {pendingUsers.length} requisições aguardando processamento heurístico
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchPendingUsers}
                    className="border-2 border-background px-4 py-2 text-[10px] font-black uppercase italic hover:bg-background hover:text-foreground transition-all flex items-center gap-2"
                >
                    <Loader2 className={cn("w-3 h-3", isLoading && "animate-spin")} />
                    Sincronizar Terminal
                </button>
            </div>

            {pendingUsers.length === 0 ? (
                <div className="border-8 border-foreground p-24 text-center space-y-8 bg-background relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-[15vw] font-black italic uppercase leading-none select-none">
                        CLEAN
                    </div>
                    <div className="flex justify-center">
                        <Clock className="w-24 h-24 text-muted-foreground/20 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter">Fila_Vazia</h2>
                        <p className="text-sm font-bold uppercase opacity-50 italic">Nenhum privilégio administrativo solicitado...</p>
                        <div className="pt-8">
                            <button
                                onClick={fetchPendingUsers}
                                className="bg-foreground text-background px-8 py-4 font-black uppercase italic text-sm hover:bg-primary hover:text-primary-foreground transition-all border-4 border-foreground shadow-[8px_8px_0px_var(--secondary)] active:shadow-none active:translate-x-1 active:translate-y-1"
                            >
                                Verificar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    {pendingUsers.map((user) => (
                        <div key={user.id} className="border-8 border-foreground bg-background hover:bg-foreground/5 transition-all group shadow-[15px_15px_0px_var(--secondary)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                            <div className="bg-foreground text-background p-4 flex justify-between items-center border-b-4 border-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary animate-pulse" />
                                    <span className="font-black text-[10px] uppercase italic tracking-widest">
                                        Role: {user.role?.toUpperCase() || 'COORDINATOR'}
                                    </span>
                                </div>
                                <span className="text-[10px] font-black uppercase italic opacity-50 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                        {user.full_name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm font-bold italic opacity-60">
                                        <Mail className="w-4 h-4 text-primary" /> {user.email}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-foreground/10">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase opacity-40 italic tracking-widest">Matrícula_ID</label>
                                        <div className="flex items-center gap-2 font-black text-xs uppercase group-hover:translate-x-1 transition-transform">
                                            <Hash className="w-4 h-4 text-primary" /> {user.matricula}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase opacity-40 italic tracking-widest">Cargo_Ref</label>
                                        <div className="flex items-center gap-2 font-black text-xs uppercase group-hover:translate-x-1 transition-transform">
                                            <Briefcase className="w-4 h-4 text-secondary" /> {user.cargo}
                                        </div>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[9px] font-black uppercase opacity-40 italic tracking-widest">Praça_Unidade</label>
                                        <div className="flex items-center gap-2 font-black text-xs uppercase group-hover:translate-x-1 transition-transform">
                                            <MapPin className="w-4 h-4 text-primary" /> {user.site}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => handleApproval(user.id, "approved")}
                                        className="flex-1 bg-primary text-primary-foreground border-4 border-foreground p-4 font-black uppercase italic shadow-[10px_10px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                        disabled={!!processingId}
                                    >
                                        {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserCheck className="w-5 h-5" /> Autorizar</>}
                                    </button>
                                    <button
                                        onClick={() => handleApproval(user.id, "rejected")}
                                        className="flex-1 bg-background text-foreground border-4 border-foreground p-4 font-black uppercase italic hover:bg-secondary hover:text-secondary-foreground shadow-[10px_10px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
                                        disabled={!!processingId}
                                    >
                                        {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserX className="w-5 h-5" /> Bloquear</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
