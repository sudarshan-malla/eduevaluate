// import { EvaluationReport } from "../types";

// /**
//  * Extract base64 image + MIME from Data URL
//  */
// const parseDataUrl = (dataUrl: string) => {
//   const parts = dataUrl.split(",");
//   if (parts.length !== 2) return null;

//   return {
//     inlineData: {
//       data: parts[1],
//       mimeType: dataUrl.match(/:(.*?);/)?.[1] || "image/jpeg",
//     },
//   };
// };

// export const evaluateAnswerSheet = async (
//   qpImages: string[],
//   keyImages: string[],
//   studentImages: string[]
// ): Promise<EvaluationReport> => {

//   const parts: any[] = [
//     {
//       text: `You are an elite academic examiner.
// Perform OCR on handwritten answers, evaluate strictly,
// award marks accurately, and return JSON only.`,
//     },
//   ];

//   const addFiles = (images: string[], label: string) => {
//     images.forEach((img, i) => {
//       const parsed = parseDataUrl(img);
//       if (parsed) {
//         parts.push({ text: `${label} Page ${i + 1}` });
//         parts.push(parsed);
//       }
//     });
//   };

//   addFiles(qpImages, "Question Paper");
//   addFiles(keyImages, "Answer Key");
//   addFiles(studentImages, "Student Answer Sheet");

//   const res = await fetch("https://eduevaluate-backend-production.up.railway.app/evaluate", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ parts }), // ✅ FIXED
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(err);
//   }

//   return JSON.parse(await res.text());
// };

import { EvaluationReport } from "../types";

/**
 * Resize & compress image to avoid large payload crashes
 */
const resizeImage = (
  dataUrl: string,
  maxWidth = 1200,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality)); // JPEG + compression
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

/**
 * Extract base64 image + MIME from Data URL
 */
const parseDataUrl = (dataUrl: string) => {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) return null;

  return {
    inlineData: {
      data: parts[1],
      mimeType: "image/jpeg",
    },
  };
};

export const evaluateAnswerSheet = async (
  qpImages: string[],
  keyImages: string[],
  studentImages: string[]
): Promise<EvaluationReport> => {

  // ----------------------------
  // Build Gemini parts
  // ----------------------------
  const parts: any[] = [
    {
      text: `You are an elite academic examiner.
Perform OCR on handwritten answers, evaluate strictly,
award marks accurately, and return JSON only.`,
    },
  ];

  const addFiles = async (images: string[], label: string) => {
    for (let i = 0; i < images.length; i++) {
      const resized = await resizeImage(images[i]);
      const parsed = parseDataUrl(resized);

      if (parsed) {
        parts.push({ text: `${label} Page ${i + 1}` });
        parts.push(parsed);
      }
    }
  };

  // 🔴 CRITICAL: await these to avoid race conditions
  await addFiles(qpImages, "Question Paper");
  await addFiles(keyImages, "Answer Key");
  await addFiles(studentImages, "Student Answer Sheet");

  // ----------------------------
  // Network request (SAFE)
  // ----------------------------
  let res: Response;
  try {
    res = await fetch(
      "https://eduevaluate-backend-production.up.railway.app/evaluate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parts }),
      }
    );
  } catch (err) {
    console.error("Network failure:", err);
    throw new Error("Network error while generating report");
  }

  // ----------------------------
  // Read response ONCE
  // ----------------------------
  const rawText = await res.text();

  if (!res.ok) {
    console.error("Backend error:", rawText);
    throw new Error("Evaluation failed on server");
  }

  // ----------------------------
  // SAFE JSON parse
  // ----------------------------
  let parsedResponse: any;
  try {
    parsedResponse = JSON.parse(rawText);
  } catch {
    console.error("Non-JSON response:", rawText);
    throw new Error("Evaluator returned invalid format");
  }

  // ----------------------------
  // SAFE Gemini extraction
  // ----------------------------
  const geminiParts =
    parsedResponse?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(geminiParts)) {
    console.error("Unexpected Gemini structure:", parsedResponse);
    throw new Error("Invalid Gemini response structure");
  }

  const textOutput = geminiParts
    .map((p: any) => p?.text ?? "")
    .join("")
    .trim();

  if (!textOutput) {
    throw new Error("Empty evaluation response");
  }

  // ----------------------------
  // FINAL JSON parse (report)
  // ----------------------------
  let report: EvaluationReport;
  try {
    report = JSON.parse(textOutput);
  } catch {
    console.error("Gemini output not valid JSON:", textOutput);
    throw new Error("Evaluation result is not valid JSON");
  }

  return report;
};
