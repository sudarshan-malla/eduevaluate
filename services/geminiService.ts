
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationReport } from "../types";

// Initialize with the API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts the MIME type and base64 data from a Data URL
 */
const parseDataUrl = (dataUrl: string) => {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) throw new Error("Invalid Data URL format");
    
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
  // Use gemini-3-flash-preview for faster processing and high reliability in OCR/JSON tasks
  const model = "gemini-3-flash-preview";

  const parts: any[] = [
    {
      text: `You are a professional academic examiner.
Your task is to evaluate a student's answer sheet based on a provided question paper and (optional) answer key.

TASKS:
1. Identify the student's details (Name, Roll Number, etc.) from the first page of the answer sheet.
2. For every question found in the Question Paper:
   - Locate the corresponding answer in the Student's sheet.
   - Grade it against the Answer Key (if provided) or your own expert knowledge of the subject.
   - Provide constructive feedback for each answer.
3. Calculate the total score and percentage.
4. Provide a general summary of the student's performance.

CRITICAL:
- Read handwritten text carefully.
- Return ONLY a valid JSON object following the schema provided. No conversational text.`
    }
  ];

  // Helper to add files to the parts array with safety checks
  const addFilesToParts = (urls: string[], label: string) => {
    urls.forEach((url, idx) => {
      const parsed = parseDataUrl(url);
      if (parsed && parsed.data) {
        parts.push({ text: `${label} - Page ${idx + 1}:` });
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
    throw new Error("No valid document data found to send to AI.");
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

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI. The files might be too complex or contain unreadable content.");
    }

    return JSON.parse(text.trim()) as EvaluationReport;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("400") || error.message?.includes("INVALID_ARGUMENT")) {
      throw new Error("The AI could not process one of your images. Please ensure they are clear, not rotated, and in a standard format (JPG/PNG/PDF).");
    }
    throw error;
  }
};
