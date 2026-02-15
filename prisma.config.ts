import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct URL for migrations/push, fallback to DATABASE_URL
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
