import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Headers para permitir que o teu site React aceda a esta função
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Lida com a verificação de segurança do navegador (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    
    // Recupera a chave do segredo do Supabase
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) {
      console.error("ERRO: GEMINI_API_KEY não foi encontrada nos Secrets do Supabase.");
      throw new Error("Configuração incompleta: Chave de API não encontrada no servidor.");
    }

    // URL para o Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    console.log(`Iniciando chamada ao Google Gemini API (Prompt de ${prompt.length} caracteres)...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const data = await response.json()
    console.log("Google API Response Status:", response.status);
    
    if (!response.ok) {
      console.error("Google API Error Data:", JSON.stringify(data));
      throw new Error(`Google API returned ${response.status}: ${data.error?.message || JSON.stringify(data)}`);
    }
    
    // Extrai apenas o texto da resposta da IA
    const aiResponse = data.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ text: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Internal Error in Edge Function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      details: "Check Supabase logs for full error trace"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
