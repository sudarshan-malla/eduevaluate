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
  } catch (networkError) {
    console.error("Network error:", networkError);
    throw new Error("Network error while generating report");
  }

  const rawText = await res.text(); // ✅ READ BODY ONCE

  if (!res.ok) {
    console.error("Backend error:", rawText);
    throw new Error("Evaluation failed on server");
  }

  // ----------------------------
  // 🔴 PREVENT BLANK SCREEN
  // ----------------------------
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    console.error("Non-JSON response:", rawText);
    throw new Error("Invalid response from evaluator");
  }

  return parsed as EvaluationReport;
};
