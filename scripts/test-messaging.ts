import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Comprobando modelos de mensajería...");
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, messagePrivacy: true } });
  console.log("Usuarios encontrados:", users.length);

  const contactRequests = await prisma.contactRequest.findMany();
  console.log("ContactRequests encontrados:", contactRequests.length);

  const conversations = await prisma.conversation.findMany({
    include: { course: { select: { title: true } }, members: true, messages: true },
  });
  console.log("Conversaciones encontradas:", conversations.length);

  const siteSettings = await prisma.siteSetting.findMany();
  console.log("SiteSettings encontrados:", siteSettings.length);

  console.log("¡Todos los modelos de mensajería funcionan correctamente en Prisma!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error en test-messaging:", err);
  process.exit(1);
});
