import { Search } from "lucide-react";
import { SITES } from "../RegistrationScreen";

interface SearchFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterCargo: string;
  onCargoChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterTurma: string;
  onTurmaChange: (value: string) => void;
  filterInstructor: string;
  onInstructorChange: (value: string) => void;
  filterSite: string;
  onSiteChange: (value: string) => void;
  cargos: string[];
  turmas: string[];
  instructors: { name: string; email: string }[];
  showSiteFilter?: boolean;
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
  filterSite,
  onSiteChange,
  showSiteFilter = false,
}: SearchFiltersProps) => {
  return (
    <div className="flex flex-col xl:flex-row gap-6 bg-background p-6 border-4 border-foreground shadow-[10px_10px_0px_var(--secondary)]">
      {/* Search Input */}
      <div className="relative flex-1 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Search className="h-5 w-5 text-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder="BUSCAR_DADOS..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background border-4 border-foreground p-4 pl-12 font-black text-xs uppercase italic placeholder:text-foreground/20 focus:bg-primary focus:text-primary-foreground focus:outline-none transition-all outline-none"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-[2]">
        {/* Selects with Brutalist Treatment */}
        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase opacity-40 italic">Filter_Cargo</label>
          <select
            value={filterCargo}
            onChange={(e) => onCargoChange(e.target.value)}
            className="w-full bg-background border-4 border-foreground p-3 font-black text-[10px] uppercase italic appearance-none focus:bg-primary focus:text-primary-foreground transition-all outline-none cursor-pointer"
          >
            <option value="all">TODOS_CARGOS</option>
            {cargos?.map((cargo) => (
              <option key={cargo} value={cargo}>{cargo.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {showSiteFilter && (
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase opacity-40 italic">Filter_Praça</label>
            <select
              value={filterSite}
              onChange={(e) => onSiteChange(e.target.value)}
              className="w-full bg-background border-4 border-foreground p-3 font-black text-[10px] uppercase italic appearance-none focus:bg-secondary focus:text-secondary-foreground transition-all outline-none cursor-pointer"
            >
              <option value="all">TODAS_PRAÇAS</option>
              {SITES.map((site) => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase opacity-40 italic">Filter_Status</label>
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-background border-4 border-foreground p-3 font-black text-[10px] uppercase italic appearance-none focus:bg-primary transition-all outline-none cursor-pointer"
          >
            <option value="all">TODOS_STATUS</option>
            <option value="completed">CONCLUÍDO</option>
            <option value="pending">PENDENTE</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase opacity-40 italic">Filter_Turma</label>
          <select
            value={filterTurma}
            onChange={(e) => onTurmaChange(e.target.value)}
            className="w-full bg-background border-4 border-foreground p-3 font-black text-[10px] uppercase italic appearance-none focus:bg-secondary transition-all outline-none cursor-pointer"
          >
            <option value="all">TODAS_TURMAS</option>
            {turmas?.map((turma) => (
              <option key={turma} value={turma}>{turma.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1 col-span-2 lg:col-span-1">
          <label className="text-[8px] font-black uppercase opacity-40 italic">Filter_Instrutor</label>
          <select
            value={filterInstructor}
            onChange={(e) => onInstructorChange(e.target.value)}
            className="w-full bg-background border-4 border-foreground p-3 font-black text-[10px] uppercase italic appearance-none focus:bg-primary transition-all outline-none cursor-pointer"
          >
            <option value="all">TODOS_INSTRUTORES</option>
            {instructors?.map((inst) => (
              <option key={inst.email} value={inst.email}>{inst.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
