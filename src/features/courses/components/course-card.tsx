import Link from "next/link";
import { BookOpenIcon } from "@/components/Icons";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    imageUrl?: string | null;
    area?: string | null;
    instructor: { name: string | null };
    _count: { enrollments: number };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/dashboard/courses/${course.id}`} className="group block font-poppins h-full">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-xl">
        {/* Top Cover Image / Banner */}
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-[#00155C] via-[#002147] to-[#026BCA]">
          {course.imageUrl ? (
            <>
              <img
                src={course.imageUrl}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00155C]/80 via-transparent to-black/20" />
            </>
          ) : (
            <div className="h-full w-full p-4 text-white flex items-end">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 text-white">
                <BookOpenIcon size={16} />
              </span>
            </div>
          )}

          <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-[#00BCE4] backdrop-blur-md ring-1 ring-white/20">
            {course._count.enrollments} alumnos
          </div>

          {course.area && (
            <div className="absolute bottom-2 left-3 rounded-md bg-[#00155C]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-sm border border-white/10">
              {course.area}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <h3 className="text-base font-bold text-[#00155C] group-hover:text-[#026BCA] transition-colors line-clamp-2">
              {course.title}
            </h3>
            {course.description && (
              <p className="mt-2 line-clamp-2 text-xs text-slate-600 leading-relaxed font-normal">
                {course.description}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00155C] text-[10px] font-bold text-white shadow-sm">
                {(course.instructor.name ?? "D")[0]}
              </div>
              <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                {course.instructor.name}
              </span>
            </div>
            <span className="font-bold text-[#026BCA] group-hover:translate-x-0.5 transition-transform">
              Ver curso →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
