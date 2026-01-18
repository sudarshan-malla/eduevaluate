import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationReport } from "../types";

/**
 * Extracts the MIME type and base64 data from a Data URL
 */
const parseDataUrl = (dataUrl: string) => {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return null;
    
    const header = parts[0];
    const data = parts[1];
    const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    
    return { mimeType, data };
  } catch (err) {
    return null;
  }
};

export const evaluateAnswerSheet = async (
  qpImages: string[],
  keyImages: string[],
  studentImages: string[]
): Promise<EvaluationReport> => {
  // Directly using process.env.API_KEY as mandated by security and SDK guidelines.
  // This ensures the key is never leaked in the source code.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = "gemini-3-pro-preview";

  const parts: any[] = [
    {
      text: `You are a high-level academic examiner. 
      Analyze the provided question paper and student answer sheet. 
      Perform high-precision handwriting OCR and evaluate the answers for accuracy.
      Return a detailed JSON report following the requested schema.`
    }
  ];

  const addFilesToContext = (urls: string[], label: string) => {
    urls.forEach((url, i) => {
      const parsed = parseDataUrl(url);
      if (parsed) {
        parts.push({ text: `REFERENCE: ${label} (Part ${i + 1})` });
        parts.push({ inlineData: { data: parsed.data, mimeType: parsed.mimeType } });
      }
    });
  };

  addFilesToContext(qpImages, "Question Paper");
  addFilesToContext(keyImages, "Answer Key");
  addFilesToContext(studentImages, "Student Answer Sheet");

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
              }
            },
            totalScore: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            percentage: { type: Type.NUMBER },
            generalFeedback: { type: Type.STRING },
          },
          required: ["studentInfo", "grades", "totalScore", "maxScore", "percentage", "generalFeedback"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Evaluation failed: No text content returned from AI.");
    }

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("SDK Evaluation Error:", error);
    throw error;
  }
};