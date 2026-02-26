import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Brain, FileText, Info, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Participant {
  id: string;
  name: string;
  registration: string;
  email: string;
  cargo: string;
  has_completed_test: boolean;
  dominant_profile: string | null;
  score_d: number | null;
  score_i: number | null;
  score_s: number | null;
  score_c: number | null;
  site: string | null;
  class_name: string | null;
  instructor_name: string | null;
  mindset_tipo: string | null;
  vac_dominante: string | null;
  insights_consultivos: string | null;
}

interface ParticipantsTableProps {
  participants: Participant[];
}

const getProfileBadgeColor = (profile: string | null) => {
  if (!profile) return "secondary";
  switch (profile.toUpperCase()) {
    case "D":
      return "destructive";
    case "I":
      return "default";
    case "S":
      return "secondary";
    case "C":
      return "outline";
    default:
      return "secondary";
  }
};

export const ParticipantsTable = ({ participants }: ParticipantsTableProps) => {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Praça</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Instrutor</TableHead>
            <TableHead>Mindset</TableHead>
            <TableHead>VAC</TableHead>
            <TableHead>Perfil / DISC</TableHead>
            <TableHead>IA Consultiva</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Nenhum participante encontrado
              </TableCell>
            </TableRow>
          ) : (
            participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">{participant.name}</TableCell>
                <TableCell>{participant.registration}</TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell>{participant.cargo}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {participant.site || "-"}
                  </Badge>
                </TableCell>
                <TableCell>{participant.class_name || "-"}</TableCell>
                <TableCell>{participant.instructor_name || "-"}</TableCell>
                <TableCell>
                  {participant.mindset_tipo ? (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      {participant.mindset_tipo}
                    </Badge>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  {participant.vac_dominante ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      {participant.vac_dominante}
                    </Badge>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {participant.dominant_profile ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={getProfileBadgeColor(participant.dominant_profile)}>
                          {participant.dominant_profile}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover border border-border p-2">
                              <div className="text-xs space-y-1">
                                <p className="font-bold border-b border-border pb-1 mb-1">Pontuações DISC:</p>
                                <p className="text-red-400">D: {participant.score_d || 0}</p>
                                <p className="text-amber-400">I: {participant.score_i || 0}</p>
                                <p className="text-emerald-400">S: {participant.score_s || 0}</p>
                                <p className="text-blue-400">C: {participant.score_c || 0}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {participant.insights_consultivos ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10">
                          <Brain className="h-4 w-4" />
                          Ver Relatório
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-card border-white/10 text-gray-200 custom-scrollbar">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
                            <Sparkles className="h-6 w-6 text-purple-400" />
                            Relatório Consultivo - {participant.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown>{participant.insights_consultivos}</ReactMarkdown>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Aguardando...</span>
                  )}
                </TableCell>
                <TableCell>
                  {participant.has_completed_test ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Concluído</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Clock className="h-4 w-4" />
                      <span>Pendente</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
