import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";
import { TeacherDashboard } from "@/features/dashboard/components/teacher-dashboard";
import { StudentDashboard } from "@/features/dashboard/components/student-dashboard";

export default async function DashboardPage() {
  const user = await requireAuth();

  // 🛡️ VISTA PARA ADMINISTRADOR
  if (user.role === "ADMIN") {
    const [totalCourses, totalStudents, totalTeachers, totalQuizzes, courses] =
      await Promise.all([
        prisma.course.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.quiz.count(),
        prisma.course.findMany({
          include: {
            instructor: { select: { name: true } },
            _count: {
              select: {
                enrollments: true,
                sections: true,
                quizzes: true,
                assignments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    return (
      <AdminDashboard
        user={user}
        stats={{ totalCourses, totalStudents, totalTeachers, totalQuizzes }}
        courses={courses}
      />
    );
  }

  // 👨‍🏫 VISTA PARA DOCENTE
  if (user.role === "TEACHER" || user.role === "MANAGER") {
    const [coursesTaught, pendingSubmissions] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId: user.id },
        include: {
          _count: {
            select: {
              enrollments: true,
              sections: true,
              quizzes: true,
              assignments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.submission.findMany({
        where: {
          assignment: { course: { instructorId: user.id } },
          status: "submitted",
        },
        select: {
          id: true,
          submittedAt: true,
          assignment: {
            select: {
              id: true,
              title: true,
              course: { select: { id: true, title: true } },
            },
          },
          user: { select: { name: true, email: true } },
        },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    return (
      <TeacherDashboard
        user={user}
        coursesTaught={coursesTaught}
        pendingSubmissions={pendingSubmissions}
      />
    );
  }

  // 🎓 VISTA PARA ESTUDIANTE (Default)
  const [enrollments, assignments, quizzes] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            _count: {
              select: {
                sections: true,
                quizzes: true,
                assignments: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.assignment.findMany({
      where: {
        course: { enrollments: { some: { userId: user.id } } },
        published: true,
      },
      select: {
        id: true,
        title: true,
        dueAt: true,
        courseId: true,
        course: { select: { title: true } },
      },
      orderBy: { dueAt: "asc" },
      take: 4,
    }),
    prisma.quiz.findMany({
      where: {
        course: { enrollments: { some: { userId: user.id } } },
        published: true,
      },
      select: {
        id: true,
        title: true,
        closeAt: true,
        courseId: true,
        course: { select: { title: true } },
      },
      take: 4,
    }),
  ]);

  const upcomingTasks = [
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      dueAt: a.dueAt,
      courseId: a.courseId,
      courseTitle: a.course.title,
      type: "assign" as const,
    })),
    ...quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      dueAt: q.closeAt,
      courseId: q.courseId,
      courseTitle: q.course.title,
      type: "quiz" as const,
    })),
  ];

  return (
    <StudentDashboard
      user={user}
      enrollments={enrollments}
      upcomingTasks={upcomingTasks}
    />
  );
}
