import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  const userSite = profile?.site ?? null;
  const isGlobalAdmin = userRole === 'admin' || profile?.role === 'admin';

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('aec_auth_token');
      if (token) {
        try {
          const data = await api.get('/auth/me');
          setUser(data.user);
          setProfile(data.profile);
          setUserRole(data.roles[0] || 'visitor');
        } catch (err) {
          console.error("Auth check failed:", err);
          api.clearToken();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      await api.post('/auth/register', { email, password, ...metadata });
      toast({
        title: "Solicitação enviada!",
        description: "Seu cadastro foi recebido e aguarda aprovação administrativa.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao solicitar acesso.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string, site?: string) => {
    try {
      const data = await api.post('/auth/login', { email, password, site });
      api.setToken(data.token);
      setUser(data.user);

      
      // Fetch full profile and roles after login
      const me = await api.get('/auth/me');
      setProfile(me.profile);
      setUserRole(me.roles[0] || 'visitor');

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro ao fazer login.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    api.clearToken();
    setUser(null);
    setProfile(null);
    setUserRole(null);
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  return {
    user,
    loading,
    userRole,
    profile,
    userSite,
    isGlobalAdmin,
    signIn,
    signUp,
    signOut,
  };
};

