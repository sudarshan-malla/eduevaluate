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
  
  const modelName = "gemini-2.5-flash";

  // Refined prompt based on user request to improve accuracy and reduce score hallucinations
  const parts: any[] = [
    {
      text: `You are a professional academic examiner.
Your task is to evaluate a student's answer sheet based on a provided question paper and (optional) answer key.

TASKS:
1. Identify the student's details (Name, Roll Number, etc.) from the first page of the answer sheet.
2. For every question found in the Question Paper:
   - Identify the maximum marks allocated to THAT question in the Question Paper.
   - Locate the corresponding answer in the Student's sheet.
   - Grade it against the Answer Key (if provided) or your own expert knowledge of the subject.
   - Provide constructive feedback for each answer.
3. Calculate the total score and percentage. 
   CRITICAL: The maxScore MUST be the sum of the marks of all questions present in the Question Paper provided. Do not hallucinate a different total marks if the Question Paper explicitly states the marks for each question.
4. Provide a general summary of the student's performance.

CRITICAL:
- Read handwritten text carefully.
- Return ONLY a valid JSON object following the schema provided. No conversational text.
- Accuracy is paramount: Ensure every question in the paper is accounted for in the 'grades' array.
- If a question is not answered, marksObtained should be 0, but the question must still be listed with its totalMarks from the Question Paper.`
    }
  ];

  const addFiles = (urls: string[], label: string) => {
    urls.forEach((url, i) => {
      const part = parseDataUrl(url);
      if (part) {
        parts.push({ text: `DATA: ${label} (Page ${i + 1})` });
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
      throw new Error("No response text received from the AI model.");
    }

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini Evaluation Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) throw new Error("API_KEY_INVALID");
    throw error;
  }
};