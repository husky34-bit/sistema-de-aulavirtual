-- Course-scoped messaging, contact requests, and per-user message privacy.
CREATE TYPE "ContactRequestStatus" AS ENUM ('PENDING', 'ACCEPTED');

ALTER TABLE "User"
ADD COLUMN "messagePrivacy" TEXT NOT NULL DEFAULT 'COURSES';

ALTER TABLE "conversations"
ADD COLUMN "courseId" TEXT,
ADD COLUMN "directKey" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" "ContactRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversations_directKey_key" ON "conversations"("directKey");
CREATE INDEX "conversations_courseId_idx" ON "conversations"("courseId");
CREATE UNIQUE INDEX "contact_requests_requesterId_recipientId_key" ON "contact_requests"("requesterId", "recipientId");
CREATE INDEX "contact_requests_recipientId_status_idx" ON "contact_requests"("recipientId", "status");
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_requesterId_fkey"
FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_recipientId_fkey"
FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
