import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ParticipantsTable } from "@/components/dashboard/ParticipantsTable";
import { DiscChart } from "@/components/dashboard/DiscChart";
import { AverageScoresChart } from "@/components/dashboard/AverageScoresChart";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassManagement } from "@/components/dashboard/ClassManagement";
import { ApprovalManagement } from "@/components/dashboard/ApprovalManagement";
import { Users, CheckCircle, Clock, TrendingUp, LogOut, GraduationCap, ClipboardList, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  total_participants: number;
  total_completed_tests: number;
  pending_tests: number;
  completion_rate: number;
}

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

const Dashboard = () => {
  const { signOut, profile, userRole } = useAuth();
  const isGlobalAdmin = userRole === 'admin';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterCargo, setFilterCargo] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTurma, setFilterTurma] = useState("all");
  const [filterInstructor, setFilterInstructor] = useState("all");
  const [cargos, setCargos] = useState<string[]>([]);
  const [turmas, setTurmas] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<{ name: string; email: string }[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    if (isGlobalAdmin) {
      fetchPendingCount();
    }
  }, [searchText, filterCargo, filterStatus, filterTurma, filterInstructor, profile, isGlobalAdmin]);

  const fetchPendingCount = async () => {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: 'exact', head: true })
      .eq("status", "pending");
    setPendingApprovalsCount(count || 0);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Stats: filter by user's site (RLS on the view handles enforcement)
      let statsData, statsError;
      try {
        const statsQuery = supabase.from("dashboard_stats").select("*");
        const response = profile?.site
          ? await statsQuery.eq("site", profile.site).maybeSingle()
          : await statsQuery.maybeSingle();
        statsData = response.data;
        statsError = response.error;
      } catch (e) {
        console.error("Erro ao carregar estatísticas:", e);
      }

      if (statsError) {
        setStats(null);
      } else {
        setStats(statsData);
      }

      // Participants: RPC enforces site scoping via auth.uid() in the DB function
      const { data: participantsData, error: participantsError } = await supabase.rpc("search_participants", {
        search_text: searchText || null,
        filter_status: filterStatus === "all" ? null : filterStatus,
        filter_cargo: filterCargo === "all" ? null : filterCargo,
        filter_coordinator: null,
        filter_turma: filterTurma === "all" ? null : filterTurma,
        filter_instructor_email: filterInstructor === "all" ? null : filterInstructor,
        filter_site: profile?.site || null, // RPC ignores this for non-admins and uses auth context
      });

      if (participantsError) throw participantsError;

      const mappedParticipants = (participantsData || [] as any[]).map(p => ({
        ...p,
        site: p?.site || null,
        class_name: p?.class_name || null,
        instructor_name: p?.instructor_name || null,
        mindset_tipo: p?.mindset_tipo || null,
        vac_dominante: p?.vac_dominante || null,
        insights_consultivos: p?.insights_consultivos || null
      })) as Participant[];

      setParticipants(mappedParticipants);

      const uniqueCargos = [...new Set(participantsData?.map((p: any) => p.cargo).filter(Boolean) || [])];
      setCargos(uniqueCargos as string[]);

      const uniqueTurmas = [...new Set(participantsData?.map((p: any) => p.class_name).filter(Boolean) || [])];
      setTurmas(uniqueTurmas as string[]);

      const uniqueInstructors = Array.from(
        new Map(
          participantsData
            ?.filter((p: any) => p.instructor_name && p.instructor_email)
            .map((p: any) => [p.instructor_email, { name: p.instructor_name, email: p.instructor_email }])
        ).values()
      );
      setInstructors(uniqueInstructors);

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const discData = participants
    .filter((p) => p.has_completed_test && p.dominant_profile)
    .reduce((acc: any, p) => {
      const profile = p.dominant_profile!;
      const existing = acc.find((item: any) => item.name === profile);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({
          name: profile,
          value: 1,
          color: getDiscColor(profile),
        });
      }
      return acc;
    }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pt-24 pb-12 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto px-6 space-y-12">

        {/* Radical Header */}
        <div className="border-b-8 border-foreground pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="bg-secondary text-secondary-foreground inline-block px-4 py-1 text-xs font-black uppercase italic tracking-widest translate-x-1">
                Admin // Control // System
              </div>
              {profile?.site && (
                <div className="bg-primary text-primary-foreground inline-flex items-center gap-1 px-4 py-1 text-xs font-black uppercase italic tracking-widest">
                  <span>Praça:</span>
                  <span>{profile.site}</span>
                </div>
              )}
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.8] uppercase italic tracking-tighter">
              Dashboard
            </h1>
            <p className="text-xl font-bold uppercase text-muted-foreground leading-none">
              Monitoramento de Perfil Psicométrico v2.0
            </p>
          </div>
          <button
            onClick={signOut}
            className="border-4 border-foreground bg-foreground text-background px-8 py-4 font-black uppercase italic hover:bg-primary hover:text-primary-foreground transition-all shadow-[8px_8px_0px_var(--secondary)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center gap-2 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>

        <Tabs defaultValue="participants" className="space-y-12">
          {/* Brutalist Tab Bar */}
          <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-4">
            <TabsTrigger
              value="participants"
              className="px-8 py-4 border-4 border-foreground font-black uppercase italic data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none shadow-[6px_6px_0px_var(--foreground)] translate-x-[-2px] translate-y-[-2px] transition-all flex items-center gap-3"
            >
              <ClipboardList className="w-5 h-5" />
              Participantes
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="px-8 py-4 border-4 border-foreground font-black uppercase italic data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none shadow-[6px_6px_0px_var(--foreground)] translate-x-[-2px] translate-y-[-2px] transition-all flex items-center gap-3"
            >
              <GraduationCap className="w-5 h-5" />
              Gestão de Turmas
            </TabsTrigger>
            {isGlobalAdmin && (
              <TabsTrigger
                value="approvals"
                className="px-8 py-4 border-4 border-foreground font-black uppercase italic data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none shadow-[6px_6px_0px_var(--foreground)] translate-x-[-2px] translate-y-[-2px] transition-all flex items-center gap-3 relative overflow-visible"
              >
                <ShieldAlert className="w-5 h-5" />
                Aprovações
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 border-2 border-foreground animate-bounce">
                    {pendingApprovalsCount}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="participants" className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Stats Grid */}
            {stats && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Participantes Totais"
                  value={stats.total_participants || 0}
                  icon={Users}
                  className="bg-background border-4 border-foreground shadow-[10px_10px_0px_var(--foreground)]"
                />
                <StatsCard
                  title="Concluídos"
                  value={stats.total_completed_tests || 0}
                  icon={CheckCircle}
                  className="bg-primary text-primary-foreground border-4 border-foreground shadow-[10px_10px_0px_var(--foreground)]"
                />
                <StatsCard
                  title="Pendentes"
                  value={stats.pending_tests || 0}
                  icon={Clock}
                  className="bg-secondary text-secondary-foreground border-4 border-foreground shadow-[10px_10px_0px_var(--foreground)]"
                />
                <StatsCard
                  title="Eficiência"
                  value={`${(stats.completion_rate || 0).toFixed(1)}%`}
                  icon={TrendingUp}
                  className="bg-background border-4 border-foreground shadow-[10px_10px_0px_var(--foreground)]"
                />
              </div>
            )}

            {/* Visual Analytics */}
            {discData.length > 0 && (
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5 border-4 border-foreground p-8 bg-background shadow-[12px_12px_0px_var(--foreground)]">
                  <h3 className="text-2xl font-black uppercase italic mb-8 border-b-4 border-foreground pb-2 flex items-center justify-between">
                    Distribuição DISC
                    <div className="w-2 h-2 bg-primary animate-pulse" />
                  </h3>
                  <DiscChart data={discData} />
                </div>
                <div className="lg:col-span-7 border-4 border-foreground p-8 bg-background shadow-[12px_12px_0px_var(--foreground)]">
                  <h3 className="text-2xl font-black uppercase italic mb-8 border-b-4 border-foreground pb-2">
                    Média de Pontuação
                  </h3>
                  <AverageScoresChart participants={participants} />
                </div>
              </div>
            )}

            {/* Table Core */}
            <div className="space-y-8 pt-8">
              <div className="bg-foreground text-background p-4 flex items-center justify-between border-b-4 border-foreground">
                <span className="font-black uppercase italic text-sm tracking-widest">
                  Critical_Data // Results_Log
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                </div>
              </div>

              <SearchFilters
                searchText={searchText}
                onSearchChange={setSearchText}
                filterCargo={filterCargo}
                onCargoChange={setFilterCargo}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                filterTurma={filterTurma}
                onTurmaChange={setFilterTurma}
                filterInstructor={filterInstructor}
                onInstructorChange={setFilterInstructor}
                instructors={instructors}
                cargos={cargos}
                turmas={turmas}
                filterSite={profile?.site || "all"}
                onSiteChange={() => { }}
                showSiteFilter={false}
              />

              <div className="border-4 border-foreground shadow-[15px_15px_0px_var(--foreground)] overflow-hidden">
                <ParticipantsTable participants={participants} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="border-4 border-foreground shadow-[15px_15px_0px_var(--foreground)] bg-background">
              <ClassManagement />
            </div>
          </TabsContent>

          {isGlobalAdmin && (
            <TabsContent value="approvals" className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="p-4 bg-background">
                <ApprovalManagement />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

const getDiscColor = (profile: string) => {
  switch (profile.toUpperCase()) {
    case "D": return "var(--secondary)";
    case "I": return "var(--primary)";
    case "S": return "var(--secondary)";
    case "C": return "var(--primary)";
    default: return "var(--muted)";
  }
};

export default Dashboard;
