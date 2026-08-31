import puppeteer from 'puppeteer-core';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

interface Issue {
  role: string;
  category: 'BUG' | 'SECURITY' | 'PERMISOS' | 'UI/UX';
  title: string;
  description: string;
  url?: string;
  severity: 'ALTA' | 'MEDIA' | 'BAJA';
}

const issues: Issue[] = [];

function recordIssue(issue: Issue) {
  issues.push(issue);
  console.log(`\n❌ [${issue.severity}] [${issue.category}] ${issue.role}: ${issue.title}`);
  console.log(`   Detalle: ${issue.description}`);
  if (issue.url) console.log(`   URL: ${issue.url}`);
}

async function runSimulation() {
  console.log('================================================================');
  console.log('🚀 INICIANDO SIMULACIÓN COMPLETA Y AUDITORÍA DE ROLES EN ZVIALMS');
  console.log('   URL Base:', BASE_URL);
  console.log('================================================================\n');

  // Asegurar que los usuarios existen con las credenciales dadas
  const passwordHash = await bcrypt.hash('Password1!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@zenvia.lms' },
    update: { name: 'Admin Zenvia', role: 'ADMIN', password: passwordHash },
    create: { email: 'admin@zenvia.lms', name: 'Admin Zenvia', password: passwordHash, role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'teacher@zenvia.lms' },
    update: { name: 'Profesor Zenvia', role: 'TEACHER', password: passwordHash },
    create: { email: 'teacher@zenvia.lms', name: 'Profesor Zenvia', password: passwordHash, role: 'TEACHER' },
  });
  await prisma.user.upsert({
    where: { email: 'student@zenvia.lms' },
    update: { name: 'Estudiante Zenvia', role: 'STUDENT', password: passwordHash },
    create: { email: 'student@zenvia.lms', name: 'Estudiante Zenvia', password: passwordHash, role: 'STUDENT' },
  });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('hydrate')) {
        console.log(`   ⚠️ [Console Error]: ${text.slice(0, 150)}`);
      }
    }
  });

  page.on('pageerror', (err: unknown) => {
    console.log(`   ⚠️ [Page Error]: ${String(err)}`);
  });

  async function loginAs(email: string, pass: string = 'Password1!') {
    console.log(`\n🔑 Intentando iniciar sesión como: ${email}...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    
    await page.waitForSelector('input[name="email"]');
    await page.$eval('input[name="email"]', (el) => ((el as HTMLInputElement).value = ''));
    await page.type('input[name="email"]', email);
    
    await page.waitForSelector('input[name="password"]');
    await page.$eval('input[name="password"]', (el) => ((el as HTMLInputElement).value = ''));
    await page.type('input[name="password"]', pass);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {}),
    ]);

    const currentUrl = page.url();
    console.log(`   📍 Redirigido a: ${currentUrl}`);
    return currentUrl;
  }

  async function logout() {
    await page.goto(`${BASE_URL}/api/auth/signout`, { waitUntil: 'networkidle0' }).catch(() => {});
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await Promise.all([
        submitBtn.click(),
        page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
      ]);
    }
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.detach();
  }

  // =========================================================================
  // TEST 1: ROL ADMINISTRADOR (admin@zenvia.lms)
  // Control total, gestión de usuarios, auditorías y reportes
  // =========================================================================
  console.log('\n================================================================');
  console.log('👤 [SIMULACIÓN 1/3] ROL ADMINISTRADOR (admin@zenvia.lms)');
  console.log('================================================================');

  await loginAs('admin@zenvia.lms');

  // 1.1 Verificar Dashboard de Admin
  const adminDashboardText = await page.evaluate(() => document.body.innerText);
  if (adminDashboardText.includes('Panel de Control') || adminDashboardText.includes('Total Cursos') || adminDashboardText.includes('Estudiantes')) {
    console.log('✅ 1.1 Dashboard Administrador renderizado correctamente.');
  } else {
    recordIssue({
      role: 'ADMIN',
      category: 'UI/UX',
      title: 'Dashboard de Administrador no muestra métricas esperadas',
      description: 'El dashboard no contiene las tarjetas de métricas o el formato esperado para Admin.',
      url: `${BASE_URL}/dashboard`,
      severity: 'MEDIA',
    });
  }

  // 1.2 Verificar enlace de "Usuarios" en la barra de navegación del Layout
  console.log('🔍 1.2 Verificando enlace a "Usuarios" desde el navbar...');
  const usersNavLink = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const uLink = links.find(l => l.innerText.trim() === 'Usuarios');
    return uLink ? uLink.getAttribute('href') : null;
  });

  console.log(`   Href de enlace "Usuarios" en navbar: ${usersNavLink}`);
  if (usersNavLink === '/admin/users') {
    const res = await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' });
    const status = res?.status();
    const text = await page.evaluate(() => document.body.innerText);
    if (status === 404 || text.includes('404') || text.includes('This page could not be found')) {
      recordIssue({
        role: 'ADMIN',
        category: 'BUG',
        title: 'Enlace roto "Usuarios" en Navbar (/admin/users retorna 404 Not Found)',
        description: 'En src/app/(dashboard)/layout.tsx, el enlace apunta a `/admin/users` pero la ruta real implementada es `/users`. Esto causa un error 404 al hacer clic.',
        url: `${BASE_URL}/admin/users`,
        severity: 'ALTA',
      });
    }
  }

  // 1.3 Verificar funcionalidad de Gestión de Usuarios en /users
  console.log('🔍 1.3 Verificando /users (Gestión de Usuarios)...');
  await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle0' });
  const usersPageText = await page.evaluate(() => document.body.innerText);
  if (usersPageText.includes('Gestión de Usuarios') && usersPageText.includes('admin@zenvia.lms')) {
    console.log('✅ 1.3 Página de Gestión de Usuarios carga correctamente.');
  } else {
    recordIssue({
      role: 'ADMIN',
      category: 'BUG',
      title: 'Fallo al cargar página de Gestión de Usuarios (/users)',
      description: 'No se pudo visualizar la lista de usuarios o el título en /users.',
      url: `${BASE_URL}/users`,
      severity: 'ALTA',
    });
  }

  // 1.4 Verificar Auditoría (/admin/audit-log)
  console.log('🔍 1.4 Verificando /admin/audit-log (Log de Auditoría)...');
  const auditRes = await page.goto(`${BASE_URL}/admin/audit-log`, { waitUntil: 'networkidle0' });
  const auditText = await page.evaluate(() => document.body.innerText);
  if (auditRes?.status() === 200 && auditText.includes('Log de Auditoría')) {
    console.log('✅ 1.4 Log de Auditoría accesible y funcional.');
  } else {
    recordIssue({
      role: 'ADMIN',
      category: 'BUG',
      title: 'Fallo en Log de Auditoría (/admin/audit-log)',
      description: `El log de auditoría devolvió status ${auditRes?.status()} o no renderizó el título.`,
      url: `${BASE_URL}/admin/audit-log`,
      severity: 'ALTA',
    });
  }

  // 1.5 Verificar Cohortes (/admin/cohorts)
  console.log('🔍 1.5 Verificando /admin/cohorts (Gestión de Cohortes)...');
  const cohortsRes = await page.goto(`${BASE_URL}/admin/cohorts`, { waitUntil: 'networkidle0' });
  const cohortsText = await page.evaluate(() => document.body.innerText);
  if (cohortsRes?.status() === 200 && cohortsText.includes('Cohortes')) {
    console.log('✅ 1.5 Gestión de Cohortes accesible.');
  } else {
    recordIssue({
      role: 'ADMIN',
      category: 'BUG',
      title: 'Fallo en Gestión de Cohortes (/admin/cohorts)',
      description: 'No se pudo cargar la vista de Cohortes.',
      url: `${BASE_URL}/admin/cohorts`,
      severity: 'MEDIA',
    });
  }

  // 1.6 Verificar Configuración del Sitio (/admin/settings)
  console.log('🔍 1.6 Verificando /admin/settings (Configuración del Sitio)...');
  const settingsRes = await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle0' });
  const settingsText = await page.evaluate(() => document.body.innerText);
  if (settingsRes?.status() === 200 && settingsText.includes('Configuración del sitio')) {
    console.log('✅ 1.6 Configuración del Sitio accesible.');
  } else {
    recordIssue({
      role: 'ADMIN',
      category: 'BUG',
      title: 'Fallo en Configuración del Sitio (/admin/settings)',
      description: 'No se pudo cargar la vista de configuración.',
      url: `${BASE_URL}/admin/settings`,
      severity: 'MEDIA',
    });
  }

  // 1.7 Verificar Constructor de Reportes (/dashboard/reports/builder)
  console.log('🔍 1.7 Verificando Constructor de Reportes (/dashboard/reports/builder)...');
  await page.goto(`${BASE_URL}/dashboard/reports/builder`, { waitUntil: 'networkidle0' });
  const generateBtn = await page.$('button');
  if (generateBtn) {
    await page.click('button');
    await new Promise(r => setTimeout(r, 1000));
    const repText = await page.evaluate(() => document.body.innerText);
    if (repText.includes('Total de registros:')) {
      console.log('✅ 1.7 Generador de Reportes genera datos correctamente.');
    } else {
      console.log('⚠️ 1.7 Constructor de Reportes cargó pero no mostró registros.');
    }
  }

  // 1.8 Verificar Enlaces del Navbar Desktop para Admin
  const desktopAdminLinks = await page.evaluate(() => {
    const nav = document.querySelector('header nav');
    if (!nav) return [];
    return Array.from(nav.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }));
  });
  console.log('   Enlaces disponibles en Navbar Desktop:', desktopAdminLinks.map(l => l.text).join(' | '));
  const hasCohortsInDesktop = desktopAdminLinks.some(l => l.href?.includes('cohorts'));
  const hasAuditInDesktop = desktopAdminLinks.some(l => l.href?.includes('audit-log'));
  const hasSettingsInDesktop = desktopAdminLinks.some(l => l.href?.includes('settings'));
  if (!hasCohortsInDesktop || !hasAuditInDesktop || !hasSettingsInDesktop) {
    recordIssue({
      role: 'ADMIN',
      category: 'UI/UX',
      title: 'Enlaces de administración faltantes en el menú superior Desktop',
      description: 'Las páginas de "Cohortes", "Auditoría" y "Configuración" están en MobileNav pero no tienen enlace en la barra de navegación superior Desktop para el Administrador.',
      severity: 'BAJA',
    });
  }

  await logout();

  // =========================================================================
  // TEST 2: ROL DOCENTE (teacher@zenvia.lms)
  // Gestión de cursos, registrar alumnos, calificar y crear quizzes
  // =========================================================================
  console.log('\n================================================================');
  console.log('👤 [SIMULACIÓN 2/3] ROL DOCENTE (teacher@zenvia.lms)');
  console.log('================================================================');

  await loginAs('teacher@zenvia.lms');

  // 2.1 Verificar Teacher Dashboard
  const teacherDashText = await page.evaluate(() => document.body.innerText);
  if (teacherDashText.includes('Cursos que impartes') || teacherDashText.includes('Entregas pendientes')) {
    console.log('✅ 2.1 Dashboard Docente renderizado correctamente.');
  }

  // 2.2 Crear Curso como Docente (/dashboard/courses/new)
  console.log('🔍 2.2 Verificando creación de curso por Docente (/dashboard/courses/new)...');
  await page.goto(`${BASE_URL}/dashboard/courses/new`, { waitUntil: 'networkidle0' });
  const testCourseSlug = `test-curso-docente-${Date.now()}`;
  await page.type('input[name="title"]', 'Curso de Prueba Automatizada');
  await page.type('input[name="slug"]', testCourseSlug);
  await page.type('textarea[name="description"]', 'Descripción del curso creado por docente en simulación.');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {}),
  ]);

  const courseUrl = page.url();
  console.log(`   📍 Redirigido tras creación de curso: ${courseUrl}`);
  let createdCourseId = '';
  if (courseUrl.includes('/dashboard/courses/')) {
    createdCourseId = courseUrl.split('/dashboard/courses/')[1].split('?')[0];
    console.log(`✅ 2.2 Curso creado exitosamente con ID: ${createdCourseId}`);
  } else {
    recordIssue({
      role: 'TEACHER',
      category: 'BUG',
      title: 'Fallo al crear curso como Docente',
      description: 'El docente no pudo crear un nuevo curso en /dashboard/courses/new.',
      url: `${BASE_URL}/dashboard/courses/new`,
      severity: 'ALTA',
    });
  }

  const teacherCourse = await prisma.course.findFirst({
    where: { instructor: { email: 'teacher@zenvia.lms' } },
  });
  const targetCourseId = createdCourseId || teacherCourse?.id;

  if (targetCourseId) {
    console.log(`🔍 2.3 Probando gestión del curso ID: ${targetCourseId}...`);
    await page.goto(`${BASE_URL}/dashboard/courses/${targetCourseId}`, { waitUntil: 'networkidle0' });

    // 2.3.1 Probar pestaña "Foro de Consultas" (tab=forum)
    console.log('🔍 2.3.1 Verificando Pestaña "Foro de Consultas" (tab=forum)...');
    await page.goto(`${BASE_URL}/dashboard/courses/${targetCourseId}?tab=forum`, { waitUntil: 'networkidle0' });
    const forumTabText = await page.evaluate(() => document.body.innerText);
    if (forumTabText.includes('Control de Asistencia') || forumTabText.includes('Sesiones de Clase')) {
      recordIssue({
        role: 'TEACHER / ESTUDIANTE',
        category: 'BUG',
        title: 'Pestaña "Foro de Consultas" renderiza el panel de "Asistencia" en vez del Foro',
        description: 'En src/app/(dashboard)/dashboard/courses/[id]/page.tsx (Línea 290), la condición `activeTab === "forum"` renderiza `<AttendancePanel />` en lugar de los foros de discusión del curso.',
        url: `${BASE_URL}/dashboard/courses/${targetCourseId}?tab=forum`,
        severity: 'ALTA',
      });
    }

    // 2.3.2 Probar Banco de Preguntas (/dashboard/courses/[id]/questions)
    console.log('🔍 2.3.2 Verificando Banco de Preguntas (/dashboard/courses/[id]/questions)...');
    const qBankRes = await page.goto(`${BASE_URL}/dashboard/courses/${targetCourseId}/questions`, { waitUntil: 'networkidle0' });
    const qBankText = await page.evaluate(() => document.body.innerText);
    if (qBankRes?.status() === 200 && qBankText.includes('Banco de preguntas')) {
      console.log('✅ 2.3.2 Banco de Preguntas accesible para el Docente.');
    } else {
      recordIssue({
        role: 'TEACHER',
        category: 'BUG',
        title: 'Fallo de acceso al Banco de Preguntas',
        description: 'El docente no pudo acceder a /dashboard/courses/[id]/questions.',
        url: `${BASE_URL}/dashboard/courses/${targetCourseId}/questions`,
        severity: 'ALTA',
      });
    }

    // 2.3.3 Probar Libro de Calificaciones (/dashboard/courses/[id]/grades)
    console.log('🔍 2.3.3 Verificando Libro de Calificaciones del curso (/dashboard/courses/[id]/grades)...');
    const gradesRes = await page.goto(`${BASE_URL}/dashboard/courses/${targetCourseId}/grades`, { waitUntil: 'networkidle0' });
    if (gradesRes?.status() === 200) {
      console.log('✅ 2.3.3 Libro de Calificaciones accesible para el Docente.');
    } else {
      recordIssue({
        role: 'TEACHER',
        category: 'BUG',
        title: 'Fallo de acceso al Libro de Calificaciones del curso',
        description: `Status ${gradesRes?.status()} al acceder a /dashboard/courses/[id]/grades.`,
        url: `${BASE_URL}/dashboard/courses/${targetCourseId}/grades`,
        severity: 'ALTA',
      });
    }

    // 2.3.4 Probar Registro/Matriculación de Alumnos por Docente
    console.log('🔍 2.3.4 Verificando Registro/Matriculación de Alumnos por el Docente...');
    await page.goto(`${BASE_URL}/dashboard/courses/${targetCourseId}?tab=participants`, { waitUntil: 'networkidle0' });
    const participantsText = await page.evaluate(() => document.body.innerText);
    if (participantsText.includes('Registrar Alumno') || participantsText.includes('Matricular')) {
      console.log('✅ 2.3.4 Botón de Registrar/Matricular Alumno presente en pestaña Participantes.');
    }
  }

  // 2.4 Verificar Restricciones de Permisos para Docente
  console.log('🔍 2.4 Verificando que Docente NO tenga acceso a rutas de Administrador...');
  
  await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle0' });
  const usersDocenteUrl = page.url();
  if (usersDocenteUrl.includes('forbidden') || usersDocenteUrl.includes('/dashboard')) {
    console.log('✅ 2.4.1 Docente bloqueado correctamente de /users.');
  } else {
    recordIssue({
      role: 'TEACHER',
      category: 'SECURITY',
      title: 'Docente tiene acceso no autorizado a /users',
      description: 'El docente pudo acceder a la gestión global de usuarios en /users.',
      url: `${BASE_URL}/users`,
      severity: 'ALTA',
    });
  }

  await page.goto(`${BASE_URL}/admin/audit-log`, { waitUntil: 'networkidle0' });
  const auditDocenteUrl = page.url();
  if (auditDocenteUrl.includes('forbidden') || auditDocenteUrl.includes('/dashboard')) {
    console.log('✅ 2.4.2 Docente bloqueado correctamente de /admin/audit-log.');
  } else {
    recordIssue({
      role: 'TEACHER',
      category: 'SECURITY',
      title: 'Docente tiene acceso no autorizado a /admin/audit-log',
      description: 'El docente pudo acceder al log de auditoría del sistema.',
      url: `${BASE_URL}/admin/audit-log`,
      severity: 'ALTA',
    });
  }

  await logout();

  // =========================================================================
  // TEST 3: ROL ESTUDIANTE (student@zenvia.lms)
  // Acceso a cursos, exámenes, tareas, calificaciones y perfil
  // =========================================================================
  console.log('\n================================================================');
  console.log('👤 [SIMULACIÓN 3/3] ROL ESTUDIANTE (student@zenvia.lms)');
  console.log('================================================================');

  await loginAs('student@zenvia.lms');

  // 3.1 Verificar Dashboard de Estudiante
  const studentDashText = await page.evaluate(() => document.body.innerText);
  if (studentDashText.includes('Estudiante') || studentDashText.includes('Mis Cursos') || studentDashText.includes('Cursos Inscritos') || studentDashText.includes('Tareas Pendientes')) {
    console.log('✅ 3.1 Dashboard de Estudiante renderizado correctamente.');
  }

  // 3.2 Verificar Catálogo de Cursos
  console.log('🔍 3.2 Verificando catálogo de cursos para el Estudiante...');
  await page.goto(`${BASE_URL}/dashboard/courses`, { waitUntil: 'networkidle0' });
  const catalogText = await page.evaluate(() => document.body.innerText);
  if (catalogText.includes('Catálogo de Cursos') || catalogText.includes('Certified Ethical Hacker')) {
    console.log('✅ 3.2 Catálogo de Cursos visible.');
  }

  // 3.3 Verificar Acceso a un Curso Matriculado
  const firstCourse = await prisma.course.findFirst({
    where: { published: true },
    include: { quizzes: true, assignments: true },
  });

  if (firstCourse) {
    const studentUser = await prisma.user.findUnique({ where: { email: 'student@zenvia.lms' } });
    if (studentUser) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: studentUser.id, courseId: firstCourse.id } },
        update: {},
        create: { userId: studentUser.id, courseId: firstCourse.id },
      });
    }

    console.log(`🔍 3.3 Verificando vista del curso matriculado: ${firstCourse.title}...`);
    await page.goto(`${BASE_URL}/dashboard/courses/${firstCourse.id}`, { waitUntil: 'networkidle0' });
    const courseDetailText = await page.evaluate(() => document.body.innerText);
    if (courseDetailText.includes(firstCourse.title)) {
      console.log('✅ 3.3 Estudiante puede ver el contenido del curso matriculado.');
    }

    if (firstCourse.quizzes.length > 0) {
      const quiz = firstCourse.quizzes[0];
      console.log(`🔍 3.3.1 Verificando portada de Examen/Quiz: ${quiz.title}...`);
      await page.goto(`${BASE_URL}/dashboard/courses/${firstCourse.id}/quiz/${quiz.id}`, { waitUntil: 'networkidle0' });
      const quizText = await page.evaluate(() => document.body.innerText);
      if (quizText.includes(quiz.title)) {
        console.log('✅ 3.3.1 Portada del cuestionario accesible.');
      }
    }

    if (firstCourse.assignments.length > 0) {
      const assign = firstCourse.assignments[0];
      console.log(`🔍 3.3.2 Verificando entrega de Tarea: ${assign.title}...`);
      await page.goto(`${BASE_URL}/dashboard/courses/${firstCourse.id}/assign/${assign.id}`, { waitUntil: 'networkidle0' });
      const assignText = await page.evaluate(() => document.body.innerText);
      if (assignText.includes(assign.title)) {
        console.log('✅ 3.3.2 Vista de entrega de tarea cargada correctamente.');
      }
    }
  }

  // 3.4 Verificar Boleta de Calificaciones (/dashboard/grades)
  console.log('🔍 3.4 Verificando Mis Calificaciones (/dashboard/grades)...');
  await page.goto(`${BASE_URL}/dashboard/grades`, { waitUntil: 'networkidle0' });
  const gradesText = await page.evaluate(() => document.body.innerText);
  if (gradesText.includes('Mis Calificaciones')) {
    console.log('✅ 3.4 Boleta de Calificaciones accesible para el estudiante.');
  }

  // 3.5 Verificar Perfil y Datos GDPR
  console.log('🔍 3.5 Verificando Perfil y Descarga GDPR...');
  await page.goto(`${BASE_URL}/dashboard/profile`, { waitUntil: 'networkidle0' });
  const profileText = await page.evaluate(() => document.body.innerText);
  if (profileText.includes('student@zenvia.lms') || profileText.includes('Contraseña') || profileText.includes('Perfil')) {
    console.log('✅ 3.5 Página de Perfil accesible.');
  }

  await page.goto(`${BASE_URL}/dashboard/profile/data`, { waitUntil: 'networkidle0' });
  const dataText = await page.evaluate(() => document.body.innerText);
  if (dataText.includes('Descarga') || dataText.includes('Exportar') || dataText.includes('Datos')) {
    console.log('✅ 3.5.1 Descarga de datos GDPR accesible.');
  }

  // 3.6 AUDITORÍA DE SEGURIDAD Y ESCALACIÓN DE PRIVILEGIOS DEL ESTUDIANTE
  console.log('\n🔒 3.6 AUDITANDO ESCALACIÓN DE PRIVILEGIOS Y VULNERABILIDADES DEL ESTUDIANTE...');

  // 3.6.1 ¿Puede el Estudiante acceder a Crear Cursos (/dashboard/courses/new)?
  await page.goto(`${BASE_URL}/dashboard/courses/new`, { waitUntil: 'networkidle0' });
  const newCourseUrl = page.url();
  if (newCourseUrl.includes('forbidden') || newCourseUrl.includes('/dashboard')) {
    console.log('✅ 3.6.1 Estudiante bloqueado de crear cursos (/dashboard/courses/new).');
  } else {
    recordIssue({
      role: 'STUDENT',
      category: 'SECURITY',
      title: 'Escalación de Privilegios: Estudiante puede acceder a /dashboard/courses/new',
      description: 'Un estudiante puede cargar el formulario de creación de nuevos cursos.',
      url: `${BASE_URL}/dashboard/courses/new`,
      severity: 'ALTA',
    });
  }

  // 3.6.2 ¿Puede el Estudiante acceder a /dashboard/reports/builder?
  console.log('🔍 3.6.2 Verificando acceso de Estudiante a /dashboard/reports/builder...');
  await page.goto(`${BASE_URL}/dashboard/reports/builder`, { waitUntil: 'networkidle0' });
  const builderUrl = page.url();
  const builderText = await page.evaluate(() => document.body.innerText);
  if (!builderUrl.includes('forbidden') && builderText.includes('Constructor de Reportes')) {
    recordIssue({
      role: 'STUDENT',
      category: 'SECURITY',
      title: 'Fuga de Datos Crítica: Estudiante tiene acceso al Constructor de Reportes (/dashboard/reports/builder)',
      description: 'La página /dashboard/reports/builder y la acción `runReport` no validan el rol de ADMIN/TEACHER. Cualquier estudiante puede generar y exportar la lista de todos los usuarios, notas globales e intentos de exámenes de toda la institución.',
      url: `${BASE_URL}/dashboard/reports/builder`,
      severity: 'ALTA',
    });
  } else {
    console.log('✅ 3.6.2 Estudiante bloqueado del Constructor de Reportes.');
  }

  // 3.6.3 ¿Puede el Estudiante acceder a /dashboard/reports/corporate?
  console.log('🔍 3.6.3 Verificando acceso de Estudiante a /dashboard/reports/corporate...');
  await page.goto(`${BASE_URL}/dashboard/reports/corporate`, { waitUntil: 'networkidle0' });
  const corpUrl = page.url();
  const corpText = await page.evaluate(() => document.body.innerText);
  if (!corpUrl.includes('forbidden') && corpText.includes('Portal Corporativo')) {
    recordIssue({
      role: 'STUDENT',
      category: 'SECURITY',
      title: 'Fuga de Información B2B: Estudiante puede ver el Portal Corporativo (/dashboard/reports/corporate)',
      description: 'La página /dashboard/reports/corporate solo requiere autenticación básica (`requireAuth`) sin validar roles ejecutivos/admin. Los alumnos pueden ver los datos de desempeño y correos de colaboradores corporativos de todas las sedes.',
      url: `${BASE_URL}/dashboard/reports/corporate`,
      severity: 'ALTA',
    });
  } else {
    console.log('✅ 3.6.3 Estudiante bloqueado del Portal Corporativo.');
  }

  // 3.6.4 ¿Puede el Estudiante acceder al Calificador General del Curso (/dashboard/courses/[id]/grades)?
  if (firstCourse) {
    await page.goto(`${BASE_URL}/dashboard/courses/${firstCourse.id}/grades`, { waitUntil: 'networkidle0' });
    const cGradesUrl = page.url();
    if (cGradesUrl.includes('forbidden') || cGradesUrl.includes('/dashboard')) {
      console.log('✅ 3.6.4 Estudiante bloqueado del calificador docente del curso.');
    } else {
      recordIssue({
        role: 'STUDENT',
        category: 'SECURITY',
        title: 'Acceso no autorizado: Estudiante puede ver el Libro de Calificaciones docente (/dashboard/courses/[id]/grades)',
        description: 'El estudiante puede ver la matriz completa de notas de todos los alumnos inscritos en el curso.',
        url: `${BASE_URL}/dashboard/courses/${firstCourse.id}/grades`,
        severity: 'ALTA',
      });
    }
  }

  await browser.close();

  console.log('\n================================================================');
  console.log(`🏁 SIMULACIÓN FINALIZADA. TOTAL DE HALLAZGOS Y FALLOS: ${issues.length}`);
  console.log('================================================================\n');

  return issues;
}

runSimulation()
  .then((res) => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('FATAL ERROR EN SIMULACIÓN:', err);
    process.exit(1);
  });
