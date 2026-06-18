import { GoogleGenAI, Type } from "@google/genai";
import type { ContestName } from "./contests";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash"; // multimodal, on Google's free tier

export interface VerificationResult {
  score: number; // 0-100
  feedback: string;
  confidence: "low" | "medium" | "high";
  hoursPlausible: boolean | null; // null if no hours were claimed
}

interface PhotoInput {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    feedback: { type: Type.STRING },
    confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
    hoursPlausible: { type: Type.BOOLEAN },
  },
  required: ["score", "feedback", "confidence"],
};

/**
 * Sends the uploaded work photos to Gemini and asks it to act as a grader:
 * estimate genuine problem-solving effort, and (if the user claimed hours)
 * judge whether the amount of work shown is plausible for that claim.
 */
export async function verifyStudySession(
  photos: PhotoInput[],
  contest: ContestName,
  claimedHours: number | null,
): Promise<VerificationResult> {
  const hoursLine = claimedHours
    ? `The student claims they spent ${claimedHours} hour(s) on this. Also set "hoursPlausible" to whether the volume/depth of work shown is plausible for that claim.`
    : `The student did not claim a specific amount of time. Omit "hoursPlausible".`;

  const prompt = `You are grading evidence of independent competition math practice for the ${contest} contest. ${hoursLine}

Look at the attached photo(s) of handwritten work and judge, as best you can from scratch work, attempted problems, diagrams, and answers, how much genuine problem-solving effort is shown (not correctness of the final answer — effort and engagement). Give specific, honest, encouraging feedback. Use "confidence" to reflect how legible/conclusive the photos are.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      ...photos.map((p) => ({
        inlineData: { mimeType: p.mediaType, data: p.base64 },
      })),
      { text: prompt },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI verification returned no text content");
  }

  const parsed = JSON.parse(text);
  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    feedback: String(parsed.feedback),
    confidence: ["low", "medium", "high"].includes(parsed.confidence)
      ? parsed.confidence
      : "low",
    hoursPlausible: typeof parsed.hoursPlausible === "boolean" ? parsed.hoursPlausible : null,
  };
}