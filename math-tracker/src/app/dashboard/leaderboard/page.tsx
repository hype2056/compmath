import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SignOutButton } from "@/components/AuthButtons";
import { DashboardNav } from "@/components/DashboardNav";
import { FriendManager } from "@/components/FriendManager";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getFriendships, getFriendUserIds } from "@/lib/friends";
import { leaderboardRows } from "@/lib/stats";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [friendships, friendIds] = await Promise.all([
    getFriendships(userId),
    getFriendUserIds(userId),
  ]);

  const participantIds = [userId, ...friendIds];
  const users = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true, name: true },
  });

  const allSessions = await prisma.studySession.findMany({
    where: { userId: { in: participantIds } },
    select: { userId: true, score: true, claimedHours: true, createdAt: true },
  });

  const sessionsByUser = new Map<string, typeof allSessions>();
  for (const s of allSessions) {
    const list = sessionsByUser.get(s.userId) ?? [];
    list.push(s);
    sessionsByUser.set(s.userId, list);
  }

  const rows = leaderboardRows(sessionsByUser, users);

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-10">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink">Leaderboard</h1>
          <p className="text-sm text-ink/60">Compare with friends over the last 30 days</p>
        </div>
        <SignOutButton />
      </header>

      <DashboardNav />

      <div className="space-y-8">
        <FriendManager friendships={friendships} />

        <section>
          <h2 className="font-serif font-semibold text-ink mb-3">Rankings</h2>
          {friendIds.length === 0 ? (
            <p className="text-sm text-ink/50 mb-4">
              Invite friends above to populate the leaderboard. Until then, only your stats are
              shown.
            </p>
          ) : null}
          <LeaderboardTable rows={rows} currentUserId={userId} />
        </section>
      </div>
    </div>
  );
}
