import Anthropic from "@anthropic-ai/sdk";
import type { ContestName } from "./contests";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

/**
 * Sends the uploaded work photos to Claude and asks it to act as a grader:
 * estimate genuine problem-solving effort, and (if the user claimed hours)
 * judge whether the amount of work shown is plausible for that claim.
 */
export async function verifyStudySession(
  photos: PhotoInput[],
  contest: ContestName,
  claimedHours: number | null,
): Promise<VerificationResult> {
  const hoursLine = claimedHours
    ? `The student claims they spent ${claimedHours} hour(s) on this.`
    : `The student did not claim a specific amount of time.`;

  const prompt = `You are grading evidence of independent competition math practice for the ${contest} contest. ${hoursLine}

Look at the attached photo(s) of handwritten work and judge, as best you can from scratch work, attempted problems, diagrams, and answers:
- How much genuine problem-solving effort is shown (not correctness of the final answer, effort and engagement).
- Whether the volume/depth of work is roughly plausible for the claimed hours, if any were claimed.

Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{"score": <integer 0-100>, "feedback": "<2-3 sentences of specific, encouraging but honest feedback>", "confidence": "low"|"medium"|"high", "hoursPlausible": true|false|null}

Use "hoursPlausible": null if no hours were claimed. Use "confidence" to reflect how legible/conclusive the photos are.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          ...photos.map((p) => ({
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: p.mediaType,
              data: p.base64,
            },
          })),
          { type: "text" as const, text: prompt },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI verification returned no text content");
  }

  try {
    const parsed = JSON.parse(textBlock.text);
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      feedback: String(parsed.feedback),
      confidence: ["low", "medium", "high"].includes(parsed.confidence)
        ? parsed.confidence
        : "low",
      hoursPlausible:
        typeof parsed.hoursPlausible === "boolean" ? parsed.hoursPlausible : null,
    };
  } catch {
    throw new Error("AI verification returned unparseable output");
  }
}
