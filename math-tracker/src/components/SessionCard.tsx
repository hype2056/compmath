import Image from "next/image";
import type { StudySession } from "@prisma/client";

const CONFIDENCE_LABEL: Record<string, string> = {
  low: "Low confidence — photos were hard to read",
  medium: "Medium confidence",
  high: "High confidence",
};

export function SessionCard({ session }: { session: StudySession }) {
  return (
    <div className="rounded-lg border border-ink/15 bg-paper p-5 flex gap-5">
      <div className="shrink-0 flex flex-col items-center justify-center w-20">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-stamp text-stamp font-mono text-xl font-bold rotate-[-6deg]">
          {session.score}
        </div>
        <span className="mt-1 text-[10px] uppercase tracking-wide text-ink/50">score</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-semibold text-ink">{session.contest}</h3>
          <time className="text-xs text-ink/50">
            {new Date(session.createdAt).toLocaleDateString()}
          </time>
        </div>

        {session.claimedHours != null && (
          <p className="text-sm text-ink/70 mt-0.5">
            Claimed {session.claimedHours}h
            {session.hoursPlausible != null && (
              <span className={session.hoursPlausible ? "text-green-700" : "text-amber-700"}>
                {" "}
                · {session.hoursPlausible ? "plausible" : "looks off vs. work shown"}
              </span>
            )}
          </p>
        )}

        <p className="text-sm text-ink/80 mt-2">{session.feedback}</p>
        <p className="text-xs text-ink/40 mt-2">{CONFIDENCE_LABEL[session.confidence]}</p>

        <div className="flex gap-2 mt-3 overflow-x-auto">
          {session.photoUrls.map((url, i) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="shrink-0">
              <Image
                src={url}
                alt={`Work photo ${i + 1}`}
                width={64}
                height={64}
                className="rounded object-cover w-16 h-16 border border-ink/10"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
