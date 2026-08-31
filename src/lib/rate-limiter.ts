// Rate limiter en memoria por IP/Identificador para proteger endpoints críticos y autenticación.

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const limitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetInMs: number } {
  const maxRequests = options.maxRequests ?? 5; // por defecto 5 intentos
  const windowMs = options.windowMs ?? 60_000; // ventana de 1 minuto
  const now = Date.now();

  const record = limitStore.get(identifier);

  if (!record || now > record.resetAt) {
    limitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

export function resetRateLimit(identifier: string): void {
  limitStore.delete(identifier);
}
