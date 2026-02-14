
import { GoogleGenAI } from "@google/genai";

export const getProjectBriefSuggestions = async (category: string) => {
  try {
    // ALWAYS use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I am a client looking to order a ${category}. Help me write a professional and detailed design brief. Give me 3 bullet points of questions I should answer to get the best result from my designer. Keep it concise.`,
    });
    // Use .text property directly, it is not a method.
    return response.text;
  } catch (error) {
    console.error("AI Briefing Error:", error);
    return null;
  }
};
