import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Config do Prisma CLI: schema local, migrations locais e DATABASE_URL do .env.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
