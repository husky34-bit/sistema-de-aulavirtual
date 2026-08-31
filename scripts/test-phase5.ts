import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { aggregate } from '@/features/grades/services/aggregation-engine';
import { computeCourseGrade } from '@/features/grades/services/grade-calculator';
import { syncGradeToGradebook } from '@/features/grades/services/grade-sync';
import { scoreToLetter } from '@/features/grades/actions/manage-letters';

async function main() {
  console.log('🧪 Iniciando verificación automatizada de la Fase 5...\n');
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  // 1. Probar motor de agregación puro
  console.log('1️⃣ Probando motor de agregaciones (aggregation-engine)...');
  const sampleEntries = [
    { fraction: 0.8, weight: 1 },
    { fraction: 0.6, weight: 2 },
    { fraction: null, weight: 1 }, // no calificado: se ignora
  ];

  const mean = aggregate(sampleEntries, 'mean');
  console.log('   - Media simple:', mean?.value, '(esperado: 70)');
  if (Math.abs((mean?.value ?? 0) - 70) > 0.01) throw new Error('Fallo en media simple');

  const weighted = aggregate(sampleEntries, 'weighted');
  console.log('   - Ponderada:', weighted?.value, '(esperado: ~66.67)');
  if (Math.abs((weighted?.value ?? 0) - 66.666) > 0.1) throw new Error('Fallo en agregación ponderada');

  const sum = aggregate(sampleEntries, 'sum');
  console.log('   - Suma normalizada:', sum?.value, '(esperado: 70)');
  if (Math.abs((sum?.value ?? 0) - 70) > 0.01) throw new Error('Fallo en agregación suma');

  const max = aggregate(sampleEntries, 'max');
  console.log('   - Máximo:', max?.value, '(esperado: 80)');
  if (max?.value !== 80) throw new Error('Fallo en agregación max');

  const min = aggregate(sampleEntries, 'min');
  console.log('   - Mínimo:', min?.value, '(esperado: 60)');
  if (min?.value !== 60) throw new Error('Fallo en agregación min');

  const median = aggregate(sampleEntries, 'median');
  console.log('   - Mediana:', median?.value, '(esperado: 70)');
  if (median?.value !== 70) throw new Error('Fallo en agregación median');

  console.log('   ✅ Motor de agregación validado correctamente.\n');

  // 2. Verificar o crear usuarios y curso de prueba
  console.log('2️⃣ Verificando curso y usuarios en base de datos...');
  const teacher = await prisma.user.findUnique({ where: { email: 'teacher@zenvia.lms' } });
  const student = await prisma.user.findUnique({ where: { email: 'student@zenvia.lms' } });
  if (!teacher || !student) throw new Error('Usuarios de prueba no encontrados');

  const course = await prisma.course.findFirst({ where: { instructorId: teacher.id } });
  if (!course) throw new Error('Curso de prueba no encontrado');
  console.log(`   - Curso: ${course.title} (ID: ${course.id})`);

  // Asegurar inscripción del estudiante
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    create: { userId: student.id, courseId: course.id },
    update: {},
  });

  // 3. Crear una Tarea (Assignment) y su GradeItem asociado
  console.log('\n3️⃣ Creando Tarea (Assignment) con ítem de calificación...');
  const assignment = await prisma.assignment.create({
    data: {
      courseId: course.id,
      title: 'Tarea 1: Ensayos de Cinemática',
      description: 'Entrega tu desarrollo en texto',
      instructions: '<p>Explica las leyes del movimiento</p>',
      maxScore: 100,
      allowOnlineText: true,
      published: true,
    },
  });

  const gradeItemAssignment = await prisma.gradeItem.create({
    data: {
      courseId: course.id,
      name: assignment.title,
      maxScore: assignment.maxScore,
      sourceType: 'assignment',
      sourceId: assignment.id,
      weight: 1,
    },
  });
  console.log(`   - Tarea creada: ${assignment.id}`);
  console.log(`   - GradeItem vinculado: ${gradeItemAssignment.id}`);

  // 4. Enviar Tarea por el estudiante
  console.log('\n4️⃣ Simulando envío de tarea por el estudiante...');
  const submission = await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId: assignment.id, userId: student.id } },
    create: {
      assignmentId: assignment.id,
      userId: student.id,
      onlineText: 'El movimiento rectilíneo uniforme tiene velocidad constante y aceleración cero.',
      status: 'submitted',
      submittedAt: new Date(),
    },
    update: {
      onlineText: 'El movimiento rectilíneo uniforme tiene velocidad constante y aceleración cero.',
      status: 'submitted',
      submittedAt: new Date(),
    },
  });
  console.log(`   - Envío creado con estado: ${submission.status}`);

  // 5. Docente califica el envío y sincroniza con Gradebook
  console.log('\n5️⃣ Calificando envío (95/100) y sincronizando con Gradebook...');
  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      score: 95,
      feedback: 'Excelente precisión en las fórmulas.',
      status: 'graded',
      gradedById: teacher.id,
      gradedAt: new Date(),
    },
  });

  await syncGradeToGradebook({
    courseId: course.id,
    sourceType: 'assignment',
    sourceId: assignment.id,
    userId: student.id,
    score: 95,
    maxScore: 100,
  });

  const syncedGrade = await prisma.grade.findUnique({
    where: { gradeItemId_userId: { gradeItemId: gradeItemAssignment.id, userId: student.id } },
  });
  console.log(`   - Nota en Gradebook: ${syncedGrade?.score} / 100 (overridden: ${syncedGrade?.overridden})`);
  if (syncedGrade?.score !== 95) throw new Error('Error al sincronizar nota en gradebook');

  // 6. Probar override manual del docente
  console.log('\n6️⃣ Probando override manual del docente (cambiar nota a 98)...');
  await prisma.grade.update({
    where: { gradeItemId_userId: { gradeItemId: gradeItemAssignment.id, userId: student.id } },
    data: {
      score: 98,
      overridden: true,
      overriddenById: teacher.id,
    },
  });

  // Intentar re-sincronizar y verificar que NO pisa el override
  await syncGradeToGradebook({
    courseId: course.id,
    sourceType: 'assignment',
    sourceId: assignment.id,
    userId: student.id,
    score: 70, // intento de sobreescritura
    maxScore: 100,
  });

  const afterOverride = await prisma.grade.findUnique({
    where: { gradeItemId_userId: { gradeItemId: gradeItemAssignment.id, userId: student.id } },
  });
  console.log(`   - Nota tras re-sync: ${afterOverride?.score} (esperado: 98 — override protegido)`);
  if (afterOverride?.score !== 98) throw new Error('El sync pisó el override del docente');

  // 7. Probar conversión de letras y escalas
  console.log('\n7️⃣ Probando escalas y letras...');
  const letters = [
    { letter: 'A', minPercent: 90 },
    { letter: 'B', minPercent: 80 },
    { letter: 'C', minPercent: 70 },
    { letter: 'F', minPercent: 0 },
  ];
  const letterA = scoreToLetter(98, letters);
  console.log(`   - Letra para 98%: ${letterA} (esperado: A)`);
  if (letterA !== 'A') throw new Error('Error en cálculo de letra');

  // 8. Probar cálculo de nota final del curso en cascada
  console.log('\n8️⃣ Probando cálculo de nota total del curso...');
  const total = await computeCourseGrade(course.id, student.id);
  console.log(`   - Nota calculada del curso para el estudiante:`, total);

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE LA FASE 5 PASARON SATISFACTORIAMENTE!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Error en verificación:', err);
  process.exit(1);
});
