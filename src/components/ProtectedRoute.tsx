import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, userRole } = useAuth();

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

  if (profile && profile.status && profile.status !== "approved") {
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

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
