import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserCheck, UserX, Clock, ShieldCheck, Mail, MapPin, Briefcase, Hash, ArrowRight } from "lucide-react";

const AdminApproval = () => {
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans p-8 lg:p-16 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-16 animate-in slide-in-from-bottom-8 duration-700">

                {/* Radical Header */}
                <div className="border-b-8 border-foreground pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative overflow-hidden">
                    <div className="space-y-4">
                        <div className="bg-primary text-primary-foreground inline-block px-4 py-1 text-xs font-black uppercase italic tracking-widest translate-x-1">
                            Security // Access // Control
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-[0.8] uppercase italic tracking-tighter">
                            Aprovações
                        </h1>
                        <p className="text-xl font-bold uppercase text-muted-foreground leading-none">
                            Fila de Requisição de Acesso Administrativo
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-foreground text-background p-4 border-4 border-foreground">
                        <ShieldCheck className="w-10 h-10" />
                        <div className="font-black text-xs uppercase italic">
                            Status: {pendingUsers.length} Pendente(s)
                        </div>
                    </div>
                </div>

                {pendingUsers.length === 0 ? (
                    <div className="border-8 border-foreground p-24 text-center space-y-8 bg-background relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-[15vw] font-black italic uppercase leading-none select-none">
                            Clean
                        </div>
                        <div className="flex justify-center">
                            <Clock className="w-24 h-24 text-muted-foreground/20 animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black uppercase italic tracking-tighter">Fila_Vazia</h2>
                            <p className="text-sm font-bold uppercase opacity-50 italic">Nenhuma solicitação aguardando processamento...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {pendingUsers.map((user) => (
                            <div key={user.id} className="border-8 border-foreground bg-background hover:bg-foreground/5 transition-all group shadow-[15px_15px_0px_var(--secondary)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                                <div className="bg-foreground text-background p-4 flex justify-between items-center border-b-4 border-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-primary animate-pulse" />
                                        <span className="font-black text-[10px] uppercase italic tracking-widest">
                                            Role: {user.role?.toUpperCase()}
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
                                            className="flex-1 bg-primary text-primary-foreground border-4 border-foreground p-4 font-black uppercase italic shadow-[6px_6px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                            disabled={!!processingId}
                                        >
                                            {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserCheck className="w-5 h-5" /> Autorizar</>}
                                        </button>
                                        <button
                                            onClick={() => handleApproval(user.id, "rejected")}
                                            className="flex-1 bg-background text-foreground border-4 border-foreground p-4 font-black uppercase italic hover:bg-secondary hover:text-secondary-foreground shadow-[6px_6px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2"
                                            disabled={!!processingId}
                                        >
                                            {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserX className="w-5 h-5" /> Bloquear</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-foreground text-background p-2 text-[8px] font-black uppercase italic text-center">
                                    Request_Hash: {user.id.substring(0, 16)}...
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* System Ticker */}
            <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground border-t-4 border-foreground py-2 overflow-hidden whitespace-nowrap z-50">
                <div className="flex animate-marquee font-black uppercase italic text-xs gap-12">
                    <span>Authorization Node Active</span>
                    <span>Pending Requests: {pendingUsers.length}</span>
                    <span>System v2.0 // Radical Approval Interface</span>
                    <span>Protocol: SEC-APPROVE-ALPHA</span>
                    <span>Authorization Node Active</span>
                    <span>Pending Requests: {pendingUsers.length}</span>
                    <span>System v2.0 // Radical Approval Interface</span>
                </div>
            </div>
        </div>
    );
};

export default AdminApproval;
