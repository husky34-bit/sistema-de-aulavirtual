import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const course = await prisma.course.findFirst({ where: { slug: "matematicas-avanzadas" } });
  if (course) {
    await prisma.course.update({
      where: { id: course.id },
      data: { enrolKey: "math2026" },
    });
    console.log("Enrol key set for:", course.title, "key: math2026");
  }
  await prisma.$disconnect();
}

main().catch(console.error);
