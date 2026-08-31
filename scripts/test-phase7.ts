// Script de verificación integral para la Fase 7 de ZenviaLMS.

import { aggregate } from '../src/features/grades/services/aggregation-engine';
import { gradeQuestion } from '../src/features/questions/services/question-engine';
import { checkRateLimit, resetRateLimit } from '../src/lib/rate-limiter';
import { t } from '../src/lib/i18n';
import { SimulatedAiProvider } from '../src/features/ai/services/ai-provider';
import { evaluateFormula } from '../src/features/questions/services/calculated-datasets';

async function main() {
  console.log('🚀 Iniciando suite de validación de la FASE 7...\n');

  // 1. Motores de evaluación y agregación (7A)
  console.log('1️⃣ Validando motores de calificación y agregación (7A)...');
  const gradeRes = gradeQuestion(
    {
      type: 'multichoice',
      single: true,
      shuffle: false,
      options: [
        { text: 'A', fraction: 0 },
        { text: 'B', fraction: 1 },
      ],
    },
    { kind: 'choice', selected: [1] },
    10
  );
  if (gradeRes.score !== 10 || !gradeRes.correct) {
    throw new Error('Fallo en gradeQuestion');
  }

  const aggRes = aggregate(
    [
      { fraction: 0.8, weight: 1 },
      { fraction: 1.0, weight: 1 },
    ],
    'mean'
  );
  if (aggRes.value !== 90) {
    throw new Error('Fallo en aggregate');
  }
  console.log('   ✅ Motores de evaluación y agregación validados al 100%.');

  // 2. Seguridad anti-inyección (7A / 7E)
  console.log('2️⃣ Validando guardián de seguridad anti-inyección en fórmulas...');
  const safeEval = evaluateFormula('{a} + 5', { datasetValues: { a: 10 } });
  const evilEval = evaluateFormula('{a}; process.exit()', { datasetValues: { a: 10 } });
  if (safeEval !== 15 || evilEval !== null) {
    throw new Error('Fallo en la validación anti-inyección');
  }
  console.log('   ✅ Guardián anti-inyección activo y bloqueando payloads maliciosos.');

  // 3. Rate Limiter (7E)
  console.log('3️⃣ Validando limitador de tasa (Rate Limiter anti-fuerza bruta)...');
  resetRateLimit('test_ip');
  for (let i = 1; i <= 5; i++) {
    const check = checkRateLimit('test_ip', { maxRequests: 5, windowMs: 10000 });
    if (!check.allowed) throw new Error(`El intento ${i} debería permitirse`);
  }
  const blocked = checkRateLimit('test_ip', { maxRequests: 5, windowMs: 10000 });
  if (blocked.allowed) {
    throw new Error('El intento 6 debería estar bloqueado por rate limit');
  }
  console.log('   ✅ Rate Limiter bloqueando correctamente tras exceder el umbral.');

  // 4. Internacionalización i18n (7F)
  console.log('4️⃣ Validando sistema de internacionalización (i18n)...');
  const esText = t('auth.login', 'es');
  const enText = t('auth.login', 'en');
  if (esText !== 'Iniciar Sesión' || enText !== 'Sign In') {
    throw new Error(`Fallo en i18n: es="${esText}", en="${enText}"`);
  }
  console.log(`   ✅ Diccionarios validados: ES="${esText}", EN="${enText}".`);

  // 5. Asistente de IA (7G)
  console.log('5️⃣ Validando Asistente de IA (Placements: courseassist)...');
  const ai = new SimulatedAiProvider();
  const rawAi = await ai.complete('Genera 2 preguntas sobre "Física Cuántica" en español.');
  const parsedAi = JSON.parse(rawAi);
  if (!parsedAi.questions || parsedAi.questions.length === 0) {
    throw new Error('Fallo en la generación de preguntas por IA');
  }
  console.log(`   ✅ IA generó ${parsedAi.questions.length} preguntas estructuradas en borrador.`);

  console.log('\n🎉 ¡TODAS LAS VALIDACIONES DE LA FASE 7 PASARON EXITOSAMENTE!');
}

main().catch((err) => {
  console.error('❌ Error en test-phase7:', err);
  process.exit(1);
});
