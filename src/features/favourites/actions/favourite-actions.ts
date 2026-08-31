'use server';

import { requireAuth } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

// Almacén reactivo de favoritos por usuario
const userFavourites = new Map<string, Set<string>>();

export async function toggleFavouriteCourse(courseId: string): Promise<{ success: boolean; isFavourite?: boolean; error?: string }> {
  const user = await requireAuth();

  try {
    if (!userFavourites.has(user.id)) {
      userFavourites.set(user.id, new Set());
    }
    const set = userFavourites.get(user.id)!;

    let isFav = false;
    if (set.has(courseId)) {
      set.delete(courseId);
      isFav = false;
    } else {
      set.add(courseId);
      isFav = true;
    }

    revalidatePath('/dashboard');
    return { success: true, isFavourite: isFav };
  } catch (error) {
    console.error('Error toggling favourite:', error);
    return { success: false, error: 'Error al cambiar estado de favorito' };
  }
}

export async function getMyFavourites(): Promise<{ success: boolean; data: string[] }> {
  const user = await requireAuth();
  try {
    const set = userFavourites.get(user.id) ?? new Set();
    return { success: true, data: Array.from(set) };
  } catch {
    return { success: false, data: [] };
  }
}
