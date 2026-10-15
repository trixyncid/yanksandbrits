import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

export const auth = betterAuth({
  appName: "CMS",
  baseURL: process.env.BETTER_AUTH_URL,
  // `next build` loads this module without runtime secrets. Requests always need BETTER_AUTH_SECRET.
  secret: process.env.BETTER_AUTH_SECRET ?? (process.env.NEXT_PHASE === "phase-production-build" ? "build-only-placeholder-secret-never-used" : undefined),
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Accounts are created by an admin or by `bun run db:seed`, never from a public form.
    disableSignUp: true,
    minPasswordLength: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: { type: ["admin", "editor"], required: false, defaultValue: "editor", input: false },
    },
  },
  rateLimit: { enabled: true, window: 60, max: 20 },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
