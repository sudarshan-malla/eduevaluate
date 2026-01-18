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
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please ensure the API_KEY environment variable is configured in your project settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-3-pro-preview for complex reasoning and high-fidelity multimodal analysis
  const modelName = "gemini-3-pro-preview";

  const parts: any[] = [
    {
      text: `You are a high-level academic examiner powered by advanced multimodal AI. 
Your objective is to perform precise handwriting recognition (OCR) and grade student answer sheets with extreme accuracy.

EVALUATION PROTOCOL:
1. IDENTIFY: Extract metadata from the student's sheet (Name, ID, Subject, Class).
2. OCR: Convert handwritten text into digital text. Be highly sensitive to varying handwriting styles.
3. ANALYSIS: Compare the student's answer to the Question Paper and the Answer Key (if provided). If no Key exists, use current academic standards for the subject.
4. SCORING: Award marks based on correctness and clarity.
5. FEEDBACK: For every answer, explain why marks were awarded or deducted.

OUTPUT REQUIREMENTS:
- You must return a single, valid JSON object following the response schema exactly.
- If an answer is completely unreadable, transcribe it as "[Unreadable Handwriting]" and score it as 0.
- Provide a master summary for the "generalFeedback" field.`
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
    if (!result) throw new Error("Empty response from AI engine.");
    
    return JSON.parse(result);
  } catch (error: any) {
    console.error("Evaluation failure:", error);
    throw new Error(error.message || "An error occurred during AI evaluation. Please check your image clarity.");
  }
};