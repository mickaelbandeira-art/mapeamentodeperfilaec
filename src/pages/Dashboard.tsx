import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ParticipantsTable } from "@/components/dashboard/ParticipantsTable";
import { DiscChart } from "@/components/dashboard/DiscChart";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { Users, CheckCircle, Clock, TrendingUp, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
}

const Dashboard = () => {
  const { signOut, userRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterCargo, setFilterCargo] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [cargos, setCargos] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [searchText, filterCargo, filterStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from("dashboard_stats")
        .select("*")
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch participants with search and filters
      const { data: participantsData, error: participantsError } = await supabase
        .rpc("search_participants", {
          search_text: searchText || null,
          filter_cargo: filterCargo === "all" ? null : filterCargo,
          filter_status: filterStatus === "all" ? null : filterStatus,
        });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Get unique cargos for filter
      const uniqueCargos = [...new Set(participantsData?.map((p: any) => p.cargo) || [])];
      setCargos(uniqueCargos as string[]);

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
            cargos={cargos}
          />

          <ParticipantsTable participants={participants} />
        </div>
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
