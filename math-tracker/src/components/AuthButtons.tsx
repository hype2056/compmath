"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { redirectTo: "/dashboard" })}
      className="rounded-md bg-ink px-5 py-2.5 text-paper font-medium"
    >
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/" })}
      className="text-sm text-ink/60 hover:text-ink"
    >
      Sign out
    </button>
  );
}
