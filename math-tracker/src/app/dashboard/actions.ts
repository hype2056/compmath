"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { uploadStudyPhoto } from "@/lib/supabase";
import { verifyStudySession } from "@/lib/verify";
import { CONTESTS, type ContestName } from "@/lib/contests";

const MAX_HOURS = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function createSession(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }

  const contest = formData.get("contest") as string;
  if (!CONTESTS.includes(contest as ContestName)) {
    throw new Error("Invalid contest.");
  }

  const hoursRaw = formData.get("hours") as string;
  let claimedHours: number | null = null;
  if (hoursRaw) {
    claimedHours = Math.round(parseFloat(hoursRaw) * 2) / 2; // snap to nearest 0.5
    if (claimedHours <= 0 || claimedHours > MAX_HOURS) {
      throw new Error(`Hours must be between 0.5 and ${MAX_HOURS}.`);
    }
  }

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    throw new Error("Upload at least one photo of your work.");
  }
  for (const f of files) {
    if (!ALLOWED_TYPES.includes(f.type)) {
      throw new Error("Photos must be JPEG, PNG, or WebP.");
    }
  }

  // Upload to Supabase Storage and build the base64 payload for Claude in parallel.
  const [photoUrls, base64Photos] = await Promise.all([
    Promise.all(files.map((f) => uploadStudyPhoto(session.user!.id!, f))),
    Promise.all(
      files.map(async (f) => ({
        base64: Buffer.from(await f.arrayBuffer()).toString("base64"),
        mediaType: f.type as "image/jpeg" | "image/png" | "image/webp",
      })),
    ),
  ]);

  const result = await verifyStudySession(base64Photos, contest as ContestName, claimedHours);

  await prisma.studySession.create({
    data: {
      userId: session.user.id,
      contest: contest as ContestName,
      claimedHours,
      photoUrls,
      score: result.score,
      feedback: result.feedback,
      confidence: result.confidence,
      hoursPlausible: result.hoursPlausible,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/insights");
  revalidatePath("/dashboard/leaderboard");
}
