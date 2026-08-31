"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const privacySchema = z.enum(["CONTACTS", "COURSES"]);

async function siteWideMessagingEnabled() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "messaging.sitewide.enabled" },
    select: { value: true },
  });
  return setting?.value === "true";
}

async function areContacts(firstUserId: string, secondUserId: string) {
  return prisma.contactRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: firstUserId, recipientId: secondUserId },
        { requesterId: secondUserId, recipientId: firstUserId },
      ],
    },
    select: { id: true },
  });
}

async function userCanAccessCourse(userId: string, courseId: string, role: string) {
  if (["ADMIN", "TEACHER", "MANAGER"].includes(role)) return true;
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      OR: [{ instructorId: userId }, { enrollments: { some: { userId } } }],
    },
    select: { id: true },
  });
  return Boolean(course);
}

async function canMessageRecipient(senderId: string, recipientId: string, courseId: string) {
  const [recipient, siteWide, contacts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, messagePrivacy: true },
    }),
    siteWideMessagingEnabled(),
    areContacts(senderId, recipientId),
  ]);
  if (!recipient) return false;
  if (siteWide || contacts) return true;
  if (recipient.messagePrivacy !== "COURSES") return false;

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      OR: [{ instructorId: recipientId }, { enrollments: { some: { userId: recipientId } } }],
    },
    select: { id: true },
  });
  return Boolean(course);
}

export async function getCourseParticipants(courseId: string) {
  const user = await requireAuth();
  if (!(await userCanAccessCourse(user.id, courseId, user.role))) {
    return { success: false as const, error: "No autorizado" };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      instructor: { select: { id: true, name: true, image: true, role: true, messagePrivacy: true } },
      enrollments: {
        select: { user: { select: { id: true, name: true, image: true, role: true, messagePrivacy: true } } },
        orderBy: { enrolledAt: "asc" },
      },
    },
  });
  if (!course) return { success: false as const, error: "Curso no encontrado" };

  const people = [course.instructor, ...course.enrollments.map((enrollment) => enrollment.user)]
    .filter((person, index, all) => person.id !== user.id && all.findIndex((item) => item.id === person.id) === index);
  const siteWide = await siteWideMessagingEnabled();
  const contactRows = people.length === 0
    ? []
    : await prisma.contactRequest.findMany({
        where: {
          status: "ACCEPTED",
          OR: [
            { requesterId: user.id, recipientId: { in: people.map((person) => person.id) } },
            { recipientId: user.id, requesterId: { in: people.map((person) => person.id) } },
          ],
        },
        select: { requesterId: true, recipientId: true },
      });
  const contactIds = new Set(contactRows.map((row) => row.requesterId === user.id ? row.recipientId : row.requesterId));

  return {
    success: true as const,
    data: {
      courseTitle: course.title,
      people: people.map((person) => ({
        id: person.id,
        name: person.name,
        image: person.image,
        role: person.role,
        canMessage: siteWide || person.messagePrivacy === "COURSES" || contactIds.has(person.id),
      })),
    },
  };
}

export async function startCourseConversation(courseId: string, recipientId: string) {
  const user = await requireAuth();
  if (recipientId === user.id) return { success: false as const, error: "No puedes enviarte un mensaje a ti mismo" };
  if (!(await userCanAccessCourse(user.id, courseId, user.role))) return { success: false as const, error: "No autorizado" };
  if (!(await canMessageRecipient(user.id, recipientId, courseId))) {
    return { success: false as const, error: "Esta persona solo recibe mensajes de sus contactos" };
  }

  const directKey = `${courseId}:${[user.id, recipientId].sort().join(":")}`;
  const conversation = await prisma.conversation.upsert({
    where: { directKey },
    update: {},
    create: {
      courseId,
      directKey,
      members: { create: [{ userId: user.id }, { userId: recipientId }] },
    },
    select: { id: true },
  });
  return { success: true as const, conversationId: conversation.id };
}

export async function requestContact(courseId: string, recipientId: string) {
  const user = await requireAuth();
  if (recipientId === user.id) return { success: false as const, error: "No puedes agregarte a ti mismo" };
  if (!(await userCanAccessCourse(user.id, courseId, user.role))) return { success: false as const, error: "No autorizado" };
  const recipientCanAccess = await userCanAccessCourse(recipientId, courseId, "STUDENT");
  if (!recipientCanAccess) return { success: false as const, error: "La persona no pertenece a este curso" };

  const reverseRequest = await prisma.contactRequest.findUnique({
    where: { requesterId_recipientId: { requesterId: recipientId, recipientId: user.id } },
    select: { id: true, status: true },
  });
  if (reverseRequest?.status === "PENDING") {
    await prisma.contactRequest.update({ where: { id: reverseRequest.id }, data: { status: "ACCEPTED" } });
  } else {
    await prisma.contactRequest.upsert({
      where: { requesterId_recipientId: { requesterId: user.id, recipientId } },
      update: {},
      create: { requesterId: user.id, recipientId },
    });
  }
  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/dashboard/messages");
  return { success: true as const };
}

export async function getMessagePreferences() {
  const user = await requireAuth();
  const [profile, requests] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { messagePrivacy: true } }),
    prisma.contactRequest.findMany({
      where: { recipientId: user.id, status: "PENDING" },
      include: { requester: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    privacy: (profile.messagePrivacy === "CONTACTS" ? "CONTACTS" : "COURSES") as "CONTACTS" | "COURSES",
    requests: requests.map((request) => ({ id: request.id, name: request.requester.name, role: request.requester.role })),
  };
}

export async function updateMessagePrivacy(value: unknown) {
  const user = await requireAuth();
  const parsed = privacySchema.safeParse(value);
  if (!parsed.success) return { success: false as const, error: "Preferencia inválida" };
  await prisma.user.update({ where: { id: user.id }, data: { messagePrivacy: parsed.data } });
  revalidatePath("/dashboard/messages");
  return { success: true as const };
}

export async function acceptContactRequest(requestId: string) {
  const user = await requireAuth();
  const request = await prisma.contactRequest.updateMany({
    where: { id: requestId, recipientId: user.id, status: "PENDING" },
    data: { status: "ACCEPTED" },
  });
  if (request.count === 0) return { success: false as const, error: "Solicitud no encontrada" };
  revalidatePath("/dashboard/messages");
  return { success: true as const };
}
