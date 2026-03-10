import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Trash2, Users, Briefcase, GraduationCap, Building, MapPin, X, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SITES } from "../RegistrationScreen";

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
            fetchClasses();
        }
    }, [profile]);

    const fetchClasses = async () => {
        if (!profile) return;
        try {
            setLoading(true);
            const data = await api.get(`/classes?site=${profile?.site || 'all'}`);
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
                description: "Por favor, preencha todos os campos.",
                variant: "destructive",
            });
            return;
        }
        try {
            await api.post("/classes", formData);

            toast({ title: "Sucesso!", description: "Turma ativada no sistema." });
            setIsCreating(false);
            setFormData({
                name: "",
                instructor_name: profile?.full_name || "",
                instructor_registration: profile?.matricula || "",
                area: "",
                product: "",
                site: profile?.site || "",
            });
            fetchClasses();
        } catch (error: any) {
            toast({ title: "Erro na criação", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Confirmar desativação de turma?")) return;
        try {
            await api.patch(`/classes/${id}`, { is_active: false });
            toast({ title: "Arquivo Atualizado", description: "Turma removida do log ativo." });
            fetchClasses();
        } catch (error: any) {
            toast({ title: "Erro na desativação", description: error.message, variant: "destructive" });
        }
    };


    return (
        <div className="p-8 space-y-12">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-4 border-foreground">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Gestão_de_Turmas</h2>
                    <p className="text-sm font-bold uppercase opacity-50 italic">Controle // Registro // Administração</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-primary text-primary-foreground border-4 border-foreground px-8 py-4 font-black uppercase italic shadow-[6px_6px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Gerar_Nova_Turma
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="border-8 border-foreground bg-background p-8 md:p-12 animate-in fade-in slide-in-from-top-8 duration-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => setIsCreating(false)} className="text-foreground hover:text-primary transition-colors">
                            <X className="w-10 h-10" />
                        </button>
                    </div>

                    <div className="mb-12">
                        <h3 className="text-5xl font-black uppercase italic leading-[0.8] mb-4">Nova_Unit</h3>
                        <div className="w-20 h-4 bg-primary" />
                    </div>

                    <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Nome_da_Turma</label>
                            <input
                                placeholder="IDENTIFICAÇÃO..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-primary focus:text-primary-foreground outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Área_Setor</label>
                            <input
                                placeholder="ADMIN / OPS / RH..."
                                value={formData.area}
                                onChange={e => setFormData({ ...formData, area: e.target.value })}
                                className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-secondary focus:text-secondary-foreground outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Produto_Operação</label>
                            <input
                                placeholder="CONTRATO..."
                                value={formData.product}
                                onChange={e => setFormData({ ...formData, product: e.target.value })}
                                className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-primary focus:text-primary-foreground outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Reg_Instrutor</label>
                            <input
                                placeholder="MATRÍCULA..."
                                value={formData.instructor_registration}
                                onChange={e => setFormData({ ...formData, instructor_registration: e.target.value })}
                                className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-secondary focus:text-secondary-foreground outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Praça_Unidade</label>
                            <select
                                value={formData.site}
                                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                disabled={profile?.role !== 'admin' && !!profile?.site}
                                className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-primary transition-all outline-none cursor-pointer appearance-none"
                                required
                            >
                                <option value="">SELECIONE_PRAÇA...</option>
                                {SITES.map((site) => (
                                    <option key={site} value={site}>{site}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-6 pt-12 border-t-4 border-foreground">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="font-black uppercase italic text-xs border-b-4 border-transparent hover:border-foreground transition-all px-4 py-2"
                            >
                                Abortar
                            </button>
                            <button
                                type="submit"
                                className="bg-foreground text-background border-4 border-foreground px-12 py-4 font-black uppercase italic hover:bg-secondary shadow-[6px_6px_0px_var(--primary)] active:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Salvar_Registro
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List core */}
            <div className="border-4 border-foreground overflow-x-auto bg-background">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-4 border-foreground bg-foreground/5 h-16">
                            <th className="px-6 text-left font-black uppercase italic text-[10px] tracking-widest">Turma_Ref</th>
                            <th className="px-6 text-left font-black uppercase italic text-[10px] tracking-widest">Praça_Sede</th>
                            <th className="px-6 text-left font-black uppercase italic text-[10px] tracking-widest">Instrutor_ID</th>
                            <th className="px-6 text-left font-black uppercase italic text-[10px] tracking-widest">Área_Prod</th>
                            <th className="px-6 text-left font-black uppercase italic text-[10px] tracking-widest text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="border-b-4 border-foreground">
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="font-black uppercase italic animate-pulse text-2xl opacity-20">Syncing_Records...</div>
                                </td>
                            </tr>
                        ) : classes.length === 0 ? (
                            <tr className="border-b-4 border-foreground">
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="font-black uppercase italic opacity-20 text-4xl italic">Archive_Empty</div>
                                </td>
                            </tr>
                        ) : (
                            classes.map((c) => (
                                <tr key={c.id} className="border-b-4 border-foreground hover:bg-secondary group transition-colors">
                                    <td className="px-6 py-4 font-black uppercase text-xs italic group-hover:text-secondary-foreground">{c.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-foreground text-background px-2 py-0.5 font-black text-[10px] uppercase italic">
                                            {c.site}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[10px] group-hover:text-secondary-foreground">
                                        {c.instructor_name?.toUpperCase()} ({c.instructor_registration})
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[10px] group-hover:text-secondary-foreground uppercase italic">
                                        {c.area} // {c.product}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="p-2 border-2 border-transparent hover:border-foreground hover:bg-background text-foreground transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
