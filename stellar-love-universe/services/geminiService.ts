
import { GoogleGenAI } from "@google/genai";

export const generateRomanticMessage = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Genera una frase corta y muy romántica (máximo 10 palabras) sobre el amor y las estrellas. Solo la frase.",
      config: {
        temperature: 0.8,
      },
    });
    return response.text?.trim() || "Eres mi universo entero.";
  } catch (error) {
    console.error("Error generating message:", error);
    return "Mi amor por ti es infinito.";
  }
};
