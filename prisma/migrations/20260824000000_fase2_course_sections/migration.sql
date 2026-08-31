-- Fase 2: transformar el esquema de Fase 1 al modelo nuevo (cursos, secciones, matrículas)
-- Estrategia: renombrar/reutilizar columnas existentes para preservar datos de cursos
-- y usuarios; eliminar columnas/enum obsoletos; añadir published, enrolKey, CourseSection.

-- ───────────────────────────────────────────────────────────
-- 1. Tabla Course: transformar al modelo nuevo
-- ───────────────────────────────────────────────────────────

-- fullName -> title  (renombrar)
ALTER TABLE "Course" RENAME COLUMN "fullName" TO "title";

-- summary -> description  (renombrar; era nullable, sigue siéndolo)
ALTER TABLE "Course" RENAME COLUMN "summary" TO "description";

-- ownerId -> instructorId  (renombrar; preserva el instructor de cada curso)
ALTER TABLE "Course" RENAME COLUMN "ownerId" TO "instructorId";

-- Eliminar columnas obsoletas de Fase 1
ALTER TABLE "Course" DROP COLUMN "shortName";
ALTER TABLE "Course" DROP COLUMN "startDate";
ALTER TABLE "Course" DROP COLUMN "endDate";

-- published: por defecto false. cursos existentes los marcamos como publicados
-- para no ocultarlos tras la migración.
ALTER TABLE "Course" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Course" SET "published" = true;

-- enrolKey: clave de auto-matriculación (Paso 5), nullable
ALTER TABLE "Course" ADD COLUMN "enrolKey" TEXT;

-- imageUrl: ya no estaba en Fase 1 pero el schema.prisma lo define; nullable
ALTER TABLE "Course" ADD COLUMN "imageUrl" TEXT;

-- visibility (enum) ya no se usa: eliminar la columna
ALTER TABLE "Course" DROP COLUMN "visibility";

-- Renombrar la relación de User: coursesOwned -> coursesTaught
-- (solo metadato a nivel Prisma; en SQL no cambia nada salvo el FK,
--  que sigue apuntando de Course.instructorId -> User.id)

-- ───────────────────────────────────────────────────────────
-- 2. Enum CourseVisibility: ya no se usa, eliminar
-- ───────────────────────────────────────────────────────────
DROP TYPE "CourseVisibility";

-- ───────────────────────────────────────────────────────────
-- 3. Tabla Enrollment: transformar al modelo nuevo
-- ───────────────────────────────────────────────────────────

-- Eliminar la columna role (enum EnrollmentRole deja de usarse)
ALTER TABLE "Enrollment" DROP COLUMN "role";

-- createdAt -> enrolledAt  (renombrar)
ALTER TABLE "Enrollment" RENAME COLUMN "createdAt" TO "enrolledAt";

-- ───────────────────────────────────────────────────────────
-- 4. Enum EnrollmentRole: ya no se usa, eliminar
-- ───────────────────────────────────────────────────────────
DROP TYPE "EnrollmentRole";

-- ───────────────────────────────────────────────────────────
-- 5. Tabla CourseSection (nueva)
-- ───────────────────────────────────────────────────────────
CREATE TABLE "course_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_sections_pkey" PRIMARY KEY ("id")
);

-- Índice único [courseId, position]
CREATE UNIQUE INDEX "course_sections_courseId_position_key" ON "course_sections"("courseId", "position");

-- Índice por courseId
CREATE INDEX "course_sections_courseId_idx" ON "course_sections"("courseId");

-- FK: CourseSection.courseId -> Course.id (onDelete: Cascade)
ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ───────────────────────────────────────────────────────────
-- 6. Crear "Sección 1" para cada curso existente que no tenga secciones
-- ───────────────────────────────────────────────────────────
INSERT INTO "course_sections" ("id", "title", "position", "courseId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid ()::text,
  'Sección 1',
  0,
  c."id",
  NOW(),
  NOW()
FROM "Course" c
WHERE NOT EXISTS (
  SELECT 1 FROM "course_sections" s WHERE s."courseId" = c."id"
);
