import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterCargo: string;
  onCargoChange: (value: string) => void;
  filterStatus: string;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterTurma: string;
  onTurmaChange: (value: string) => void;
  filterInstructor: string;
  onInstructorChange: (value: string) => void;
  cargos: string[];
  turmas: string[];
  instructors: { name: string; email: string }[];
}

export const SearchFilters = ({
  searchText,
  onSearchChange,
  filterCargo,
  onCargoChange,
  filterStatus,
  onStatusChange,
  filterTurma,
  onTurmaChange,
  filterInstructor,
  onInstructorChange,
  cargos,
  turmas,
  instructors,
}: SearchFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, matrícula ou email..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filterCargo} onValueChange={onCargoChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filtrar por cargo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os cargos</SelectItem>
          {cargos.map((cargo) => (
            <SelectItem key={cargo} value={cargo}>
              {cargo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterTurma} onValueChange={onTurmaChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Turma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as turmas</SelectItem>
          {turmas.map((turma) => (
            <SelectItem key={turma} value={turma}>
              {turma}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterInstructor} onValueChange={onInstructorChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Instrutor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os instrutores</SelectItem>
          {instructors.map((instructor) => (
            <SelectItem key={instructor.email} value={instructor.email}>
              {instructor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
