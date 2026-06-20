import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SignOutButton } from "@/components/AuthButtons";
import { DashboardNav } from "@/components/DashboardNav";
import { InsightsPanel } from "@/components/InsightsPanel";
import {
  computeStreak,
  contestBreakdown,
  scoreTrend,
  weakestContest,
} from "@/lib/stats";

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sessions = await prisma.studySession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const streak = computeStreak(sessions);
  const trend = scoreTrend(sessions);
  const breakdown = contestBreakdown(sessions);
  const focusContest = weakestContest(breakdown);

  const totalSessions = sessions.length;
  const totalHours = sessions.reduce((sum, s) => sum + (s.claimedHours ?? 0), 0);
  const overallAvgScore =
    totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions)
      : 0;

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-10">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink">Insights</h1>
          <p className="text-sm text-ink/60">Your practice trends over time</p>
        </div>
        <SignOutButton />
      </header>

      <DashboardNav />

      {totalSessions === 0 ? (
        <p className="text-ink/50 text-sm">
          Log your first session on the Log tab to see streaks and trends here.
        </p>
      ) : (
        <InsightsPanel
          streak={streak}
          totalSessions={totalSessions}
          totalHours={totalHours}
          overallAvgScore={overallAvgScore}
          trend={trend}
          breakdown={breakdown}
          focusContest={focusContest}
        />
      )}
    </div>
  );
}
