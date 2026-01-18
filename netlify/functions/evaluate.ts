import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: "Missing body" };
    }

    const { parts, config } = JSON.parse(event.body);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!, // 🔒 SAFE
    });

    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: { parts },
      config,
    });

    if (!response.text) {
      throw new Error("Empty Gemini response");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text.trim(),
    };
  } catch (err: any) {
    console.error("Server Gemini Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
