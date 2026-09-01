import { getCourses } from "@/features/courses/actions/get-courses";
import { CourseCatalogView } from "@/features/courses/components/course-catalog-view";
import { requireAuth } from "@/lib/auth-helpers";

export default async function CoursesPage() {
  const user = await requireAuth();
  const result = await getCourses(user.id);
  const courses = result.success ? result.data : [];
  const canCreate = ["ADMIN", "MANAGER"].includes(user.role);

  return (
    <CourseCatalogView
      initialCourses={courses}
      canCreate={canCreate}
    />
  );
}


