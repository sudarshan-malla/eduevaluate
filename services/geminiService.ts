import { EvaluationReport } from "../types";

/**
 * Parse base64 image
 */
const parseDataUrl = (dataUrl: string) => {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) return null;

  return {
    inlineData: {
      data: parts[1],
      mimeType: dataUrl.match(/:(.*?);/)?.[1] || "image/jpeg",
    },
  };
};

export const evaluateAnswerSheet = async (
  qpImages: string[],
  keyImages: string[],
  studentImages: string[]
): Promise<EvaluationReport> => {

  const parts: any[] = [
    {
      text: `You are an elite academic examiner.
Perform OCR, evaluate answers, assign marks, and return strict JSON.`,
    },
  ];

  const addFiles = (files: string[], label: string) => {
    files.forEach((file, i) => {
      const parsed = parseDataUrl(file);
      if (parsed) {
        parts.push({ text: `${label} Page ${i + 1}` });
        parts.push(parsed);
      }
    });
  };

  addFiles(qpImages, "Question Paper");
  addFiles(keyImages, "Answer Key");
  addFiles(studentImages, "Student Answer Sheet");

  const res = await fetch("/.netlify/functions/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parts,
      config: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Evaluation failed");
  }

  return JSON.parse(await res.text());
};
