// Servicio de almacenamiento de archivos.
// Define una interfaz StorageDriver y una implementación local (LocalStorageDriver)
// que guarda archivos en el directorio configurado por UPLOAD_ROOT.

import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface StorageDriver {
  put(buffer: Buffer, key: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}

const UPLOAD_ROOT = process.env.UPLOAD_ROOT ?? './uploads';

/**
 * Genera una clave de almacenamiento única a partir del nombre del archivo.
 */
export function makeStorageKey(filename: string): string {
  const uuid = randomUUID();
  // Sanitizar el nombre: solo alfanuméricos, guiones y puntos
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  return `${uuid}-${safe}`;
}

export class LocalStorageDriver implements StorageDriver {
  constructor(private root: string = UPLOAD_ROOT) {}

  private fullPath(key: string): string {
    return path.join(this.root, key);
  }

  async put(buffer: Buffer, key: string): Promise<void> {
    await fs.mkdir(this.root, { recursive: true });
    await fs.writeFile(this.fullPath(key), buffer);
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(this.fullPath(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.fullPath(key));
    } catch {
      // Ignorar si el archivo no existe
    }
  }

  url(key: string): string {
    return `/api/files/${key}`;
  }
}

export const storage: StorageDriver = new LocalStorageDriver();
