'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

export interface SearchResultItem {
  id: string;
  entityType: 'course' | 'page' | 'forum' | 'resource';
  title: string;
  snippet?: string;
  courseId?: string;
  url: string;
  area?: string | null;
  level?: string | null;
  modality?: string | null;
}

export interface SearchFilters {
  area?: string;
  modality?: string;
  level?: string;
}

export async function globalSearch(
  query: string,
  filters?: SearchFilters
): Promise<{ success: boolean; data: SearchResultItem[] }> {
  await requireAuth();

  const q = query.trim().toLowerCase();

  try {
    const results: SearchResultItem[] = [];

    // Filtros para cursos
    const courseWhere: Record<string, unknown> = {
      published: true,
    };

    if (q) {
      courseWhere.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { area: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (filters?.area && filters.area !== 'all') {
      courseWhere.area = filters.area;
    }
    if (filters?.modality && filters.modality !== 'all') {
      courseWhere.modality = filters.modality;
    }
    if (filters?.level && filters.level !== 'all') {
      courseWhere.level = filters.level;
    }

    // 1. Buscar en Cursos
    const courses = await prisma.course.findMany({
      where: courseWhere,
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        area: true,
        level: true,
        modality: true,
      },
    });

    for (const c of courses) {
      results.push({
        id: c.id,
        entityType: 'course',
        title: c.title,
        snippet: c.description ?? 'Programa oficial Cognos Capacitación',
        url: `/dashboard/courses/${c.id}`,
        area: c.area,
        level: c.level,
        modality: c.modality,
      });
    }

    // Si no hay filtro de área o modalidad específico para cursos, buscamos en Páginas y Foros
    if (!filters?.area || filters.area === 'all') {
      if (q) {
        // 2. Buscar en Páginas de contenido
        const pages = await prisma.contentPage.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
          select: { id: true, title: true, courseId: true },
        });

        for (const p of pages) {
          results.push({
            id: p.id,
            entityType: 'page',
            title: p.title,
            courseId: p.courseId,
            url: `/dashboard/courses/${p.courseId}/page/${p.id}`,
          });
        }

        // 3. Buscar en Foros
        const forums = await prisma.forum.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 10,
          select: { id: true, title: true, description: true, courseId: true },
        });

        for (const f of forums) {
          results.push({
            id: f.id,
            entityType: 'forum',
            title: f.title,
            snippet: f.description ?? 'Foro de debate',
            courseId: f.courseId,
            url: `/dashboard/courses/${f.courseId}/forum/${f.id}`,
          });
        }
      }
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('Error in globalSearch:', error);
    return { success: false, data: [] };
  }
}
