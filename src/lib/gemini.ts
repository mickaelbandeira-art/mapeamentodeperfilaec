import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface ProfileData {
    disc: { D: number; I: number; S: number; C: number };
    mindset: string;
    vac: string;
    userName: string;
}

export const generateConsultativeInsights = async (data: ProfileData): Promise<string> => {
    try {
        if (!apiKey) {
            console.warn("⚠️ Google API Key não configurada. Usando fallback estático.");
            return "O Plano de Ação Personalizado não pôde ser gerado automaticamente devido à falta da chave de API. Por favor, consulte seu gestor para uma análise manual dos perfis DISC, Mindset e VAC.";
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ocorreu um erro ao gerar seus insights com IA. Por favor, tente novamente mais tarde.";
    }
};
