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
    throw new Error("API_KEY_MISSING");
  }

  // Create a new instance right before use to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey });
  const modelName = "models/gemini-2.5-flash";

  // Use any[] to allow mixed types in the parts array
  const parts: any[] = [
    {
      text: `You are an elite academic examiner with expertise in handwriting analysis and pedagogical assessment.
      
      INPUT DATA:
      - Question Paper: The source questions.
      - Answer Key (Optional): The expected correct answers for reference.
      - Student Answer Sheets: Handwritten responses to be evaluated.
      
      TASKS:
      1. Perform high-precision OCR on handwritten text.
      2. Compare student answers against the question paper requirements and answer key.
      3. Award marks based on accuracy, logic, and completeness.
      4. Provide constructive feedback for each answer.
      5. Generate a comprehensive summary.
      
      Return the evaluation in structured JSON.`
    }
  ];

  const addFiles = (urls: string[], label: string) => {
    urls.forEach((url, i) => {
      const part = parseDataUrl(url);
      if (part) {
        parts.push({ text: `REFERENCE: ${label} (Part ${i + 1})` });
        parts.push(part);
      }
    });
  };

  addFiles(qpImages, "Question Paper");
  addFiles(keyImages, "Answer Key");
  addFiles(studentImages, "Student Answer Sheet");

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
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
      throw new Error("The model did not return a valid evaluation transcript.");
    }

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("SDK Evaluation Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) throw new Error("API_KEY_INVALID");
    throw error;
  }
};
