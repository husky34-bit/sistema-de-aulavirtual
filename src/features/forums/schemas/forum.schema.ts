import { z } from 'zod';

export const forumSchema = z.object({
  courseId: z.string().min(1),
  sectionId: z.string().optional().nullable(),
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  type: z.enum(['general', 'qanda', 'single']).default('general'),
  published: z.boolean().default(false),
});

export const discussionSchema = z.object({
  forumId: z.string().min(1),
  title: z.string().min(3).max(200),
  content: z.string().min(1).max(20000),
});

export const postSchema = z.object({
  discussionId: z.string().min(1),
  parentId: z.string().optional().nullable(),
  content: z.string().min(1).max(20000),
});

export const editPostSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(20000),
});

export type ForumInput = z.infer<typeof forumSchema>;
export type DiscussionInput = z.infer<typeof discussionSchema>;
export type PostInput = z.infer<typeof postSchema>;
