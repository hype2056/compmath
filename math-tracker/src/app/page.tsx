import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/AuthButtons";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <p className="text-xs uppercase tracking-widest text-stamp font-medium">
          AMC · AIME · USAMO · BMT · SMT
        </p>
        <h1 className="text-3xl font-serif font-semibold text-ink leading-tight">
          Prove you did the problems.
        </h1>
        <p className="text-ink/60">
          Upload photos of your worked-out solutions. The AI checks your effort
          against the time you claim, you build a streak, and you compete with
          friends on the leaderboard.
        </p>
        <div className="pt-2">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
