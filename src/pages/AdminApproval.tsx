import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserCheck, UserX, Clock, ShieldCheck, Mail, MapPin, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

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
                title: "Erro ao buscar solicitações",
                description: error.message,
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
                title: status === "approved" ? "Usuário Aprovado" : "Solicitação Rejeitada",
                description: `O acesso foi ${status === "approved" ? "concedido" : "negado"} com sucesso.`,
            });

            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error: any) {
            toast({
                title: "Erro ao processar",
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="space-y-2">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Aprovações Pendentes</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Gerencie solicitações de acesso administrativo de novos colaboradores.
                    </p>
                </header>

                {pendingUsers.length === 0 ? (
                    <Card className="glass-card flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle>Nenhuma solicitação pendente</CardTitle>
                            <CardDescription>
                                Todos os pedidos de acesso foram processados.
                            </CardDescription>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingUsers.map((user) => (
                            <Card key={user.id} className="glass-card overflow-hidden border-white/5 hover:border-primary/20 transition-all">
                                <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between py-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize">
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-semibold text-foreground">{user.full_name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-4 h-4" /> {user.email}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Matrícula</Label>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Hash className="w-4 h-4 text-primary" /> {user.matricula}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Cargo</Label>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Briefcase className="w-4 h-4 text-primary" /> {user.cargo}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Praça</Label>
                                            <div className="flex items-center gap-2 font-medium">
                                                <MapPin className="w-4 h-4 text-primary" /> {user.site}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={() => handleApproval(user.id, "approved")}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                                            disabled={!!processingId}
                                        >
                                            {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><UserCheck className="w-4 h-4 mr-2" /> Aprovar</>}
                                        </Button>
                                        <Button
                                            onClick={() => handleApproval(user.id, "rejected")}
                                            variant="outline"
                                            className="flex-1 border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                                            disabled={!!processingId}
                                        >
                                            {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserX className="w-4 h-4 mr-2" /> Recusar</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminApproval;

// Label component fix (Hash and Label usage)
const Hash = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" /></svg>
);
