import { describe, it, expect } from 'vitest';
import {
  canStartAttempt,
  resolveEffectiveConfig,
  isAttemptExpired,
  remainingSeconds,
} from './attempt-engine';

describe('attempt-engine — resolveEffectiveConfig()', () => {
  it('combina config base con overrides de usuario', () => {
    const base = {
      timeLimitMin: 60,
      maxAttempts: 1,
      openAt: new Date('2026-01-01'),
      closeAt: new Date('2026-12-31'),
    };
    const override = {
      timeLimitMin: 90,
      maxAttempts: 2,
      openAt: null,
      closeAt: null,
    };
    const resolved = resolveEffectiveConfig(base, override);
    expect(resolved.timeLimitMin).toBe(90);
    expect(resolved.maxAttempts).toBe(2);
  });
});

describe('attempt-engine — canStartAttempt()', () => {
  const baseConfig = {
    timeLimitMin: 60,
    maxAttempts: 2,
    openAt: new Date('2026-01-01T00:00:00Z'),
    closeAt: new Date('2026-12-31T23:59:59Z'),
  };

  it('permite iniciar si todo está en orden', () => {
    const res = canStartAttempt({
      published: true,
      config: baseConfig,
      now: new Date('2026-06-01T12:00:00Z'),
      finishedAttempts: 0,
      hasActiveAttempt: false,
    });
    expect(res.ok).toBe(true);
  });

  it('rechaza si no está publicado', () => {
    const res = canStartAttempt({
      published: false,
      config: baseConfig,
      now: new Date('2026-06-01T12:00:00Z'),
      finishedAttempts: 0,
      hasActiveAttempt: false,
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('no está publicado');
  });

  it('rechaza si se agotaron los intentos permitidos', () => {
    const res = canStartAttempt({
      published: true,
      config: baseConfig,
      now: new Date('2026-06-01T12:00:00Z'),
      finishedAttempts: 2,
      hasActiveAttempt: false,
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('máximo de intentos');
  });

  it('rechaza si ya tiene un intento en curso', () => {
    const res = canStartAttempt({
      published: true,
      config: baseConfig,
      now: new Date('2026-06-01T12:00:00Z'),
      finishedAttempts: 0,
      hasActiveAttempt: true,
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('intento en curso');
  });
});

describe('attempt-engine — remainingSeconds() & isAttemptExpired()', () => {
  it('calcula segundos restantes con precisión', () => {
    const startedAt = new Date('2026-01-01T10:00:00Z');
    const now = new Date('2026-01-01T10:15:00Z');
    const remaining = remainingSeconds({ startedAt, timeLimitMin: 30, now });
    expect(remaining).toBe(15 * 60); // 900 segundos
  });

  it('detecta intento expirado', () => {
    const startedAt = new Date('2026-01-01T10:00:00Z');
    const now = new Date('2026-01-01T10:31:00Z');
    const expired = isAttemptExpired({
      startedAt,
      state: 'in_progress',
      timeLimitMin: 30,
      now,
    });
    expect(expired).toBe(true);
  });
});
