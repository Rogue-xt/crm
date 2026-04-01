// prisma/config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Note: Use DIRECT_URL for migrations/seeding as it bypasses connection pooling
    url: process.env["DIRECT_URL"],
  },
});
