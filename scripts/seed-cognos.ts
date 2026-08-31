import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando siembra de datos de Cognos Capacitación con Fase 7...');

  const passwordHash = await bcrypt.hash('Password1!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zenvia.lms' },
    update: { name: 'Admin Zenvia', role: 'ADMIN' },
    create: {
      email: 'admin@zenvia.lms',
      name: 'Admin Zenvia',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@zenvia.lms' },
    update: { name: 'Profesor Zenvia', role: 'TEACHER' },
    create: {
      email: 'teacher@zenvia.lms',
      name: 'Profesor Zenvia',
      password: passwordHash,
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@zenvia.lms' },
    update: { name: 'Estudiante Zenvia', role: 'STUDENT' },
    create: {
      email: 'student@zenvia.lms',
      name: 'Estudiante Zenvia',
      password: passwordHash,
      role: 'STUDENT',
    },
  });

  console.log('Usuarios verificados.');

  const cognosCourses = [
    {
      title: 'Certified Ethical Hacker (CEH v13 AI) - EC-Council',
      slug: 'ceh-v13-ai-ethical-hacker',
      description: 'Programa oficial con acreditación internacional EC-Council. Aprende técnicas avanzadas de pentesting, seguridad ofensiva y análisis de amenazas potenciado con IA.',
      area: 'ciberseguridad',
      level: 'avanzado',
      modality: 'live',
      liveUrl: 'https://cognos.zoom.us/j/ceh-v13-live',
      liveSchedule: 'Lunes a Viernes de 19:00 a 22:00 (GMT-4)',
      liveProvider: 'zoom',
      published: true,
      recordings: [
        {
          title: 'Sesión 1: Bienvenida, Arquitectura de Amenazas e IA Ofensiva',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
          sessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Sesión 2: Footprinting y Reconocimiento Pasivo con OSINT',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
          sessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
      attendanceSessions: [
        { title: 'Sesión 1 — Introducción al Pentesting', daysAgo: 3 },
        { title: 'Sesión 2 — Reconocimiento y Escaneo', daysAgo: 2 },
        { title: 'Sesión 3 — Análisis de Vulnerabilidades', daysAgo: 1 },
      ],
      sections: [
        {
          title: '1. Información del Curso & Acceso a Clases en Vivo',
          position: 0,
          label: '<strong>Modalidad:</strong> Virtual en Vivo • <strong>Horario:</strong> Lunes a Viernes 19:00 a 22:00 (GMT-4)<br/><strong>Enlace a Sala Zoom:</strong> <a href="https://zoom.us" target="_blank" class="text-[#026BCA] font-bold underline">https://cognos.zoom.us/j/ceh-v13-live</a>',
        },
        {
          title: '2. Módulo 1: Fundamentos de Ciberseguridad & Footprinting',
          position: 1,
          label: 'Recursos de estudio, manuales oficiales de laboratorio y grabaciones de clases anteriores.',
        },
        {
          title: '3. Módulo 2: Escaneo de Redes, Análisis de Vulnerabilidades y Exploitation',
          position: 2,
          label: 'Laboratorios prácticos en entornos controlados y máquinas virtuales.',
        },
        {
          title: '4. Evaluación Final & Certificación Cognos',
          position: 3,
          label: 'Cumple con el 80% de asistencia y un puntaje mínimo de 70/100 para obtener tu Certificado Oficial Cognos y voucher internacional.',
        },
      ],
    },
    {
      title: 'Revit BIM Fundamental - Autodesk ATC',
      slug: 'revit-bim-fundamental-autodesk',
      description: 'Capacitación oficial de Autodesk Authorized Training Center. Modelado arquitectónico 3D, gestión de parámetros BIM, planos y tablas de cuantificación.',
      area: 'bim',
      level: 'intermedio',
      modality: 'live',
      liveUrl: 'https://meet.google.com/cognos-bim-revit',
      liveSchedule: 'Martes y Jueves de 19:00 a 22:00 (GMT-4)',
      liveProvider: 'meet',
      published: true,
      recordings: [
        {
          title: 'Sesión 1: Entorno de Trabajo y Configuración de Plantillas BIM',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
          sessionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
      attendanceSessions: [
        { title: 'Sesión 1 — Interfaz y Modelado Básico', daysAgo: 4 },
        { title: 'Sesión 2 — Muros y Familias Paramétricas', daysAgo: 2 },
      ],
      sections: [
        {
          title: '1. Introducción al Entorno BIM y Configuración de Proyectos',
          position: 0,
          label: '<strong>Docente Certificado Autodesk:</strong> Ing. Carlos Canseco<br/><strong>Enlace de Clase en Vivo:</strong> <a href="https://meet.google.com" target="_blank" class="text-[#026BCA] font-bold underline">https://meet.google.com/cognos-bim-revit</a>',
        },
        {
          title: '2. Modelado de Elementos Constructivos (Muros, Suelos, Puertas y Ventanas)',
          position: 1,
          label: 'Guías de laboratorio paso a paso y familias paramétricas descargables.',
        },
        {
          title: '3. Documentación, Planimetría y Entrega de Proyecto',
          position: 2,
          label: 'Entrega tu modelo .RVT final para revisión y aprobación.',
        },
      ],
    },
    {
      title: 'Curso de Preparación para la Certificación PMP® - PMI',
      slug: 'preparacion-certificacion-pmp-pmi',
      description: 'Alineado a la Guía del PMBOK® 7ma Edición y el ECO vigente. Domina enfoques predictivos, ágiles e híbridos para liderar proyectos con éxito global.',
      area: 'pmp',
      level: 'avanzado',
      modality: 'live',
      liveUrl: 'https://cognos.zoom.us/j/pmp-prep-live',
      liveSchedule: 'Lunes y Miércoles de 19:00 a 22:00 (GMT-4)',
      liveProvider: 'zoom',
      published: true,
      recordings: [],
      attendanceSessions: [],
      sections: [
        {
          title: '1. Bienvenida & Estructura del Examen PMP',
          position: 0,
          label: '<strong>Horario de Clases:</strong> Martes y Jueves 19:00 a 22:00 • 35 Horas de Contacto acreditadas ante el PMI.',
        },
        {
          title: '2. Dominio Personas (Liderazgo y Gestión de Conflictos)',
          position: 1,
          label: 'Casos prácticos de estudio y dinámicas de grupo.',
        },
        {
          title: '3. Dominio Procesos & Entorno Empresarial',
          position: 2,
          label: 'Simuladores de preguntas situacionales tipo examen real.',
        },
      ],
    },
    {
      title: 'AWS Certified Solutions Architect - Associate',
      slug: 'aws-certified-solutions-architect',
      description: 'Diseño de arquitecturas seguras, resilientes, de alto rendimiento y optimizadas en costos en la nube de Amazon Web Services.',
      area: 'cloud',
      level: 'intermedio',
      modality: 'live',
      liveUrl: 'https://cognos.zoom.us/j/aws-architect-live',
      liveSchedule: 'Sábados de 08:30 a 13:30 (GMT-4)',
      liveProvider: 'zoom',
      published: true,
      recordings: [],
      attendanceSessions: [],
      sections: [
        {
          title: '1. Fundamentos de Nube AWS, IAM & Redes VPC',
          position: 0,
          label: 'Acceso a la consola de laboratorio AWS Academy y manuales de arquitectura.',
        },
        {
          title: '2. Cómputo (EC2, Lambda), Almacenamiento (S3) y Bases de Datos (RDS)',
          position: 1,
          label: 'Ejercicios prácticos de despliegue en alta disponibilidad.',
        },
        {
          title: '3. Examen Simulado de Certificación AWS',
          position: 2,
          label: 'Evaluación con temporizador y banco de preguntas de opción múltiple.',
        },
      ],
    },
    {
      title: 'Business Intelligence & Analytics con Power BI - Going to BI',
      slug: 'power-bi-business-intelligence-dax',
      description: 'Transforma datos en decisiones estratégicas. Domina Power Query, modelado estrella, lenguaje DAX avanzado y diseño de dashboards interactivos.',
      area: 'bi',
      level: 'basico',
      modality: 'live',
      liveUrl: 'https://cognos.zoom.us/j/powerbi-analytics-live',
      liveSchedule: 'Lunes a Viernes de 19:00 a 22:00 (GMT-4)',
      liveProvider: 'zoom',
      published: true,
      recordings: [],
      attendanceSessions: [],
      sections: [
        {
          title: '1. Extracción y Transformación con Power Query (ETL)',
          position: 0,
          label: 'Archivos .pbix de ejemplo y datasets empresariales para prácticas.',
        },
        {
          title: '2. Modelado de Datos Relacional y Medidas DAX',
          position: 1,
          label: 'Cálculo de KPIs de ventas, finanzas y series de tiempo.',
        },
        {
          title: '3. Visualización de Datos y Dashboards Ejecutivos',
          position: 2,
          label: 'Proyecto final: Dashboard Ejecutivo de Gerencia.',
        },
      ],
    },
  ];

  for (const cData of cognosCourses) {
    const existing = await prisma.course.findUnique({ where: { slug: cData.slug } });
    let course;
    if (!existing) {
      course = await prisma.course.create({
        data: {
          title: cData.title,
          slug: cData.slug,
          description: cData.description,
          area: cData.area,
          level: cData.level,
          modality: cData.modality,
          liveUrl: cData.liveUrl,
          liveSchedule: cData.liveSchedule,
          liveProvider: cData.liveProvider,
          published: true,
          instructorId: teacher.id,
          sections: {
            create: cData.sections.map((s) => ({
              title: s.title,
              position: s.position,
            })),
          },
        },
        include: { sections: true },
      });
      console.log('Curso creado:', course.title);
    } else {
      course = await prisma.course.update({
        where: { id: existing.id },
        data: {
          title: cData.title,
          description: cData.description,
          area: cData.area,
          level: cData.level,
          modality: cData.modality,
          liveUrl: cData.liveUrl,
          liveSchedule: cData.liveSchedule,
          liveProvider: cData.liveProvider,
          published: true,
        },
        include: { sections: true },
      });
      console.log('Curso actualizado:', course.title);
    }

    // Secciones y etiquetas
    for (let i = 0; i < cData.sections.length; i++) {
      const secDef = cData.sections[i];
      const secObj = course.sections.find((s) => s.position === secDef.position);
      if (secObj && secDef.label) {
        const existingLabel = await prisma.label.findFirst({
          where: { courseId: course.id, sectionId: secObj.id },
        });
        if (!existingLabel) {
          await prisma.label.create({
            data: {
              courseId: course.id,
              sectionId: secObj.id,
              content: secDef.label,
            },
          });
        }
      }
    }

    // Matrícula del estudiante
    if (['ceh-v13-ai-ethical-hacker', 'revit-bim-fundamental-autodesk', 'power-bi-business-intelligence-dax'].includes(cData.slug)) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: student.id, courseId: course.id } },
        update: {},
        create: {
          userId: student.id,
          courseId: course.id,
        },
      });
    }

    // Tareas
    const existingAssign = await prisma.assignment.findFirst({ where: { courseId: course.id } });
    if (!existingAssign) {
      await prisma.assignment.create({
        data: {
          courseId: course.id,
          title: 'Laboratorio Práctico 1: Aplicación y Desarrollo',
          description: 'Desarrolla las actividades propuestas en la guía y sube tu informe de trabajo.',
          instructions: 'Sube un archivo único o introduce tu resumen explicativo.',
          maxScore: 100,
          published: true,
          openAt: new Date(),
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Quizzes
    const existingQuiz = await prisma.quiz.findFirst({ where: { courseId: course.id } });
    if (!existingQuiz) {
      await prisma.quiz.create({
        data: {
          courseId: course.id,
          title: 'Examen de Diagnóstico & Evaluación Cognos',
          description: 'Cuestionario de comprobación de conocimientos. Tienes 20 minutos para responder.',
          timeLimitMin: 20,
          maxAttempts: 2,
          published: true,
        },
      });
    }

    // Grabaciones
    for (const rec of cData.recordings) {
      const existingRec = await prisma.classRecording.findFirst({
        where: { courseId: course.id, title: rec.title },
      });
      if (!existingRec) {
        await prisma.classRecording.create({
          data: {
            courseId: course.id,
            title: rec.title,
            videoUrl: rec.videoUrl,
            provider: rec.provider,
            sessionDate: rec.sessionDate,
            published: true,
          },
        });
      }
    }

    // Asistencia
    for (const att of cData.attendanceSessions) {
      const sessionDate = new Date(Date.now() - att.daysAgo * 24 * 60 * 60 * 1000);
      let session = await prisma.attendanceSession.findFirst({
        where: { courseId: course.id, title: att.title },
      });
      if (!session) {
        session = await prisma.attendanceSession.create({
          data: {
            courseId: course.id,
            title: att.title,
            date: sessionDate,
            durationMin: 180,
          },
        });
      }
      // Marcar presente al alumno de prueba
      await prisma.attendanceRecord.upsert({
        where: { sessionId_userId: { sessionId: session.id, userId: student.id } },
        update: { present: true },
        create: {
          sessionId: session.id,
          userId: student.id,
          present: true,
        },
      });
    }
  }

  // Certificado emitido para el estudiante de prueba
  const cehCourse = await prisma.course.findUnique({ where: { slug: 'ceh-v13-ai-ethical-hacker' } });
  if (cehCourse) {
    await prisma.issuedCertificate.upsert({
      where: { userId_courseId: { userId: student.id, courseId: cehCourse.id } },
      update: { gradeScore: 94 },
      create: {
        certCode: 'CGN-847291',
        userId: student.id,
        courseId: cehCourse.id,
        gradeScore: 94,
      },
    });
    console.log('Certificado oficial emitido: CGN-847291');
  }

  console.log('¡Siembra completada con éxito con grabaciones y asistencia!');
  await prisma.$disconnect();
}

main().catch(console.error);
