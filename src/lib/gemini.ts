import { api } from "@/lib/api";

export interface ProfileData {
    disc: { D: number; I: number; S: number; C: number };
    mindset: string;
    vac: string;
    userName: string;
}

export const generateConsultativeInsights = async (data: ProfileData): Promise<string> => {
    try {
        const prompt = `
      Você é um mentor sênior e consultor de desenvolvimento humano da empresa AeC.
      Sua missão é gerar um relatório de Mapeamento de Perfil 360º altamente personalizado e consultivo para o usuário ${data.userName}.

      DADOS DO PERFIL:
      - Perfil DISC: Dominância: ${data.disc.D}%, Influência: ${data.disc.I}%, Estabilidade: ${data.disc.S}%, Conformidade: ${data.disc.C}%
      - Mindset: ${data.mindset}
      - Canal de Aprendizagem/Comunicação (VAC): ${data.vac}

      DIRETRIZES DO RELATÓRIO:
      1. ATITUDE CONSULTIVA: Não apenas liste dados. Atue como um mentor.
      2. CRUZAMENTO DE DADOS: Interprete como o Perfil DISC interage com o Mindset e o VAC. 
         Exemplo: Se for 'Estável' e 'Visual', sugira fluxogramas para diminuir a ansiedade em mudanças.
      3. PLANO DE AÇÃO: Forneça 3 passos práticos e imediatos para o desenvolvimento deste colaborador.
      4. TOM DE VOZ: Profissional, encorajador, empático e direto. Use a terminologia da AeC onde apropriado.

      FORMATO DE SAÍDA:
      Retorne o relatório formatado em Markdown, com títulos claros e bullet points. 
      Inicie com uma saudação personalizada destacando a potência única deste cruzamento de perfis.
    `;

        console.log("Chamando API local para geração de insights...");
        const response = await api.post('/ai/generate', { prompt });

        return response.text || "Relatório gerado com sucesso.";
    } catch (error: any) {
        console.error("Error calling AI via local backend:", error);
        return `Ocorreu um erro ao gerar seus insights com IA. (${error.message || "Erro desconhecido"})`;
    }
};
