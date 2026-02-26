import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ParticipantsTable } from "@/components/dashboard/ParticipantsTable";
import { DiscChart } from "@/components/dashboard/DiscChart";
import { AverageScoresChart } from "@/components/dashboard/AverageScoresChart";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassManagement } from "@/components/dashboard/ClassManagement";
import { Users, CheckCircle, Clock, TrendingUp, LogOut, GraduationCap, ClipboardList } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";
import { SITES } from "@/components/RegistrationScreen";

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
  const { signOut, userRole, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterCargo, setFilterCargo] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTurma, setFilterTurma] = useState("all");
  const [filterInstructor, setFilterInstructor] = useState("all");
  const [filterSite, setFilterSite] = useState("all");
  const [cargos, setCargos] = useState<string[]>([]);
  const [turmas, setTurmas] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<{ name: string; email: string }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [searchText, filterCargo, filterStatus, filterTurma, filterInstructor, filterSite]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      // Fetch stats for the specific site (Resilient)
      let statsData, statsError;
      try {
        let statsQuery = supabase.from("dashboard_stats").select("*");
        if (profile?.site) {
          statsQuery = statsQuery.eq("site", profile.site);
        }
        const response = await statsQuery.maybeSingle();
        statsData = response.data;
        statsError = response.error;

        if (statsError && statsError.message?.includes("column")) {
          console.warn("⚠️ Coluna 'site' ausente em dashboard_stats. Usando stats globais.");
          const fallback = await supabase.from("dashboard_stats").select("*").maybeSingle();
          statsData = fallback.data;
          statsError = fallback.error;
        }
      } catch (e) {
        console.error("Erro ao carregar estatísticas:", e);
      }

      if (statsError) {
        console.warn("Could not fetch dashboard stats", statsError);
        setStats(null);
      } else {
        setStats(statsData);
      }

      // Fetch participants with search and filters (Resilient Call)
      let participantsData, participantsError;

      try {
        console.log("🔍 Tentando busca filtrada por site...");
        const response = await supabase.rpc("search_participants", {
          search_text: searchText || null,
          filter_status: filterStatus === "all" ? null : filterStatus,
          filter_cargo: filterCargo === "all" ? null : filterCargo,
          filter_coordinator: null,
          filter_turma: filterTurma === "all" ? null : filterTurma,
          filter_instructor_email: filterInstructor === "all" ? null : filterInstructor,
          filter_site: profile?.site || null,
        });
        participantsData = response.data;
        participantsError = response.error;

        // Se o erro for de parâmetro/assinatura de função, tentamos o fallback
        if (participantsError && (participantsError.message?.includes("function") || participantsError.message?.includes("parameter"))) {
          throw new Error("RPC_OLD_SIGNATURE");
        }
      } catch (e: any) {
        if (e.message === "RPC_OLD_SIGNATURE") {
          console.warn("⚠️ Função search_participants no banco está desatualizada. Usando busca básica.");
          const response = await supabase.rpc("search_participants", {
            search_text: searchText || null,
            filter_status: filterStatus === "all" ? null : filterStatus,
            filter_cargo: filterCargo === "all" ? null : filterCargo,
            filter_turma: filterTurma === "all" ? null : filterTurma,
            filter_instructor_email: filterInstructor === "all" ? null : filterInstructor
          });
          participantsData = response.data;
          participantsError = response.error;
        } else {
          throw e;
        }
      }

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

      // Get unique values for filters
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Painel de controle - Teste DISC
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-auto gap-2">
            <TabsTrigger
              value="participants"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Participantes
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Gestão de Turmas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Cards */}
            {stats && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total de Participantes"
                  value={stats.total_participants || 0}
                  icon={Users}
                />
                <StatsCard
                  title="Testes Concluídos"
                  value={stats.total_completed_tests || 0}
                  icon={CheckCircle}
                />
                <StatsCard
                  title="Testes Pendentes"
                  value={stats.pending_tests || 0}
                  icon={Clock}
                />
                <StatsCard
                  title="Taxa de Conclusão"
                  value={`${(stats.completion_rate || 0).toFixed(1)}%`}
                  icon={TrendingUp}
                />
              </div>
            )}

            {/* Chart */}
            {discData.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                <DiscChart data={discData} />
                <AverageScoresChart participants={participants} />
              </div>
            )}

            {/* Filters and Table */}
            <div className="space-y-4">
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
                onSiteChange={() => { }} // Desativa mudança de site no dashboard
                showSiteFilter={false} // Esconde filtro de praça para todos
              />

              <ParticipantsTable participants={participants} />
            </div>
          </TabsContent>

          <TabsContent value="classes" className="animate-in fade-in duration-500">
            <ClassManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const getDiscColor = (profile: string) => {
  switch (profile.toUpperCase()) {
    case "D":
      return "hsl(var(--disc-dominance))";
    case "I":
      return "hsl(var(--disc-influence))";
    case "S":
      return "hsl(var(--disc-stability))";
    case "C":
      return "hsl(var(--disc-conformity))";
    default:
      return "hsl(var(--muted))";
  }
};

export default Dashboard;
