-- ==========================================================
-- 360º PROFILE MAPPING: DISC, MINDSET, VAC & AI INSIGHTS
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.perfis_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pontuacao_disc jsonb NOT NULL,
  mindset_tipo text NOT NULL CHECK (mindset_tipo IN ('Crescimento', 'Fixo')),
  vac_dominante text NOT NULL CHECK (vac_dominante IN ('Visual', 'Auditivo', 'Cinestésico')),
  insights_consultivos text,
  data_analise timestamptz DEFAULT now()
);

-- Habilitar RLS (Segurança de Nível de Linha)
ALTER TABLE public.perfis_usuario ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias análises
DROP POLICY IF EXISTS "Users can view own profiling" ON public.perfis_usuario;
CREATE POLICY "Users can view own profiling" ON public.perfis_usuario
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Admins podem ver todas as análises
DROP POLICY IF EXISTS "Admins can view all profiling" ON public.perfis_usuario;
CREATE POLICY "Admins can view all profiling" ON public.perfis_usuario
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.perfis_usuario IS 'Armazena o mapeamento completo 360º incluindo DISC, Mindset, VAC e insights de IA.';
