import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { AxisItem, IntersectionData } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateIntersection = async (
  row: AxisItem,
  col: AxisItem
): Promise<IntersectionData> => {
  const ai = createClient();

  const prompt = `
    You are a master design theorist and art philosopher. 
    I have a matrix where:
    - The Vertical Axis represents the spectrum from Tradition to Innovation. Current position: "${row.label}" (${row.description}).
    - The Horizontal Axis represents the spectrum from Utility to Contemplation. Current position: "${col.label}" (${col.description}).
    
    Your task is to analyze the specific intersection of these two concepts.
    Provide a profound 1-2 sentence description explaining what happens when "${row.label}" meets "${col.label}".
    Also provide a visual metaphor (example) that represents this concept.
    
    IMPORTANT: The response (description, metaphor) MUST BE IN SPANISH.
    
    Respond in JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { 
            type: Type.STRING, 
            description: "A brief academic or artistic explanation of this intersection in Spanish." 
          },
          metaphor: { 
            type: Type.STRING, 
            description: "A visual object or scenario that represents this concept in Spanish." 
          }
        },
        required: ["description", "metaphor"],
      },
    },
  });

  if (response.text) {
      return JSON.parse(response.text) as IntersectionData;
  }
  
  throw new Error("No text returned from Gemini");
};