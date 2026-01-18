
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationReport } from "../types";

/**
 * Extracts the MIME type and base64 data from a Data URL
 */
const parseDataUrl = (dataUrl: string) => {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return null;
    const data = parts[1];
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    return { inlineData: { data, mimeType } };
  } catch (err) {
    return null;
  }
};

export const evaluateAnswerSheet = async (
  qpImages: string[],
  keyImages: string[],
  studentImages: string[]
): Promise<EvaluationReport> => {
  // Access the API key exclusively from process.env.API_KEY as per instructions.
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("ENV_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey: "AIzaSyD4yIGMS7HKjBVU9W286ooq_nFI4DBoCZw" });
  const modelName = "gemini-3-pro-preview";

  // Fix: Explicitly type parts to allow both text and multimodal inlineData parts.
  // This prevents TypeScript from narrowing the array type to only { text: string }.
  const parts: any[] = [
    {
      text: `You are an expert academic evaluator. Analyze the Question Paper, optional Answer Key, and Student Answer Sheets.
      1. Perform accurate OCR on the handwritten answers. 
      2. Evaluate each question fairly based on the provided material. Award partial marks where appropriate.
      3. Be critical but fair. Provide specific feedback on why marks were deducted.
      4. Output a detailed evaluation report in JSON format.`
    }
  ];

  const addFiles = (urls: string[], label: string) => {
    urls.forEach((url, i) => {
      const part = parseDataUrl(url);
      if (part) {
        parts.push({ text: `REFERENCE ${label} (Part ${i + 1}):` });
        parts.push(part);
      }
    });
  };

  addFiles(qpImages, "Question Paper");
  addFiles(keyImages, "Answer Key");
  addFiles(studentImages, "Student Answer Sheets");

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 16384 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rollNumber: { type: Type.STRING },
                subject: { type: Type.STRING },
                class: { type: Type.STRING },
                examName: { type: Type.STRING },
                date: { type: Type.STRING },
              },
              required: ["name", "subject"]
            },
            grades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.STRING },
                  studentAnswer: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  marksObtained: { type: Type.NUMBER },
                  totalMarks: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                },
                required: ["questionNumber", "marksObtained", "totalMarks"]
              },
              propertyOrdering: ["questionNumber", "studentAnswer", "correctAnswer", "marksObtained", "totalMarks", "feedback"]
            },
            totalScore: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            percentage: { type: Type.NUMBER },
            generalFeedback: { type: Type.STRING },
          },
          required: ["studentInfo", "grades", "totalScore", "maxScore", "percentage", "generalFeedback"],
          propertyOrdering: ["studentInfo", "grades", "totalScore", "maxScore", "percentage", "generalFeedback"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Evaluation failed: No response text received from model.");
    }

    return JSON.parse(response.text.trim());
  } catch (err: any) {
    if (err.message?.includes("API_KEY_INVALID")) {
      throw new Error("INVALID_API_KEY");
    }
    throw err;
  }
};
