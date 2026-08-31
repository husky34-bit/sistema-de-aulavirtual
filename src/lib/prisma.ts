import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está definida en el entorno (.env)");
  }
  const adapter = new PrismaPg(url);
  return new PrismaClient({ adapter });
}

export const prisma =
  (globalThis.__prisma && "contactRequest" in globalThis.__prisma && "classRecording" in globalThis.__prisma)
    ? globalThis.__prisma
    : (globalThis.__prisma = createPrismaClient());
