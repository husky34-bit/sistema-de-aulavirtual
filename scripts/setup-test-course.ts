import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const teacher = await prisma.user.findUnique({ where: { email: "teacher@zenvia.lms" } });
  if (!teacher) {
    console.log("Teacher not found");
    return;
  }

  let course = await prisma.course.findFirst({ where: { instructorId: teacher.id } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Curso de Matemáticas y Física",
        slug: "curso-matematicas-fisica",
        description: "Curso con banco de preguntas integrado",
        published: true,
        instructorId: teacher.id,
        sections: {
          create: [{ title: "Sección 1: Introducción", position: 0 }],
        },
      },
    });
    console.log("Course created:", course.id, course.title);
  } else {
    console.log("Course exists:", course.id, course.title);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
