import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },
  // `prisma generate` runs in CI without a database, so the URL may be empty there.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
