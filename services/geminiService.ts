
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const rewriteTextProfessionally = async (text: string, tone: string = 'corporate') => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a professional document editor, rewrite the following text to be more ${tone}, ensuring perfect grammar, professional vocabulary, and clear hierarchy. Keep the length similar.
    
    Text: "${text}"`,
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
