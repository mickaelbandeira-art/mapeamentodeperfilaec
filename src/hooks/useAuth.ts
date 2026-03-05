import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  // Derived: praça (site) do usuário logado
  const userSite = profile?.site ?? null;
  const isGlobalAdmin = userRole === 'admin' || profile?.role === 'admin';

  useEffect(() => {
    console.log("🔐 Inicializando autenticação...");

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Defer data fetching
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("📋 Sessão existente:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([
          fetchUserRole(session.user.id),
          fetchUserProfile(session.user.id)
        ]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log("👤 Buscando role do usuário:", userId);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      console.log("📊 Roles encontrados:", { data, error });

      if (error) throw error;

      // Se houver qualquer role 'admin', define como admin
      const roles = data?.map(r => r.role) || [];
      const primaryRole = roles.includes('admin') ? 'admin' : (roles[0] || 'visitor');

      setUserRole(primaryRole);
      console.log("✅ Role configurado:", primaryRole);
    } catch (error) {
      console.error("❌ Erro ao buscar role:", error);
      setUserRole(null);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("📄 Buscando perfil do usuário:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("❌ Erro ao buscar perfil:", error);
        return;
      }

      if (data) {
        console.log("✅ Perfil carregado:", data.full_name, "| Status:", data.status);
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log("📝 Iniciando processo de cadastro para:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Seu cadastro foi recebido e aguarda aprovação administrativa.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error("❌ Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao solicitar acesso.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // O login no Supabase Auth funciona, mas a validação de status
      // será feita no onSubmit da página de Login ou no ProtectedRoute

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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
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
