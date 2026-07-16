import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';

// Lê a string de conexao do banco a partir do .env.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não está definida no arquivo .env");
}

// Prisma 7 aqui usa adapter PostgreSQL em vez de cliente cru.
const adapter = new PrismaPg({ connectionString });

// Cliente central compartilhado por todas as rotas do backend.
export const prisma = new PrismaClient({ adapter });
