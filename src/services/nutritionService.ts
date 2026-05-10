import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeminiMealResponse {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight: number;
  explanation: string;
}

export const analyzeMeal = async (description: string): Promise<GeminiMealResponse> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze the following meal description: "${description}". `,
    config: {
      systemInstruction: `You are an expert nutritionist. Analyze the food description and estimate weights and macronutrients. 
      Specific Logic:
      - Use the TACO table as a reference.
      - Estimate average portions (e.g., 1 tablespoon = 20g) if weights aren't specified.
      - Identify hidden fats and sugars in processed foods.
      - Respond strictly in JSON format matching the schema provided.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "A formal name for the meal" },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          weight: { type: Type.NUMBER, description: "Estimated total weight in grams" },
          explanation: { type: Type.STRING, description: "Brief explanation of the breakdown" }
        },
        required: ["name", "calories", "protein", "carbs", "fat", "weight", "explanation"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as GeminiMealResponse;
};
