import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, Briefcase, GraduationCap, Building, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SITES } from "../RegistrationScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface TrainingClass {
    id: string;
    name: string;
    instructor_name: string;
    instructor_registration: string;
    area: string;
    product: string;
    site: string;
    created_at: string;
}

export const ClassManagement = () => {
    const { profile } = useAuth();
    const [classes, setClasses] = useState<TrainingClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        instructor_name: "",
        instructor_registration: "",
        area: "",
        product: "",
        site: profile?.site || "",
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                instructor_name: profile.full_name || "",
                instructor_registration: profile.matricula || "",
                site: profile.site || prev.site,
            }));
            fetchClasses(); // Fetch classes once profile is loaded
        }
    }, [profile]);

    const fetchClasses = async () => {
        if (!profile) return; // Don't fetch if profile is not loaded yet

        try {
            setLoading(true);
            let query = supabase
                .from("training_classes")
                .select("*")
                .eq("is_active", true);

            // Sempre filtrar pela praça do perfil logado (bloqueio estrito)
            if (profile?.site) {
                query = query.eq("site", profile.site);
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;
            setClasses(data || []);
        } catch (error: any) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.instructor_name || !formData.instructor_registration || !formData.site) {
            toast({
                title: "Campos obrigatórios",
                description: "Por favor, preencha todos os campos, incluindo a praça.",
                variant: "destructive",
            });
            return;
        }
        try {
            const { error } = await supabase
                .from("training_classes")
                .insert([{
                    ...formData,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                }]);

            if (error) throw error;

            toast({
                title: "Sucesso!",
                description: "Turma criada com sucesso.",
            });

            setIsCreating(false);
            setFormData({
                name: "",
                instructor_name: profile?.full_name || "",
                instructor_registration: profile?.matricula || "",
                area: "",
                product: "",
                site: profile?.site || "", // Reset site to user's default or empty
            });
            fetchClasses();
        } catch (error: any) {
            toast({
                title: "Erro ao criar turma",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja desativar esta turma?")) return;

        try {
            const { error } = await supabase
                .from("training_classes")
                .update({ is_active: false })
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Turma removida",
                description: "A turma foi desativada com sucesso.",
            });
            fetchClasses();
        } catch (error: any) {
            toast({
                title: "Erro ao remover turma",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Gestão de Turmas</h2>
                    <p className="text-muted-foreground text-sm">Crie e gerencie as turmas de treinamento</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Turma
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="glass-card animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle>Criar Nova Turma</CardTitle>
                        <CardDescription>Preencha os dados da turma para que os novatos possam se vincular a ela.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-primary" /> Nome da Turma
                                </Label>
                                <Input
                                    placeholder="Ex: Treinamento Inicial Fevereiro"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-primary" /> Área
                                </Label>
                                <Input
                                    placeholder="Ex: Operações / RH"
                                    value={formData.area}
                                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" /> Produto
                                </Label>
                                <Input
                                    placeholder="Ex: iFood / Vivo / Bradesco"
                                    value={formData.product}
                                    onChange={e => setFormData({ ...formData, product: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" /> Matrícula do Instrutor
                                </Label>
                                <Input
                                    placeholder="Sua matrícula"
                                    value={formData.instructor_registration}
                                    onChange={e => setFormData({ ...formData, instructor_registration: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" /> Praça
                                </Label>
                                <Select
                                    value={formData.site}
                                    onValueChange={(value) => setFormData({ ...formData, site: value })}
                                    disabled={profile?.role !== 'admin' && !!profile?.site}
                                    required
                                >
                                    <SelectTrigger className="glass-card-hover border-white/10 bg-transparent">
                                        <SelectValue placeholder="Selecione a praça" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-white/10 max-h-[300px]">
                                        {SITES.map((site) => (
                                            <SelectItem key={site} value={site}>
                                                {site}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90">
                                    Salvar Turma
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Turma</TableHead>
                            <TableHead>Praça</TableHead>
                            <TableHead>Instrutor</TableHead>
                            <TableHead>Área / Produto</TableHead>
                            <TableHead>Criação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell>
                            </TableRow>
                        ) : classes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma turma ativa encontrada.</TableCell>
                            </TableRow>
                        ) : (
                            classes.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-bold">{c.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                            {c.site}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{c.instructor_name} ({c.instructor_registration})</TableCell>
                                    <TableCell>{c.area} / {c.product}</TableCell>
                                    <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};
