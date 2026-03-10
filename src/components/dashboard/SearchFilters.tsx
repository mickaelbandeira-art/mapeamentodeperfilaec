import { Search } from "lucide-react";
import { SITES } from "../RegistrationScreen";
import { cn } from "@/lib/utils";

import { DateRangePicker } from "./DateRangePicker";
import { DateRange } from "react-day-picker";

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
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
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
  dateRange,
  onDateRangeChange,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-0">
      <div className="flex flex-col lg:flex-row gap-0 border-4 border-foreground bg-foreground overflow-hidden shadow-[8px_8px_0px_var(--secondary)]">
        {/* Module 01: Search & Time (Unified Block) */}
        <div className="flex flex-col md:flex-row flex-[3] bg-background border-b-4 lg:border-b-0 lg:border-r-4 border-foreground">
          {/* Tactical Label Overlay */}
          <div className="md:w-10 bg-foreground text-background flex md:flex-col items-center justify-center p-2 md:border-r-4 border-foreground gap-2 md:gap-4 select-none">
            <label className="text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-lr] md:rotate-180 opacity-50">CTRL</label>
            <div className="w-1 h-1 bg-primary animate-pulse" />
          </div>

          {/* Search Input */}
          <div className="relative flex-[1.5] group border-b-4 md:border-b-0 md:border-r-4 border-foreground">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Search className="h-5 w-5 text-foreground opacity-30 group-focus-within:opacity-100 group-focus-within:text-primary transition-all" />
            </div>
            <input
              type="text"
              placeholder="SEARCH_QUERY..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-full min-h-[70px] bg-transparent p-4 pl-12 font-black text-xs uppercase italic placeholder:text-foreground/20 focus:bg-foreground focus:text-background focus:placeholder:text-background/30 transition-all outline-none"
            />
            <div className="absolute top-2 right-4 pointer-events-none">
              <span className="text-[7px] font-black uppercase opacity-20 group-focus-within:opacity-0 tracking-tighter">IDENT_MOD_01</span>
            </div>
          </div>

          {/* Date Picker Component with Integrated Quick Filters */}
          <div className="flex-[2] flex flex-col justify-center px-6 py-4 bg-foreground/5 min-h-[70px]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[8px] font-black uppercase opacity-30 italic flex items-center gap-2">
                <div className="w-2 h-[2px] bg-current" />
                Time_Range_Selector
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const today = new Date();
                    onDateRangeChange({ from: today, to: today });
                  }}
                  className="text-[8px] font-black uppercase bg-foreground/10 hover:bg-primary hover:text-primary-foreground px-2 py-0.5 transition-all border-2 border-transparent hover:border-foreground"
                >
                  [ TODAY ]
                </button>
                <button
                  onClick={() => {
                    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
                    onDateRangeChange({ from: firstDay, to: lastDay });
                  }}
                  className="text-[8px] font-black uppercase bg-foreground/10 hover:bg-secondary hover:text-secondary-foreground px-2 py-0.5 transition-all border-2 border-transparent hover:border-foreground"
                >
                  [ MONTH ]
                </button>
              </div>
            </div>
            <DateRangePicker
              date={dateRange}
              setDate={onDateRangeChange}
              className="border-0 shadow-none p-0 bg-transparent"
            />
          </div>
        </div>

        {/* Module 02: Technical Parameters (Grid Block) */}
        <div className="flex-[3.5] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 bg-background">
          <div className="group border-r-4 border-foreground p-4 hover:bg-primary/10 transition-colors border-b-4 md:border-b-0">
            <label className="text-[8px] font-black uppercase opacity-30 italic block mb-2 tracking-widest text-primary">PARAM_CARGO</label>
            <div className="relative">
              <select
                value={filterCargo}
                onChange={(e) => onCargoChange(e.target.value)}
                className="w-full bg-transparent font-black text-xs uppercase italic appearance-none focus:outline-none cursor-pointer pr-4"
              >
                <option value="all" className="bg-background">ALL_CARGOS</option>
                {cargos?.map((cargo) => (
                  <option key={cargo} value={cargo} className="bg-background">{cargo.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {showSiteFilter && (
            <div className="group border-r-4 border-foreground p-4 hover:bg-secondary/10 transition-colors border-b-4 md:border-b-0">
              <label className="text-[8px] font-black uppercase opacity-30 italic block mb-2 tracking-widest text-secondary">AREA_SITE</label>
              <select
                value={filterSite}
                onChange={(e) => onSiteChange(e.target.value)}
                className="w-full bg-transparent font-black text-xs uppercase italic appearance-none focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-background">ALL_SITES</option>
                {SITES.map((site) => (
                  <option key={site} value={site} className="bg-background">{site}</option>
                ))}
              </select>
            </div>
          )}

          <div className="group border-r-4 border-foreground p-4 hover:bg-primary/10 transition-colors border-b-4 md:border-b-0">
            <label className="text-[8px] font-black uppercase opacity-30 italic block mb-2 tracking-widest text-primary">STATUS_FILT</label>
            <select
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full bg-transparent font-black text-xs uppercase italic appearance-none focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-background">ALL_STATUS</option>
              <option value="completed" className="bg-background">COMPLETED</option>
              <option value="pending" className="bg-background">PENDING</option>
            </select>
          </div>

          <div className={cn(
            "group p-4 hover:bg-secondary/10 transition-colors",
            showSiteFilter ? "border-r-4 border-foreground" : ""
          )}>
            <label className="text-[8px] font-black uppercase opacity-30 italic block mb-2 tracking-widest text-secondary">CLASS_REF</label>
            <select
              value={filterTurma}
              onChange={(e) => onTurmaChange(e.target.value)}
              className="w-full bg-transparent font-black text-xs uppercase italic appearance-none focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-background">ALL_CLASSES</option>
              {turmas?.map((turma) => (
                <option key={turma} value={turma} className="bg-background">{turma.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="group p-4 border-l-4 lg:border-l-0 border-foreground bg-primary/20 lg:bg-transparent col-span-2 md:col-span-1">
            <label className="text-[8px] font-black uppercase opacity-30 italic block mb-2 tracking-widest">INSTR_MGR</label>
            <select
              value={filterInstructor}
              onChange={(e) => onInstructorChange(e.target.value)}
              className="w-full bg-transparent font-black text-xs uppercase italic appearance-none focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-background">ALL_INSTRS</option>
              {instructors?.map((inst) => (
                <option key={inst.email} value={inst.email} className="bg-background">{inst.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sub-label Bar */}
      <div className="flex justify-between items-center py-2 px-1 text-[8px] font-black uppercase tracking-[0.3em] opacity-30 italic">
        <div className="flex items-center gap-2">
          <div className="w-8 h-[1px] bg-current" />
          <span>Active_Control_Strip</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Module_X_System_V4.0</span>
          <div className="w-8 h-[1px] bg-current" />
        </div>
      </div>
    </div>
  );
};
