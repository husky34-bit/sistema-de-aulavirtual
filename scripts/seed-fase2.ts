import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const hash = await bcrypt.hash("Password1!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@zenvia.lms" },
    update: { role: "ADMIN", password: hash, name: "Admin Zenvia" },
    create: { email: "admin@zenvia.lms", role: "ADMIN", password: hash, name: "Admin Zenvia" },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@zenvia.lms" },
    update: { role: "TEACHER", password: hash, name: "Profesor Zenvia" },
    create: { email: "teacher@zenvia.lms", role: "TEACHER", password: hash, name: "Profesor Zenvia" },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@zenvia.lms" },
    update: { role: "STUDENT", password: hash, name: "Estudiante Zenvia" },
    create: { email: "student@zenvia.lms", role: "STUDENT", password: hash, name: "Estudiante Zenvia" },
  });

  console.log("Seeded:", admin.email, teacher.email, student.email);
  await prisma.$disconnect();
}

main().catch(console.error);
