import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

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
            <TableHead>Status</TableHead>
            <TableHead>Perfil</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                <TableCell>
                  {participant.dominant_profile ? (
                    <Badge variant={getProfileBadgeColor(participant.dominant_profile)}>
                      {participant.dominant_profile}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
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
