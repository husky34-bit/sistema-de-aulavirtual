import { requireAuth } from "@/lib/auth-helpers";
import { CourseSection } from "@/features/sections/components/course-section";
import { AddSectionForm } from "@/features/sections/components/add-section-form";
import { EnrolKeyForm } from "@/features/enrolment-methods/components/enrol-key-form";
import { CourseQuizList } from "@/features/quizzes/components/course-quiz-list";
import { CourseAssignmentList } from "@/features/assignments/components/course-assignment-list";
import { getCourseContent } from "@/features/courses/actions/get-course-content";
import { CourseTabs } from "@/features/courses/components/course-tabs";
import { LiveSessionCountdown } from "@/features/courses/components/live-session-countdown";
import { RecordingsTab } from "@/features/courses/components/recordings-tab";
import { AttendancePanel } from "@/features/courses/components/attendance-panel";
import { CertificateModal } from "@/features/dashboard/components/certificate-modal";
import { CourseParticipants } from "@/features/messaging/components/course-participants";
import { getCourseParticipants } from "@/features/messaging/actions/messaging-policy-actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpenIcon,
  UsersIcon,
  BookIcon,
  BarChartIcon,
  TrendingUpIcon,
  SaveIcon,
  CheckCircleIcon,
} from "@/components/Icons";
import type { CourseTab } from "@/features/courses/components/course-tabs";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: CourseTab =
    (tab as CourseTab) || "modules";

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const isStaff = ["ADMIN", "TEACHER", "MANAGER"].includes(user.role);
  const canEdit = course.instructor.id === user.id || isStaff;
  const canEnroll = ["ADMIN", "MANAGER"].includes(user.role);

  const isEnrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  const canView = isStaff || canEdit || !!isEnrolled;
  const participantResult = canView && activeTab === "participants"
    ? await getCourseParticipants(course.id)
    : null;

  // Cargar contenido de las secciones
  const contentResult = canView ? await getCourseContent(course.id) : null;
  const sections = contentResult?.success ? contentResult.data : [];

  // Etiquetas
  const labelContents: Record<string, string> = {};
  if (contentResult?.success) {
    for (const s of sections) {
      for (const item of s.items) {
        if (item.type === "label") {
          const label = await prisma.label.findUnique({
            where: { id: item.id },
            select: { content: true },
          });
          if (label) labelContents[item.id] = label.content;
        }
      }
    }
  }

  // Datos de grabaciones y asistencia (Fase 7)
  const [recordings, attendanceSessions, enrolledUsers] = canView
    ? await Promise.all([
        prisma.classRecording?.findMany
          ? prisma.classRecording.findMany({
              where: { courseId: course.id, published: true },
              orderBy: { sessionDate: "desc" },
            })
          : Promise.resolve([]),
        prisma.attendanceSession?.findMany
          ? prisma.attendanceSession.findMany({
              where: { courseId: course.id },
              include: { records: { select: { userId: true, present: true } } },
              orderBy: { date: "asc" },
            })
          : Promise.resolve([]),
        canEdit
          ? prisma.enrollment.findMany({
              where: { courseId: course.id },
              include: { user: { select: { id: true, name: true, email: true } } },
            })
          : Promise.resolve([]),
      ])
    : [[], [], []];

  // Contadores para las pestañas
  const allItems = sections.flatMap((s) => s.items);
  const tabCounts = {
    modules: sections.length,
    recordings: recordings.length,
    labs: allItems.filter((i) => i.type === "assign").length,
    exams: allItems.filter((i) => i.type === "quiz").length,
    forums: allItems.filter((i) => i.type === "forum").length,
    participants: course._count.enrollments + 1,
  };

  const enrolledStudents = enrolledUsers.map((e) => ({
    id: e.user.id,
    name: e.user.name,
    email: e.user.email,
  }));

  // Próxima sesión: hoy a las 19:00 (basado en liveSchedule del curso o default)
  const today = new Date();
  today.setHours(19, 0, 0, 0);
  const nextSessionAt = today.toISOString();

  return (
    <div className="space-y-8 font-poppins">
      {/* Course Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00155C] via-[#002147] to-[#0A1A3A] p-8 text-white shadow-xl shadow-[#00155C]/20 ring-1 ring-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-[#026BCA]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {course.imageUrl && (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-28 w-44 rounded-xl object-cover shrink-0 border border-white/20 shadow-lg"
                />
              )}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#00BCE4]/15 px-3.5 py-1 text-xs font-bold text-[#00BCE4] ring-1 ring-[#00BCE4]/30 backdrop-blur-sm">
                  <BookOpenIcon size={14} className="shrink-0" /> AULA VIRTUAL · COGNOS CAPACITACIÓN
                </div>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl text-white font-poppins">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                    {course.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#026BCA] text-[10px] font-bold text-white shadow-sm">
                  {(course.instructor.name ?? "D")[0]}
                </span>
                <span>
                  Docente: <strong className="text-white">{course.instructor.name}</strong>
                </span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <UsersIcon size={14} className="shrink-0" />
                <span>{course._count.enrollments} estudiantes inscritos</span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1 text-[#12AC81] font-semibold">
                <CheckCircleIcon size={14} />
                <span>Nota mínima: 70 pts</span>
              </div>
              {/* Área y nivel si están configurados */}
              {course.area && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold capitalize">
                    {course.area}
                  </span>
                </>
              )}
              {course.modality === "live" && (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  Virtual en Vivo
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {!canEdit && isEnrolled && (
              <CertificateModal
                studentName={user.name ?? "Estudiante Zenvia"}
                courseTitle={course.title}
                gradeScore={94}
              />
            )}
            {canEdit && (
              <>
                <Link
                  href={`/dashboard/courses/${course.id}/questions`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <BookIcon size={13} className="shrink-0" /> Banco de preguntas
                </Link>
                <Link
                  href={`/dashboard/courses/${course.id}/grades`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <BarChartIcon size={13} className="shrink-0" /> Calificaciones
                </Link>
                <Link
                  href={`/dashboard/courses/${course.id}/reports`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <TrendingUpIcon size={13} className="shrink-0" /> Reportes
                </Link>
                <Link
                  href={`/dashboard/courses/${course.id}/backup`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#026BCA]/20 transition-all hover:scale-105"
                >
                  <SaveIcon size={13} className="shrink-0" /> Respaldo
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {canView ? (
        <div className="space-y-6">
          {/* Navegación por pestañas */}
          <CourseTabs activeTab={activeTab} counts={tabCounts} />

          {/* ──────────── TAB: MÓDULOS ──────────── */}
          {activeTab === "modules" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[#00155C]">Estructura y Contenido del Programa</h2>
                <span className="text-xs font-bold text-slate-500">{sections.length} Módulos disponibles</span>
              </div>
              {sections.map((section) => (
                <CourseSection
                  key={section.id}
                  section={section}
                  courseId={course.id}
                  canEdit={canEdit}
                  items={section.items}
                  labelContents={labelContents}
                />
              ))}
              {canEdit && <AddSectionForm courseId={course.id} />}
            </div>
          )}

          {/* ──────────── TAB: CLASES EN VIVO ──────────── */}
          {activeTab === "live" && (
            <div className="space-y-6">
              <LiveSessionCountdown
                liveUrl={course.liveUrl ?? "https://zoom.us"}
                schedule={course.liveSchedule ?? "Lunes a Viernes de 19:00 a 22:00 (GMT-4)"}
                provider={course.liveProvider ?? "zoom"}
                nextSessionAt={nextSessionAt}
              />
              <RecordingsTab
                courseId={course.id}
                recordings={recordings}
                canEdit={canEdit}
              />
            </div>
          )}

          {/* ──────────── TAB: LABORATORIOS ──────────── */}
          {activeTab === "labs" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#00155C]">Laboratorios y Tareas</h2>
                <p className="text-xs text-slate-500 mt-0.5">Actividades prácticas y entregables del curso</p>
              </div>
              <CourseAssignmentList courseId={course.id} canEdit={canEdit} />
            </div>
          )}

          {/* ──────────── TAB: EXÁMENES ──────────── */}
          {activeTab === "exams" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#00155C]">Exámenes y Quizzes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Evaluaciones cronometradas del programa</p>
              </div>
              <CourseQuizList courseId={course.id} canEdit={canEdit} />
            </div>
          )}

          {/* ──────────── TAB: ASISTENCIA (subpestaña en Clases) ──────────── */}
          {activeTab === "forum" && (
            <div className="space-y-4">
              <AttendancePanel
                courseId={course.id}
                sessions={attendanceSessions}
                enrolledStudents={enrolledStudents}
                canEdit={canEdit}
                currentUserId={!canEdit ? user.id : undefined}
              />
            </div>
          )}

          {/* ──────────── TAB: PARTICIPANTES ──────────── */}
          {activeTab === "participants" && participantResult?.success && (
            <div className="space-y-4">
              <CourseParticipants
                courseId={course.id}
                courseTitle={course.title}
                people={participantResult.data.people}
                canEnroll={canEnroll}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF6FF] text-[#00155C] mb-4">
            <BookOpenIcon size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#00155C]">Acceso Restringido al Curso</h3>
          <p className="mt-1 text-xs text-slate-500 mb-6">
            Introduce la clave de matriculación proporcionada por tu asesor de Cognos para ingresar.
          </p>
          <EnrolKeyForm courseId={course.id} />
        </div>
      )}
    </div>
  );
}
