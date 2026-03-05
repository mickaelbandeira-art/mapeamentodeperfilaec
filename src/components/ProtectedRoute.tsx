import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, userRole, profile, isGlobalAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile && profile.status && profile.status !== "approved" && !isGlobalAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 glass-card p-12 max-w-lg mx-auto">
          <Clock className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-foreground">
            {profile.status === "pending" ? "Acesso em Análise" : "Acesso Negado"}
          </h1>
          <p className="text-muted-foreground">
            {profile.status === "pending"
              ? "Sua solicitação está aguardando liberação do administrador. Você será notificado assim que seu acesso for aprovado."
              : "Sua solicitação de acesso não foi aprovada pelo administrador."}
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/login"} className="mt-4">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  const hasAccessByRole = isGlobalAdmin || (allowedRoles && userRole && allowedRoles.includes(userRole));

  if (allowedRoles && !hasAccessByRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-6xl font-black text-foreground uppercase italic tracking-tighter">Acesso Negado</h1>
          <p className="text-xl font-bold uppercase text-muted-foreground italic">Você não tem permissão para acessar esta página.</p>
          <div className="pt-8">
            <Button variant="outline" onClick={() => window.location.href = "/login"} className="border-4 border-foreground font-black uppercase italic">
              Voltar ao Login
            </Button>
          </div>
        </div>

        {/* Diagnostic Panel in ProtectedRoute */}
        <div className="max-w-xl w-full bg-destructive/10 border-4 border-destructive p-6 font-mono text-[10px] space-y-2 opacity-50 hover:opacity-100 transition-opacity">
          <h4 className="font-black uppercase text-destructive border-b-2 border-destructive mb-2">PROTECTED_ROUTE // DIAGNOSTICO</h4>
          <div className="grid grid-cols-1 gap-1">
            <div><span className="opacity-50 text-white">USER_ID:</span> {user?.id || 'N/A'}</div>
            <div><span className="opacity-50 text-white">EMAIL:</span> {user?.email || 'N/A'}</div>
            <div><span className="opacity-50 text-white">ROLE_DETECTED:</span> <span className="text-primary font-black uppercase italic">{userRole || 'NONE'}</span></div>
            <div className="pb-2"><span className="opacity-50 text-white">EXPECTED_ANY:</span> {allowedRoles.join(' | ')}</div>

            <div className="pt-2 border-t border-destructive/20"><span className="opacity-50 text-white">DB_STATUS:</span> {profile?.status || 'N/A'}</div>
            <div><span className="opacity-50 text-white">DB_ROLE:</span> {profile?.role || 'N/A'}</div>
          </div>
          <p className="text-[8px] pt-4 opacity-40 uppercase">Dica: Se o ROLE_DETECTED for 'NONE' ou 'VISITOR', o banco não encontrou sua permissão de Admin.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
