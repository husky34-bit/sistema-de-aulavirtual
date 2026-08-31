'use server';

import { isCompleted as checkIsCompleted, countCompleted as fetchCountCompleted, type ActivityType } from '../services/completion-engine';

export async function checkCompletion(userId: string, activityType: ActivityType, activityId: string): Promise<boolean> {
  return await checkIsCompleted(userId, activityType, activityId);
}

export async function getCourseProgress(userId: string, courseId: string): Promise<{ completed: number; total: number }> {
  return await fetchCountCompleted(userId, courseId);
}
