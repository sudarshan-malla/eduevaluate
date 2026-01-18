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
    console.error("Error parsing data URL:", err);
    return null;
  }
};

export const evaluateAnswerSheet = async (
  qpImages: string[],
  keyImages: string[],
  studentImages: string[]
): Promise<EvaluationReport> => {
  // Creating a new instance per request ensures we always use the latest environment variables
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Using gemini-3-pro-preview for best results in complex grading and multimodal tasks
  const model = "gemini-3-pro-preview";

  const parts: any[] = [
    {
      text: `You are a professional academic examiner with expertise in analyzing student handwriting.
Your task is to evaluate a student's answer sheet against a question paper and an optional answer key.

STEPS:
1. Extract student metadata (Name, Roll, Class, Subject, Date) from the first sheet.
2. For every question in the Question Paper:
   - OCR the student's handwritten response.
   - Compare with the Answer Key (if provided) or standard subject knowledge.
   - Grade accurately and provide specific, helpful feedback for that question.
3. Sum the marks for a total score and calculate percentage.
4. Provide a master performance summary.

FORMATTING:
- Return ONLY valid JSON.
- Be precise with OCR; don't guess if unreadable, state 'unreadable' and score accordingly.`
    }
  ];

  const addFilesToParts = (urls: string[], label: string) => {
    urls.forEach((url, idx) => {
      const parsed = parseDataUrl(url);
      if (parsed && parsed.data) {
        parts.push({ text: `${label} - Part ${idx + 1}:` });
        parts.push({ 
          inlineData: { 
            mimeType: parsed.mimeType, 
            data: parsed.data 
          } 
        });
      }
    });
  };

  addFilesToParts(qpImages, "Question Paper");
  addFilesToParts(keyImages, "Answer Key");
  addFilesToParts(studentImages, "Student Answer Sheet");

  if (parts.length === 1) {
    throw new Error("Missing document data. Please upload files correctly.");
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
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
          required: ["studentInfo", "grades", "totalScore", "maxScore", "percentage"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Evaluation engine failed to produce a response.");

    return JSON.parse(resultText.trim()) as EvaluationReport;
  } catch (error: any) {
    console.error("AI Evaluation Error:", error);
    throw new Error(error.message || "An unexpected error occurred during evaluation.");
  }
};