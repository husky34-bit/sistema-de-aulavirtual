'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export interface SectionContentItem {
  id: string;
  type: 'resource' | 'page' | 'book' | 'url' | 'folder' | 'label' | 'quiz' | 'assign' | 'forum';
  title: string;
  published: boolean;
  icon: string;
}

// Obtiene todo el contenido publicado (o todo si es staff) de un curso,
// agrupado por sección. Incluye quizzes y assignments ya existentes.
export async function getCourseContent(courseId: string) {
  const user = await requireAuth();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };

  const isStaff = course.instructorId === user.id || ["ADMIN", "TEACHER", "MANAGER"].includes(user.role);

  // Si no es staff, verificar matriculación
  if (!isStaff) {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { id: true },
    });
    if (!enrolled) return { success: false as const, error: 'No autorizado' };
  }

  const publishedFilter = isStaff ? {} : { published: true };

  const [sections, quizzes, assignments, resources, pages, books, urls, folders, labels, forums] =
    await Promise.all([
      prisma.courseSection.findMany({
        where: { courseId },
        orderBy: { position: 'asc' },
        select: { id: true, title: true, position: true },
      }),
      prisma.quiz.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true },
      }),
      prisma.assignment.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true },
      }),
      prisma.resource.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true, sectionId: true },
      }),
      prisma.contentPage.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true, sectionId: true },
      }),
      prisma.book.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true, sectionId: true },
      }),
      prisma.urlResource.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true, sectionId: true },
      }),
      prisma.folder.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true, sectionId: true },
      }),
      prisma.label.findMany({
        where: { courseId },
        select: { id: true, content: true, sectionId: true },
      }),
      prisma.forum.findMany({
        where: { courseId, ...publishedFilter },
        select: { id: true, title: true, published: true, sectionId: true },
      }),
    ]);

  // Agrupar por sección
  const bySection = new Map<string, SectionContentItem[]>();
  for (const s of sections) {
    bySection.set(s.id, []);
  }

  function push(sectionId: string | null, item: SectionContentItem) {
    const key = sectionId ?? '__no_section__';
    const arr = bySection.get(key) ?? [];
    arr.push(item);
    bySection.set(key, arr);
  }

  for (const q of quizzes) push(null, { id: q.id, type: 'quiz', title: q.title, published: q.published, icon: 'quiz' });
  for (const a of assignments) push(null, { id: a.id, type: 'assign', title: a.title, published: a.published, icon: 'assign' });
  for (const r of resources) push(r.sectionId, { id: r.id, type: 'resource', title: r.title, published: r.published, icon: 'resource' });
  for (const p of pages) push(p.sectionId, { id: p.id, type: 'page', title: p.title, published: p.published, icon: 'page' });
  for (const b of books) push(b.sectionId, { id: b.id, type: 'book', title: b.title, published: b.published, icon: 'book' });
  for (const u of urls) push(u.sectionId, { id: u.id, type: 'url', title: u.title, published: u.published, icon: 'url' });
  for (const f of folders) push(f.sectionId, { id: f.id, type: 'folder', title: f.title, published: f.published, icon: 'folder' });
  for (const l of labels) push(l.sectionId, { id: l.id, type: 'label', title: 'label', published: true, icon: 'label' });
  for (const f of forums) push(f.sectionId, { id: f.id, type: 'forum', title: f.title, published: f.published, icon: 'forum' });

  // Los quizzes y assignments no tienen sectionId, los repartimos a una sección "general"
  const noSection = bySection.get('__no_section__') ?? [];
  if (noSection.length > 0 && sections.length > 0) {
    const firstArr = bySection.get(sections[0].id) ?? [];
    bySection.set(sections[0].id, [...firstArr, ...noSection]);
  }
  bySection.delete('__no_section__');

  return {
    success: true as const,
    data: sections.map((s) => ({
      ...s,
      items: bySection.get(s.id) ?? [],
    })),
    isStaff,
  };
}
