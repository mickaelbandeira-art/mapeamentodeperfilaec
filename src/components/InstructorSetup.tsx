import { useState } from "react";
import { UserCog, Users, GraduationCap, Mail, Sparkles, ArrowLeft, Save } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { DotPattern } from "./DotPattern";
import { toast } from "@/hooks/use-toast";

interface InstructorData {
    instructorName: string;
    instructorRegistration: string;
    instructorEmail: string;
    className: string;
}

interface InstructorSetupProps {
    onComplete: (data: InstructorData) => void;
    onBack: () => void;
}

export const InstructorSetup = ({ onComplete, onBack }: InstructorSetupProps) => {
    const [instructorName, setInstructorName] = useState("");
    const [instructorRegistration, setInstructorRegistration] = useState("");
    const [instructorEmail, setInstructorEmail] = useState("");
    const [className, setClassName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!instructorName || !instructorRegistration || !instructorEmail || !className) {
            toast({
                title: "Erro_Validacao",
                description: "Terminal exige preenchimento total dos vetores.",
                variant: "destructive",
            });
            return;
        }
        onComplete({ instructorName, instructorRegistration, instructorEmail, className });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 relative overflow-hidden bg-background">
            <WaveBackground />
            <DotPattern position="top-right" />
            <DotPattern position="bottom-left" />

            <div className="max-w-4xl w-full border-8 border-foreground bg-background p-12 md:p-16 relative z-10 animate-in slide-in-from-bottom-12 duration-1000 shadow-[20px_20px_0px_var(--secondary)]">
                <button
                    onClick={onBack}
                    className="absolute left-0 top-0 mt-8 ml-8 bg-foreground text-background px-4 py-2 font-black uppercase italic text-xs flex items-center gap-2 hover:bg-primary transition-all shadow-[4px_4px_0px_var(--secondary)] active:shadow-none"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back_Node
                </button>

                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b-8 border-foreground pb-8">
                        <div className="space-y-4">
                            <div className="bg-primary text-primary-foreground inline-block px-4 py-1 text-xs font-black uppercase italic tracking-widest translate-x-1">
                                System // Instructor // Setup
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black leading-[0.8] uppercase italic tracking-tighter">
                                Configuração
                            </h1>
                        </div>
                        <div className="w-20 h-20 bg-foreground text-background flex items-center justify-center border-4 border-foreground rotate-[5deg] shrink-0">
                            <UserCog className="w-12 h-12" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                    <UserCog className="w-4 h-4 text-primary" /> Nome_Instrutor
                                </label>
                                <input
                                    type="text"
                                    placeholder="NOME_COMPLETO..."
                                    value={instructorName}
                                    onChange={(e) => setInstructorName(e.target.value)}
                                    className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-primary focus:text-primary-foreground outline-none transition-all placeholder:text-foreground/20"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                    <span className="text-primary font-black">#</span> Matrícula_Ref
                                </label>
                                <input
                                    type="text"
                                    placeholder="NÚMERO_ID..."
                                    value={instructorRegistration}
                                    onChange={(e) => setInstructorRegistration(e.target.value)}
                                    className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-secondary focus:text-secondary-foreground outline-none transition-all placeholder:text-foreground/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" /> E-mail_Corporativo
                            </label>
                            <input
                                type="email"
                                placeholder="USUARIO.SOBRENOME@AEC.COM.BR..."
                                value={instructorEmail}
                                onChange={(e) => setInstructorEmail(e.target.value)}
                                className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-primary outline-none transition-all placeholder:text-foreground/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-primary" /> Identificador_Turma
                            </label>
                            <input
                                type="text"
                                placeholder="EX: OPS_VIVO_BH_2024..."
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="w-full bg-background border-4 border-foreground p-4 font-black text-xs uppercase italic focus:bg-secondary outline-none transition-all placeholder:text-foreground/20"
                                required
                            />
                        </div>

                        <div className="pt-8 border-t-8 border-foreground">
                            <button
                                type="submit"
                                className="w-full border-4 border-foreground bg-foreground text-background py-8 font-black uppercase italic text-2xl hover:bg-primary hover:text-primary-foreground shadow-[10px_10px_0px_var(--secondary)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-4 group"
                            >
                                <Save className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                Iniciar_Sessão_Ativa
                                <Sparkles className="w-6 h-6 animate-pulse" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Decorative Label */}
                <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                    <div className="text-[8vw] font-black uppercase italic leading-none -mb-10 -mr-10">SETUP</div>
                </div>
            </div>
        </div>
    );
};
