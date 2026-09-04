import { defineConfig } from "prisma/config";

// Load .env file for Prisma CLI commands (Node 20+ built-in)
try {
  process.loadEnvFile(".env");
} catch {
  // .env file not found or already loaded — safe to ignore
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});
