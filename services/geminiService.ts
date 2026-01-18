import { EvaluationReport } from "../types";

/**
 * Extract base64 image + MIME from Data URL
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
Perform OCR on handwritten answers, evaluate strictly,
award marks accurately, and return JSON only.`,
    },
  ];

  const addFiles = (images: string[], label: string) => {
    images.forEach((img, i) => {
      const parsed = parseDataUrl(img);
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parts }), // ✅ FIXED
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return JSON.parse(await res.text());
};
