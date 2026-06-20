import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SessionForm } from "@/components/SessionForm";
import { SessionCard } from "@/components/SessionCard";
import { SignOutButton } from "@/components/AuthButtons";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sessions = await prisma.studySession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-10">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-ink">Your study log</h1>
          <p className="text-sm text-ink/60">Signed in as {session.user.email}</p>
        </div>
        <SignOutButton />
      </header>

      <DashboardNav />

      <section className="mb-10">
        <SessionForm />
      </section>

      <section className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-ink/50 text-sm">
            No sessions yet. Upload a photo of your work above to log your first one.
          </p>
        ) : (
          sessions.map((s) => <SessionCard key={s.id} session={s} />)
        )}
      </section>
    </div>
  );
}
