import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/AuthButtons";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-serif font-semibold text-ink">Sign in</h1>
        <p className="text-ink/60 text-sm max-w-sm mx-auto">
          Sign in with Google to start logging your practice sessions.
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
