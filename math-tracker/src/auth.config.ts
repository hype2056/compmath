import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Edge-safe config: providers + callbacks only, no adapter/Prisma here.
// (Importing Prisma in the proxy/middleware would pull in Node APIs
// that aren't available in the edge runtime.)
export default {
  providers: [Google],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
