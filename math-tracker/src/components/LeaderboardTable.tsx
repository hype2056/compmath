import type { LeaderboardRow } from "@/lib/stats";

type Props = {
  rows: LeaderboardRow[];
  currentUserId: string;
};

export function LeaderboardTable({ rows, currentUserId }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink/50">
        Add friends above to see how you compare. Rankings use the last 30 days.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-ink/15 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink/10 bg-ink/5">
            <th className="text-left px-4 py-2 font-medium text-ink/70 w-10">#</th>
            <th className="text-left px-4 py-2 font-medium text-ink/70">Name</th>
            <th className="text-right px-4 py-2 font-medium text-ink/70">Sessions</th>
            <th className="text-right px-4 py-2 font-medium text-ink/70">Avg score</th>
            <th className="text-right px-4 py-2 font-medium text-ink/70">Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isYou = row.userId === currentUserId;
            return (
              <tr
                key={row.userId}
                className={`border-b border-ink/5 last:border-0 ${isYou ? "bg-stamp/5" : ""}`}
              >
                <td className="px-4 py-2 font-mono text-ink/50">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-ink">
                  {row.name}
                  {isYou && <span className="ml-1 text-xs text-stamp">(you)</span>}
                </td>
                <td className="px-4 py-2 text-right font-mono text-ink/80">{row.sessionCount}</td>
                <td className="px-4 py-2 text-right font-mono text-stamp font-semibold">
                  {row.sessionCount > 0 ? row.avgScore : "—"}
                </td>
                <td className="px-4 py-2 text-right font-mono text-ink/80">
                  {row.totalHours > 0 ? row.totalHours : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-ink/40 border-t border-ink/10">
        Ranked by average plausibility score over the last 30 days.
      </p>
    </div>
  );
}
