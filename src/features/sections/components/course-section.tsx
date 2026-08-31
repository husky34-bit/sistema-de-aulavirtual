"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  renameSection,
  deleteSection,
  moveSection,
} from "../actions/manage-section";
import { ContentTypeIcon } from "@/components/Icons";
import { AddActivityModal } from "./add-activity-modal";

interface SectionContentItem {
  id: string;
  type: 'resource' | 'page' | 'book' | 'url' | 'folder' | 'label' | 'quiz' | 'assign' | 'forum';
  title: string;
  published: boolean;
  icon: string;
}

interface CourseSectionProps {
  section: { id: string; title: string; position: number };
  courseId: string;
  canEdit: boolean;
  items?: SectionContentItem[];
  labelContents?: Record<string, string>;
}

// Mapa de rutas por tipo de actividad
const ROUTE_MAP: Record<string, (courseId: string, id: string) => string> = {
  quiz: (c, i) => `/dashboard/courses/${c}/quiz/${i}`,
  assign: (c, i) => `/dashboard/courses/${c}/assign/${i}`,
  resource: (c, i) => `/dashboard/courses/${c}/resource/${i}`,
  page: (c, i) => `/dashboard/courses/${c}/page/${i}`,
  book: (c, i) => `/dashboard/courses/${c}/book/${i}`,
  url: (c, i) => `/dashboard/courses/${c}/url/${i}`,
  folder: (c, i) => `/dashboard/courses/${c}/folder/${i}`,
  forum: (c, i) => `/dashboard/courses/${c}/forum/${i}`,
};

export function CourseSection({
  section,
  canEdit,
  courseId,
  items = [],
  labelContents = {},
}: CourseSectionProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action;
      if (!result.success && result.error) alert(result.error);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md font-poppins">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-[#00155C] flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EDF6FF] text-xs font-bold text-[#00155C]">
            {section.position + 1}
          </span>
          <span>{section.title}</span>
        </h3>
        {canEdit && (
          <div className="flex flex-wrap gap-1 text-xs font-medium">
            <button
              onClick={() => run(moveSection(section.id, "up"))}
              disabled={isPending}
              className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50 hover:text-[#00155C] disabled:opacity-50 transition"
              title="Subir"
            >
              ↑
            </button>
            <button
              onClick={() => run(moveSection(section.id, "down"))}
              disabled={isPending}
              className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50 hover:text-[#00155C] disabled:opacity-50 transition"
              title="Bajar"
            >
              ↓
            </button>
            <button
              onClick={() => {
                const title = prompt("Nuevo título:", section.title);
                if (title) run(renameSection(section.id, title));
              }}
              disabled={isPending}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 hover:text-[#00155C] disabled:opacity-50 transition"
            >
              Renombrar
            </button>
            <button
              onClick={() => {
                if (confirm("¿Eliminar esta sección?"))
                  run(deleteSection(section.id));
              }}
              disabled={isPending}
              className="rounded-lg border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="mt-3 divide-y divide-slate-100">
          {items.map((item) => {
            const hrefFn = ROUTE_MAP[item.type];
            if (item.type === 'label') {
              return (
                <div
                  key={item.id}
                  className="my-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 border border-slate-100 font-normal"
                  dangerouslySetInnerHTML={{ __html: labelContents[item.id] ?? item.title }}
                />
              );
            }
            if (!hrefFn) return null;
            return (
              <Link
                key={item.id}
                href={hrefFn(courseId, item.id)}
                className="group flex items-center justify-between rounded-xl p-2.5 text-sm text-slate-700 transition hover:bg-[#EDF6FF]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF6FF] text-[#026BCA] shadow-sm ring-1 ring-[#026BCA]/20 group-hover:scale-105 group-hover:bg-[#00155C] group-hover:text-white transition">
                    <ContentTypeIcon type={item.type} size={16} />
                  </span>
                  <span className="font-semibold text-slate-800 group-hover:text-[#00155C] transition-colors">
                    {item.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {!item.published && canEdit && (
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Borrador
                    </span>
                  )}
                  <span className="text-slate-400 group-hover:text-[#026BCA] group-hover:translate-x-1 transition font-bold">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-center py-3 text-xs font-medium text-slate-400">
          Sin actividades creadas en esta sección
        </p>
      )}

      {canEdit && (
        <AddActivityModal
          courseId={courseId}
          sectionId={section.id}
          sectionTitle={section.title}
        />
      )}
    </div>
  );
}
