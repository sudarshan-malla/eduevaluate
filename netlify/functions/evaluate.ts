import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event: any) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const body = JSON.parse(event.body);

    if (!body.parts || !Array.isArray(body.parts)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid request payload: parts[] missing",
          received: body,
        }),
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: body.parts,
        },
      ],
    });

    const text = result.response.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text,
    };
  } catch (error: any) {
    console.error("Netlify Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Internal server error",
      }),
    };
  }
};
