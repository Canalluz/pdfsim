
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const rewriteTextProfessionally = async (text: string, tone: string = 'corporate') => {
  const prompt = tone === 'professional resume'
    ? `Como especialista em currículos profissionais, reescreva o seguinte texto para um currículo de alto impacto:
       - Use verbos de ação no início das frases (ex: Gerenciei, Implementei, Desenvolvi, Coordenei)
       - Inclua resultados quantificáveis quando possível
       - Mantenha linguagem concisa e profissional
       - Destaque conquistas e responsabilidades
       - Evite pronomes pessoais (eu, meu, minha)
       - Mantenha o mesmo idioma do texto original
       
       Texto original: "${text}"
       
       Retorne APENAS o texto reescrito, sem explicações adicionais.`
    : `As a professional document editor, rewrite the following text to be more ${tone}, ensuring perfect grammar, professional vocabulary, and clear hierarchy. Keep the length similar.
    
    Text: "${text}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      topP: 0.95,
    }
  });

  return response.text;
};

export const suggestLayoutImprovements = async (documentSummary: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this document structure and suggest professional layout improvements (typography, spacing, color palette, and visual hierarchy).
    
    Document Content Summary: "${documentSummary}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          colorPalette: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          fontPairing: {
            type: Type.STRING
          }
        },
        required: ["suggestions", "colorPalette", "fontPairing"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
