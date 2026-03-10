import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Clock, Brain, Info, Sparkles, ArrowRight, Download, CheckSquare, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

const getProfileColor = (profile: string | null) => {
  if (!profile) return "var(--muted)";
  switch (profile.toUpperCase()) {
    case "D": return "var(--secondary)"; // Orange
    case "I": return "var(--primary)";   // Green
    case "S": return "var(--secondary)";
    case "C": return "var(--primary)";
    default: return "var(--foreground)";
  }
};

export const ParticipantsTable = ({ participants }: ParticipantsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = useMemo(() =>
    participants.length > 0 && participants.every(p => selectedIds.has(p.id)),
    [participants, selectedIds]
  );

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      participants.forEach(p => next.delete(p.id));
    } else {
      participants.forEach(p => next.add(p.id));
    }
    setSelectedIds(next);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExport = () => {
    const selectedParticipants = participants.filter(p => selectedIds.has(p.id));
    if (selectedParticipants.length === 0) return;

    const headers = ["Nome", "Matrícula", "Cargo", "Praça", "Turma", "Mindset", "VAC", "Perfil", "Status"];
    const rows = selectedParticipants.map(p => [
      p.name,
      p.registration,
      p.cargo || "",
      p.site || "",
      p.class_name || "",
      p.mindset_tipo || "",
      p.vac_dominante || "",
      p.dominant_profile || "",
      p.has_completed_test ? "Concluído" : "Pendente"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `MA_REPORT_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-background">
      {/* Table Control Bar */}
      <div className="bg-foreground text-background p-2 flex items-center justify-between border-b-4 border-foreground px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 hover:text-primary transition-colors group"
          >
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-30 group-hover:opacity-100" />}
            <span className="text-[10px] font-black uppercase italic tracking-widest">
              {selectedIds.size} SELECTED
            </span>
          </button>
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1 font-black text-[10px] uppercase italic animate-in slide-in-from-right-4"
          >
            <Download className="w-3 h-3" />
            DOWNLOAD_REPORT (.CSV)
          </button>
        )}
      </div>

      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="border-b-4 border-foreground hover:bg-transparent">
            <TableHead className="w-12 bg-foreground/5 h-14" />
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">Nome_Participante</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">ID_Matrícula</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">Cargo</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">Praça</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">Turma</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">Mindset</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">VAC</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5">Perfil_DISC</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5 text-center">Insights_IA</TableHead>
            <TableHead className="font-black uppercase italic text-[10px] tracking-widest text-foreground h-14 bg-foreground/5 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.length === 0 ? (
            <TableRow className="border-b-4 border-foreground hover:bg-transparent">
              <TableCell colSpan={11} className="h-32 text-center">
                <span className="font-black uppercase italic opacity-20 text-4xl">No_Data_Found</span>
              </TableCell>
            </TableRow>
          ) : (
            participants.map((participant) => {
              const isSelected = selectedIds.has(participant.id);

              return (
                <TableRow
                  key={participant.id}
                  onClick={() => toggleSelect(participant.id)}
                  className={cn(
                    "border-b-4 border-foreground transition-all group cursor-pointer select-none",
                    isSelected
                      ? "bg-primary/20 hover:bg-primary/30"
                      : "hover:bg-foreground/5"
                  )}
                >
                  <TableCell className="text-center p-0 w-12 border-r-4 border-foreground/10">
                    <div className="w-full h-full flex items-center justify-center">
                      {isSelected ? (
                        <div className="bg-primary text-primary-foreground p-0.5 border-2 border-foreground animate-in zoom-in-75">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                      ) : (
                        <Square className="w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-black uppercase text-xs">
                    <div className="flex items-center gap-2">
                      {isSelected && <div className="w-1.5 h-4 bg-primary animate-pulse" />}
                      {participant.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-[10px] opacity-40">#{participant.registration}</TableCell>
                  <TableCell className="font-bold text-[10px]">{participant.cargo?.toUpperCase() || "-"}</TableCell>
                  <TableCell>
                    <span className="bg-foreground text-background px-2 py-0.5 font-black text-[9px] uppercase italic">
                      {participant.site || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-[10px] italic">{participant.class_name || "-"}</TableCell>
                  <TableCell>
                    {participant.mindset_tipo ? (
                      <span className="border-2 border-foreground px-2 py-0.5 font-black text-[9px] uppercase bg-secondary text-secondary-foreground">
                        {participant.mindset_tipo}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {participant.vac_dominante ? (
                      <span className="border-2 border-foreground px-2 py-0.5 font-black text-[9px] uppercase bg-foreground text-background">
                        {participant.vac_dominante}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {participant.dominant_profile ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="flex items-center gap-2 cursor-help"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span
                                  className="w-8 h-8 flex items-center justify-center border-4 border-foreground font-black text-xs italic"
                                  style={{ backgroundColor: getProfileColor(participant.dominant_profile) }}
                                >
                                  {participant.dominant_profile}
                                </span>
                                <Info className="h-3 w-3 opacity-30" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-foreground text-background border-none p-4 rounded-none">
                              <div className="font-black text-[10px] space-y-1 uppercase italic">
                                <p className="border-b border-background/20 mb-2 pb-1">Scores_DISC</p>
                                <p className="text-secondary">D: {participant.score_d || 0}</p>
                                <p className="text-primary">I: {participant.score_i || 0}</p>
                                <p className="text-secondary">S: {participant.score_s || 0}</p>
                                <p className="text-primary">C: {participant.score_c || 0}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="opacity-20">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    {participant.insights_consultivos ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="bg-foreground text-background p-2 group/btn hover:bg-secondary transition-colors border-2 border-foreground shadow-[2px_2px_0px_var(--foreground)] active:shadow-none translate-x-[-1px] translate-y-[-1px]">
                            <Brain className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl border-8 border-foreground bg-background p-0 rounded-none overflow-hidden flex flex-col max-h-[90vh]">
                          <div className="bg-foreground text-background p-6 flex justify-between items-center">
                            <DialogHeader className="p-0">
                              <DialogTitle className="text-3xl font-black uppercase italic leading-none tracking-tighter text-background">
                                Assessment_Report // {participant.name}
                              </DialogTitle>
                            </DialogHeader>
                            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                          </div>
                          <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1 bg-background">
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                              <div className="prose prose-invert max-w-none text-foreground font-medium">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-6 leading-relaxed text-sm opacity-70 italic">{children}</p>,
                                    h1: ({ children }) => <h1 className="text-4xl font-black uppercase italic border-l-8 border-primary pl-4 mb-8 mt-12">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-2xl font-black uppercase italic border-l-8 border-secondary pl-4 mb-6 mt-10">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-xl font-black uppercase italic mb-4 mt-8">{children}</h3>,
                                    li: ({ children }) => (
                                      <div className="flex gap-4 items-start mb-4 group cursor-default">
                                        <ArrowRight className="w-5 h-5 mt-1 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                                        <div className="font-bold text-sm uppercase italic">{children}</div>
                                      </div>
                                    ),
                                    ul: ({ children }) => <div className="space-y-2 my-6">{children}</div>
                                  }}
                                >
                                  {participant.insights_consultivos}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                          <div className="bg-foreground text-background p-4 text-[10px] font-black uppercase italic flex justify-between border-t-4 border-foreground">
                            <span>AEC // INTELLIGENT_SYSTEM // v2.0</span>
                            <span className="opacity-50">Confidential Data</span>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="opacity-20 text-[10px] font-black italic">Waiting...</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {participant.has_completed_test ? (
                      <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 border-2 border-foreground font-black text-[10px] uppercase italic">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Concluído</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 border-2 border-foreground font-black text-[10px] uppercase italic">
                        <Clock className="h-3 w-3" />
                        <span>Pendente</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
