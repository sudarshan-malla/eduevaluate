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

/**
 * Safely retrieves the API Key from the environment
 */
const getApiKey = (): string | undefined => {
  try {
    // Priority: process.env (Netlify/Local)
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

export const evaluateAnswerSheet = async (
  qpImages: string[],
  keyImages: string[],
  studentImages: string[]
): Promise<EvaluationReport> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  // Using gemini-3-pro-preview for advanced handwriting analysis and complex grading logic
  const modelName = "gemini-3-pro-preview";

  const parts: any[] = [
    {
      text: `You are a high-level academic examiner powered by advanced multimodal AI. 
Your objective is to perform precise handwriting recognition (OCR) and grade student answer sheets with extreme accuracy.

STRICT EVALUATION STEPS:
1. METADATA: Extract Student Name, Roll No, Subject, and Exam details.
2. OCR: Carefully transcribe every handwritten word. Use context clues to resolve ambiguous handwriting.
3. COMPARISON: Compare each answer against the provided Question Paper and Answer Key. If no key is provided, use standard academic knowledge for the level.
4. MARKING: Award marks based on accuracy, relevance, and completeness.
5. FEEDBACK: Provide specific, constructive feedback for every single question.

OUTPUT: Return a valid JSON object matching the requested schema.`
    }
  ];

  const addFilesToContext = (urls: string[], label: string) => {
    urls.forEach((url, i) => {
      const parsed = parseDataUrl(url);
      if (parsed) {
        parts.push({ text: `REFERENCE: ${label} (Document ${i + 1})` });
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
        // High thinking budget for maximum accuracy in grading complex handwritten answers
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

    const result = response.text;
    if (!result) throw new Error("AI engine failed to generate a response.");
    
    return JSON.parse(result);
  } catch (error: any) {
    console.error("Evaluation failure:", error);
    throw new Error(error.message || "An error occurred during AI evaluation.");
  }
};