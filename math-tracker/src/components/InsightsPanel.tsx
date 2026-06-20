import type { ContestStats, StreakStats, TrendPoint } from "@/lib/stats";

type Props = {
  streak: StreakStats;
  totalSessions: number;
  totalHours: number;
  overallAvgScore: number;
  trend: TrendPoint[];
  breakdown: ContestStats[];
  focusContest: ContestStats | null;
};

export function InsightsPanel({
  streak,
  totalSessions,
  totalHours,
  overallAvgScore,
  trend,
  breakdown,
  focusContest,
}: Props) {
  const maxScore = Math.max(...trend.map((t) => t.avgScore ?? 0), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Current streak" value={`${streak.current}d`} />
        <StatCard label="Longest streak" value={`${streak.longest}d`} />
        <StatCard label="Total sessions" value={String(totalSessions)} />
        <StatCard
          label="Avg score"
          value={totalSessions > 0 ? String(overallAvgScore) : "—"}
          mono
        />
      </div>

      {totalHours > 0 && (
        <p className="text-sm text-ink/60">
          {totalHours}h claimed across all sessions
        </p>
      )}

      <section>
        <h2 className="font-serif font-semibold text-ink mb-3">Score trend (30 days)</h2>
        {trend.every((t) => t.sessionCount === 0) ? (
          <p className="text-sm text-ink/50">No sessions in the last 30 days.</p>
        ) : (
          <div className="rounded-lg border border-ink/15 bg-paper p-4">
            <div className="flex items-end gap-0.5 h-32">
              {trend.map((point) => {
                const height =
                  point.avgScore != null ? Math.max(4, (point.avgScore / maxScore) * 100) : 4;
                return (
                  <div
                    key={point.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group"
                    title={
                      point.avgScore != null
                        ? `${point.date}: avg ${point.avgScore} (${point.sessionCount} session${point.sessionCount === 1 ? "" : "s"})`
                        : `${point.date}: no sessions`
                    }
                  >
                    <div
                      className={`w-full rounded-t ${point.avgScore != null ? "bg-stamp/70" : "bg-ink/10"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-ink/40">
              <span>{trend[0]?.date.slice(5)}</span>
              <span>{trend[trend.length - 1]?.date.slice(5)}</span>
            </div>
          </div>
        )}
      </section>

      {breakdown.length > 0 && (
        <section>
          <h2 className="font-serif font-semibold text-ink mb-3">By contest</h2>
          <div className="rounded-lg border border-ink/15 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-ink/5">
                  <th className="text-left px-4 py-2 font-medium text-ink/70">Contest</th>
                  <th className="text-right px-4 py-2 font-medium text-ink/70">Sessions</th>
                  <th className="text-right px-4 py-2 font-medium text-ink/70">Avg score</th>
                  <th className="text-right px-4 py-2 font-medium text-ink/70">Hours</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((b) => (
                  <tr key={b.contest} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-2 font-medium text-ink">{b.contest}</td>
                    <td className="px-4 py-2 text-right font-mono text-ink/80">{b.sessionCount}</td>
                    <td className="px-4 py-2 text-right font-mono text-stamp">{b.avgScore}</td>
                    <td className="px-4 py-2 text-right font-mono text-ink/80">
                      {b.totalHours > 0 ? b.totalHours : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {focusContest && (
        <section className="rounded-lg border border-stamp/30 bg-stamp/5 p-5">
          <h2 className="font-serif font-semibold text-ink">Focus area</h2>
          <p className="text-sm text-ink/80 mt-2">
            Your lowest average plausibility score is in{" "}
            <span className="font-medium">{focusContest.contest}</span> (
            {focusContest.avgScore} avg over {focusContest.sessionCount} sessions). This is a rough
            signal from your uploaded work — not a precise grade — but it may be worth putting more
            deliberate practice there.
          </p>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-ink/15 bg-paper p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`mt-1 text-2xl font-semibold text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
