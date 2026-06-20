import type { Contest, StudySession } from "@prisma/client";

export type StreakStats = {
  current: number;
  longest: number;
};

export type TrendPoint = {
  date: string;
  avgScore: number | null;
  sessionCount: number;
};

export type ContestStats = {
  contest: Contest;
  sessionCount: number;
  avgScore: number;
  totalHours: number;
};

export type LeaderboardRow = {
  userId: string;
  name: string;
  sessionCount: number;
  avgScore: number;
  totalHours: number;
};

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export function computeStreak(sessions: Pick<StudySession, "createdAt">[]): StreakStats {
  if (sessions.length === 0) {
    return { current: 0, longest: 0 };
  }

  const daySet = new Set(sessions.map((s) => toDateKey(new Date(s.createdAt))));
  const sortedDays = [...daySet].sort();

  let longest = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const key of sortedDays) {
    const [y, m, d] = key.split("-").map(Number);
    const day = new Date(y, m - 1, d);

    if (prev) {
      const diff = (day.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }

    longest = Math.max(longest, run);
    prev = day;
  }

  let current = 0;
  let cursor = startOfDay(new Date());
  while (daySet.has(toDateKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

export function scoreTrend(
  sessions: Pick<StudySession, "createdAt" | "score">[],
  days = 30,
): TrendPoint[] {
  const start = daysAgo(days - 1);
  const byDay = new Map<string, { total: number; count: number }>();

  for (const s of sessions) {
    const created = new Date(s.createdAt);
    if (created < start) continue;
    const key = toDateKey(created);
    const entry = byDay.get(key) ?? { total: 0, count: 0 };
    entry.total += s.score;
    entry.count += 1;
    byDay.set(key, entry);
  }

  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = daysAgo(i);
    const key = toDateKey(day);
    const entry = byDay.get(key);
    points.push({
      date: key,
      avgScore: entry ? Math.round(entry.total / entry.count) : null,
      sessionCount: entry?.count ?? 0,
    });
  }

  return points;
}

export function contestBreakdown(
  sessions: Pick<StudySession, "contest" | "score" | "claimedHours">[],
): ContestStats[] {
  const map = new Map<Contest, { totalScore: number; count: number; hours: number }>();

  for (const s of sessions) {
    const entry = map.get(s.contest) ?? { totalScore: 0, count: 0, hours: 0 };
    entry.totalScore += s.score;
    entry.count += 1;
    entry.hours += s.claimedHours ?? 0;
    map.set(s.contest, entry);
  }

  return [...map.entries()]
    .map(([contest, { totalScore, count, hours }]) => ({
      contest,
      sessionCount: count,
      avgScore: Math.round(totalScore / count),
      totalHours: hours,
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);
}

export function weakestContest(breakdown: ContestStats[]): ContestStats | null {
  const eligible = breakdown.filter((b) => b.sessionCount >= 2);
  if (eligible.length === 0) return null;
  return eligible.reduce((min, b) => (b.avgScore < min.avgScore ? b : min));
}

export function leaderboardRows(
  sessionsByUser: Map<string, Pick<StudySession, "score" | "claimedHours" | "createdAt">[]>,
  users: { id: string; name: string | null }[],
  windowDays = 30,
): LeaderboardRow[] {
  const cutoff = daysAgo(windowDays - 1);

  return users
    .map((user) => {
      const sessions = (sessionsByUser.get(user.id) ?? []).filter(
        (s) => new Date(s.createdAt) >= cutoff,
      );
      const sessionCount = sessions.length;
      const avgScore =
        sessionCount > 0
          ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessionCount)
          : 0;
      const totalHours = sessions.reduce((sum, s) => sum + (s.claimedHours ?? 0), 0);

      return {
        userId: user.id,
        name: user.name ?? "Anonymous",
        sessionCount,
        avgScore,
        totalHours,
      };
    })
    .sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      if (b.sessionCount !== a.sessionCount) return b.sessionCount - a.sessionCount;
      return b.totalHours - a.totalHours;
    });
}
