import { z } from "zod";

export const enrollSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
});
