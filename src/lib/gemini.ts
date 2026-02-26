import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

export interface ProfileData {
    disc: { D: number; I: number; S: number; C: number };
    mindset: string;
    vac: string;
    userName: string;
}

export const generateConsultativeInsights = async (data: ProfileData): Promise<string> => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            console.warn("⚠️ Google AI API Key não configurada. Usando fallback estático.");
            return "O Plano de Ação Personalizado não pôde ser gerado automaticamente devido à falta da chave de API. Por favor, consulte seu gestor para uma análise manual dos perfis DISC, Mindset e VAC.";
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            apiVersion: "v1"
        });

        const prompt = `Você é um Mentor de Carreira. Analise os dados cruzados: DISC (Dominância: ${data.disc.D}%, Influência: ${data.disc.I}%, Estabilidade: ${data.disc.S}%, Conformidade: ${data.disc.C}%), Mindset (${data.mindset}) e VAC (${data.vac}). Gere um relatório interpretativo em Markdown focando em como esse perfil pode evoluir e se comunicar melhor para o usuário ${data.userName}.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (!response.text()) {
            throw new Error("A IA não gerou uma resposta válida.");
        }

        return response.text();
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);

        // Tratar falhas de rede ou cota
        if (error.message?.includes("quota") || error.status === 429) {
            return "Erro: Limite de cota atingido. Por favor, tente novamente em alguns minutos.";
        }
        if (error.message?.includes("network") || !window.navigator.onLine) {
            return "Erro de Conexão: Verifique sua internet e tente novamente.";
        }

        // Handle specific authentication and routing errors
        if (error.status === 401 || error.message?.includes("401")) {
            return "Erro de Autenticação: Sua API Key da Gemini pode estar mal configurada ou inválida. Por favor, verifique o arquivo .env e o Google AI Studio.";
        }
        if (error.status === 404 || error.message?.includes("404")) {
            return "Erro 404: Endpoint ou modelo não encontrado. Verifique se o modelo 'gemini-2.5-flash' está disponível e se o endpoint v1 está correto.";
        }

        const errorMessage = error.message || "";
        if (errorMessage.includes("API_KEY_INVALID")) {
            return "Erro: Chave de API inválida. Por favor, verifique se a chave no arquivo .env está correta e ativa.";
        }
        return `Ocorreu um erro ao gerar seus insights: ${errorMessage || "Erro desconhecido"}. Verifique o console do navegador para mais detalhes.`;
    }
};
