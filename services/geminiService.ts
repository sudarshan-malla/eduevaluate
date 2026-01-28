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
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = "gemini-2.5-flash";

  const parts: any[] = [
    {
      text: `You are a professional academic examiner.
Your task is to evaluate a student's answer sheet based on a provided question paper and (optional) answer key.

TASKS:
1. Identify the student's details (Name, Roll Number, etc.) from the first page of the answer sheet.
2. CRITICAL - TOTAL MARKS CALCULATION:
   - Carefully scan the entire Question Paper.
   - List every question and identify its maximum marks.
   - SUM ALL INDIVIDUAL MARKS to get the final "maxScore". 
   - DO NOT assume or hallucinate a generic total (like 70 or 100). If the paper sums to 80, the maxScore MUST be 80.
3. EVALUATION PHILOSOPHY:
   - Evaluate with effectiveness and fairness.
   - Be "less strict" (lenient) where the student demonstrates a clear understanding but might have minor grammatical or technical errors.
   - Award partial marks for partially correct answers based on the depth of the answer.
4. For every question found in the Question Paper:
   - EXHAUSTIVELY search through ALL provided student answer pages for the corresponding answer. Do not miss any questions (like Question 6, sub-parts, etc.). Ensure you check every page of the student's work.
   - Grade it against the Answer Key (if provided) or your own expert knowledge.
   - Provide encouraging and constructive feedback for each answer.
5. Calculate the totalScore (sum of obtained marks) and the percentage.

CRITICAL:
- Read handwritten text carefully.
- Return ONLY a valid JSON object following the schema provided. No conversational text.
- If a question is missing/unanswered in the student's work, marksObtained is 0, but totalMarks must match the paper's allocation.
- Ensure 'grades' array contains EVERY question from the paper.`
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