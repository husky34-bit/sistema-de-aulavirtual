import type {
  Quiz,
  QuizOverride,
  AttemptState,
} from '@/generated/prisma/client';

// Configuración efectiva de un quiz para un usuario: combina el quiz base
// con las excepciones (overrides) aplicables a ese estudiante.
export interface EffectiveQuizConfig {
  timeLimitMin: number | null;
  maxAttempts: number; // 0 = ilimitado
  openAt: Date | null;
  closeAt: Date | null;
}

type QuizBase = Pick<Quiz, 'timeLimitMin' | 'maxAttempts' | 'openAt' | 'closeAt'>;
type Override = Pick<
  QuizOverride,
  'timeLimitMin' | 'maxAttempts' | 'openAt' | 'closeAt'
>;

export function resolveEffectiveConfig(quiz: QuizBase, override?: Override | null): EffectiveQuizConfig {
  const base: EffectiveQuizConfig = {
    timeLimitMin: quiz.timeLimitMin,
    maxAttempts: quiz.maxAttempts,
    openAt: quiz.openAt,
    closeAt: quiz.closeAt,
  };

  if (!override) return base;

  // El override solo sobreescribe los campos definidos (no null)
  return {
    timeLimitMin: override.timeLimitMin ?? base.timeLimitMin,
    maxAttempts: override.maxAttempts ?? base.maxAttempts,
    openAt: override.openAt ?? base.openAt,
    closeAt: override.closeAt ?? base.closeAt,
  };
}

export interface CanStartResult {
  ok: boolean;
  reason?: string;
}

// Valida que un estudiante pueda iniciar un nuevo intento:
// quiz publicado, ventana de fechas, intentos máximos, sin intento activo.
export function canStartAttempt(args: {
  published: boolean;
  config: EffectiveQuizConfig;
  now: Date;
  finishedAttempts: number;
  hasActiveAttempt: boolean;
}): CanStartResult {
  const { published, config, now, finishedAttempts, hasActiveAttempt } = args;

  if (!published) {
    return { ok: false, reason: 'El cuestionario no está publicado' };
  }

  if (config.openAt && now < config.openAt) {
    return { ok: false, reason: 'El cuestionario aún no está abierto' };
  }
  if (config.closeAt && now > config.closeAt) {
    return { ok: false, reason: 'El cuestionario ya está cerrado' };
  }

  if (config.maxAttempts > 0 && finishedAttempts >= config.maxAttempts) {
    return { ok: false, reason: 'Has alcanzado el máximo de intentos' };
  }

  if (hasActiveAttempt) {
    return { ok: false, reason: 'Ya tienes un intento en curso' };
  }

  return { ok: true };
}

// ¿El intento ha expirado por su tiempo límite?
export function isAttemptExpired(args: {
  startedAt: Date;
  state: AttemptState;
  timeLimitMin: number | null;
  now?: Date;
}): boolean {
  const { startedAt, state, timeLimitMin } = args;
  if (state !== 'in_progress' || timeLimitMin === null) return false;
  const remaining = remainingSeconds({ startedAt, timeLimitMin, now: args.now });
  return remaining <= 0;
}

// Segundos restantes para el intento, considerando fecha de inicio y límite.
export function remainingSeconds(args: {
  startedAt: Date;
  timeLimitMin: number;
  now?: Date;
}): number {
  const now = args.now ?? new Date();
  const deadlineMs = args.startedAt.getTime() + args.timeLimitMin * 60_000;
  return Math.floor((deadlineMs - now.getTime()) / 1000);
}
