"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  BookOpenIcon,
  VideoIcon,
  ClipboardIcon,
  BarChartIcon,
  MessageSquareIcon,
  UsersIcon,
} from "@/components/Icons";

export type CourseTab = "modules" | "live" | "labs" | "exams" | "forum" | "participants";

interface CourseTabsProps {
  activeTab: CourseTab;
  counts: {
    modules: number;
    recordings: number;
    labs: number;
    exams: number;
    forums: number;
    participants: number;
  };
}

const TABS: {
  id: CourseTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  countKey: keyof CourseTabsProps["counts"];
}[] = [
  { id: "modules",  label: "Módulos y Materiales",        shortLabel: "Módulos",    icon: BookOpenIcon,      countKey: "modules" },
  { id: "live",     label: "Clases en Vivo y Grabaciones", shortLabel: "Clases",     icon: VideoIcon,         countKey: "recordings" },
  { id: "labs",     label: "Laboratorios y Tareas",        shortLabel: "Tareas",     icon: ClipboardIcon,     countKey: "labs" },
  { id: "exams",    label: "Exámenes y Quizzes",           shortLabel: "Exámenes",   icon: BarChartIcon,      countKey: "exams" },
  { id: "forum",    label: "Foro de Consultas",            shortLabel: "Foro",       icon: MessageSquareIcon, countKey: "forums" },
  { id: "participants", label: "Participantes",            shortLabel: "Personas",   icon: UsersIcon,         countKey: "participants" },
];

export function CourseTabs({ activeTab, counts }: CourseTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigate(tab: CourseTab) {
    startTransition(() => {
      router.push(`${pathname}?tab=${tab}`, { scroll: false });
    });
  }

  return (
    <div className="relative font-poppins">
      {/* Tab bar */}
      <div className="flex items-end overflow-x-auto gap-0.5 border-b border-slate-200 scrollbar-hide pb-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const count = counts[tab.countKey];

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              disabled={isPending}
              className={`
                group relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-xs font-semibold transition-all duration-200
                ${isActive
                  ? "text-[#026BCA] border-b-2 border-[#026BCA] -mb-px bg-white"
                  : "text-slate-500 hover:text-[#00155C] hover:bg-slate-50 rounded-t-xl border-b-2 border-transparent"
                }
              `}
              aria-selected={isActive}
              role="tab"
            >
              <Icon
                size={15}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-[#026BCA]" : "text-slate-400 group-hover:text-[#00155C]"
                }`}
              />
              {/* Full label on desktop, short on mobile */}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>

              {/* Count badge */}
              {count > 0 && (
                <span
                  className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold transition-colors ${
                    isActive
                      ? "bg-[#026BCA] text-white"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}

              {/* Active indicator animation */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#026BCA]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
