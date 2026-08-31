import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { storage, makeStorageKey } from '@/features/resources/services/file-storage';
import { sanitizeHtml } from '@/features/filters/services/sanitize';
import { canAccess } from '@/features/availability/services/restriction-engine';
import { markComplete, isCompleted, countCompleted } from '@/features/completion/services/completion-engine';
import { notify, notifyMany } from '@/features/notifications/services/notification-dispatcher';
import { generateApiToken } from '@/features/webservices/services/api-auth';
import { serializeCourse } from '@/features/backup/services/backup-serializer';
import { logAction } from '@/features/admin/services/audit-log';

async function main() {
  console.log('🧪 Iniciando verificación automatizada de la Fase 6...\n');
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  // 1. Probar File Storage
  console.log('1️⃣ Probando almacenamiento de archivos (file-storage)...');
  const testBuffer = Buffer.from('Contenido de prueba ZenviaLMS');
  const key = makeStorageKey('documento_prueba.txt');
  await storage.put(testBuffer, key);
  const retrieved = await storage.get(key);
  if (retrieved.toString() !== testBuffer.toString()) {
    throw new Error('Fallo en lectura/escritura de archivo');
  }
  await storage.delete(key);
  console.log('   ✅ File Storage (put, get, delete) validado correctamente.');

  // 2. Probar Sanitización anti-XSS
  console.log('\n2️⃣ Probando sanitización de contenido HTML (anti-XSS)...');
  const malicious = '<p>Hola</p><script>alert("XSS")</script><iframe src="https://evil.com"></iframe><iframe src="https://www.youtube.com/embed/xyz"></iframe>';
  const clean = sanitizeHtml(malicious);
  if (clean.includes('<script>') || clean.includes('evil.com')) {
    throw new Error('Fallo en sanitización de HTML');
  }
  if (!clean.includes('www.youtube.com')) {
    throw new Error('Fallo al preservar iframe permitido de YouTube');
  }
  console.log('   ✅ Sanitizador anti-XSS validado correctamente.');

  // 3. Probar usuarios y curso de prueba
  console.log('\n3️⃣ Verificando usuario y curso para pruebas de interacción y gestión...');
  const teacher = await prisma.user.findUnique({ where: { email: 'teacher@zenvia.lms' } });
  const student = await prisma.user.findUnique({ where: { email: 'student@zenvia.lms' } });
  if (!teacher || !student) throw new Error('Usuarios no encontrados');

  const course = await prisma.course.findFirst({ where: { instructorId: teacher.id } });
  if (!course) throw new Error('Curso no encontrado');
  console.log(`   - Curso: ${course.title}`);

  // 4. Probar Completion Engine
  console.log('\n4️⃣ Probando motor de finalización de actividades (completion-engine)...');
  await markComplete({
    userId: student.id,
    activityType: 'page',
    activityId: 'dummy-page-id',
    courseId: course.id,
  });
  const completed = await isCompleted(student.id, 'page', 'dummy-page-id');
  if (!completed) throw new Error('Fallo al marcar actividad como completada');
  const progress = await countCompleted(student.id, course.id);
  console.log(`   - Progreso del curso: ${progress.completed}/${progress.total} actividades`);
  console.log('   ✅ Completion Engine validado correctamente.');

  // 5. Probar Restriction Engine
  console.log('\n5️⃣ Probando motor de restricciones de acceso (restriction-engine)...');
  const accessibleNow = await canAccess(student.id, {
    op: 'and',
    conditions: [
      { type: 'completion', activityType: 'page', activityId: 'dummy-page-id' },
      { type: 'date', after: new Date(Date.now() - 10000).toISOString() },
    ],
  });
  if (!accessibleNow.allowed) throw new Error('Fallo en evaluación de restricción cumplida');

  const blockedFuture = await canAccess(student.id, {
    op: 'and',
    conditions: [
      { type: 'date', after: new Date(Date.now() + 1000000).toISOString() },
    ],
  });
  if (blockedFuture.allowed) throw new Error('Fallo en evaluación de restricción futura');
  console.log('   ✅ Restriction Engine validado correctamente.');

  // 6. Probar Dispatcher de Notificaciones
  console.log('\n6️⃣ Probando dispatcher de notificaciones...');
  await notify({
    userId: student.id,
    type: 'system_test',
    title: 'Notificación de prueba Fase 6',
    body: 'Todo el sistema está verificado',
    link: '/dashboard',
  });
  await notifyMany([teacher.id, student.id], {
    type: 'broadcast_test',
    title: 'Notificación masiva',
  });
  const unreadCount = await prisma.notification.count({ where: { userId: student.id, type: 'system_test' } });
  if (unreadCount === 0) throw new Error('Fallo en persistencia de notificaciones');
  console.log('   ✅ Dispatcher de notificaciones validado correctamente.');

  // 7. Probar API Tokens
  console.log('\n7️⃣ Probando generación y estructura de tokens API...');
  const tokenStr = generateApiToken();
  if (!tokenStr.startsWith('znv_') || tokenStr.length < 36) {
    throw new Error('Estructura de token inválida');
  }
  console.log(`   - Token generado: ${tokenStr.slice(0, 12)}...`);
  console.log('   ✅ API Tokens validado correctamente.');

  // 8. Probar Serializador de Respaldos
  console.log('\n8️⃣ Probando serialización de respaldos (backup-serializer)...');
  const backup = await serializeCourse(course.id);
  if (!backup.version || !backup.course || !backup.sections) {
    throw new Error('Fallo en serialización del curso');
  }
  console.log(`   - Respaldo generado versión: ${backup.version} con ${backup.sections.length} secciones`);
  console.log('   ✅ Backup Serializer validado correctamente.');

  // 9. Probar Audit Logging
  console.log('\n9️⃣ Probando registro de auditoría (audit-log)...');
  await logAction({
    userId: teacher.id,
    action: 'phase6_verification',
    entity: 'system',
    entityId: 'zenvialms-core',
    details: { status: 'verified', timestamp: new Date().toISOString() },
  });
  const lastLog = await prisma.auditLog.findFirst({
    where: { action: 'phase6_verification' },
    orderBy: { createdAt: 'desc' },
  });
  if (!lastLog) throw new Error('Fallo en registro de auditoría');
  console.log('   ✅ Audit Logging validado correctamente.');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE LA FASE 6 PASARON CON ÉXITO (100% FUNCIONAL)!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
