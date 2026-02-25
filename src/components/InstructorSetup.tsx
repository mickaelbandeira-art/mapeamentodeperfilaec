import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog, Users, GraduationCap, Mail, Sparkles, ArrowLeft } from "lucide-react";
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
                title: "Campos obrigatórios",
                description: "Por favor, preencha todos os dados do instrutor e da turma.",
                variant: "destructive",
            });
            return;
        }

        onComplete({
            instructorName,
            instructorRegistration,
            instructorEmail,
            className,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-20 relative overflow-hidden">
            <WaveBackground />
            <DotPattern position="top-right" />
            <DotPattern position="bottom-left" />

            <Card className="max-w-2xl w-full p-6 sm:p-8 md:p-12 glass-card shadow-2xl relative z-10 animate-fade-in pt-16 sm:pt-20">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="absolute left-6 top-6 text-gray-400 hover:text-white flex items-center gap-2 group z-50 bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Voltar
                </Button>
                <div className="text-center space-y-6">
                    <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-500 mb-4 animate-float shadow-lg glow-blue">
                        <UserCog className="w-12 h-12 md:w-16 md:h-16 text-white" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-hero leading-tight">
                        Identificação do Instrutor
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto">
                        Configure a turma antes de iniciar o teste para os alunos
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-8 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="instructorName" className="text-base flex items-center gap-2">
                                    <UserCog className="w-4 h-4 text-blue-400" /> Nome do Instrutor *
                                </Label>
                                <Input
                                    id="instructorName"
                                    type="text"
                                    placeholder="Nome completo"
                                    value={instructorName}
                                    onChange={(e) => setInstructorName(e.target.value)}
                                    className="h-12 text-base glass-card-hover border-border/50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructorRegistration" className="text-base flex items-center gap-2">
                                    <span className="text-blue-400">#</span> Matrícula *
                                </Label>
                                <Input
                                    id="instructorRegistration"
                                    type="text"
                                    placeholder="Sua matrícula"
                                    value={instructorRegistration}
                                    onChange={(e) => setInstructorRegistration(e.target.value)}
                                    className="h-12 text-base glass-card-hover border-border/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instructorEmail" className="text-base flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-400" /> E-mail do Instrutor *
                            </Label>
                            <Input
                                id="instructorEmail"
                                type="email"
                                placeholder="seu.email@aec.com.br"
                                value={instructorEmail}
                                onChange={(e) => setInstructorEmail(e.target.value)}
                                className="h-12 text-base glass-card-hover border-border/50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="className" className="text-base flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-400" /> Nome da Turma / Identificador *
                            </Label>
                            <Input
                                id="className"
                                type="text"
                                placeholder="Ex: Integração_BH_Manhã"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="h-12 text-base glass-card-hover border-border/50"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 shadow-2xl glow-blue hover:scale-105 transition-all duration-300 font-bold mt-4"
                        >
                            <Users className="w-5 h-5 mr-2" />
                            Configurar Turma e Iniciar
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};
