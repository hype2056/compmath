"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Log" },
  { href: "/dashboard/insights", label: "Insights" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-ink/10 mb-8">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? "border-stamp text-ink"
                : "border-transparent text-ink/50 hover:text-ink/80"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
