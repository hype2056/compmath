import NextAuth from "next-auth"; 
import { PrismaAdapter } from "@auth/prisma-adapter"; 
import { prisma } from "@/lib/db"; 
import authConfig from "@/auth.config"; // 👈 No curly braces!

export const { 
  handlers, 
  signIn, 
  signOut, 
  auth 
} = NextAuth({ 
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, 
  secret: process.env.AUTH_SECRET,
  ...authConfig, 
});