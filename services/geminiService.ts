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

  // ----------------------------
  // Build Gemini parts (UNCHANGED)
  // ----------------------------
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

  // ----------------------------
  // API CALL
  // ----------------------------
  const res = await fetch(
    "https://eduevaluate-backend-production.up.railway.app/evaluate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parts }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const data = await res.json();
  console.log("RAW BACKEND RESPONSE:", data);

  // ----------------------------
  // 🔴 FIX 1: SAFE GEMINI EXTRACTION
  // ----------------------------
  const geminiParts =
    data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(geminiParts)) {
    console.error("Invalid Gemini response structure:", data);
    throw new Error("Evaluation failed: Invalid Gemini response.");
  }

  const textOutput = geminiParts
    .map((p: any) => p?.text ?? "")
    .join("")
    .trim();

  if (!textOutput) {
    throw new Error("Evaluation failed: Empty Gemini response.");
  }

  // ----------------------------
  // 🔴 FIX 2: SAFE JSON PARSE
  // ----------------------------
  let report: EvaluationReport;
  try {
    report = JSON.parse(textOutput);
  } catch (err) {
    console.error("Gemini returned non-JSON:", textOutput);
    throw new Error("Evaluation failed: Gemini did not return valid JSON.");
  }

  return report;
};
