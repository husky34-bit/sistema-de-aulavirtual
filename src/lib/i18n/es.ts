export const es = {
  'common.appName': 'ZenviaLMS',
  'common.welcome': '¡Bienvenido!',
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.loading': 'Cargando...',
  'common.search': 'Buscar',
  'common.back': 'Volver',

  // Auth
  'auth.login': 'Iniciar Sesión',
  'auth.register': 'Crear Cuenta',
  'auth.email': 'Correo Electrónico',
  'auth.password': 'Contraseña',
  'auth.name': 'Nombre Completo',
  'auth.logout': 'Cerrar Sesión',

  // Dashboard
  'dashboard.title': 'Panel de Control',
  'dashboard.myCourses': 'Mis Cursos',
  'dashboard.exploreCourses': 'Explorar Cursos',
  'dashboard.myGrades': 'Mis Calificaciones',
  'dashboard.messages': 'Mensajes',
  'dashboard.calendar': 'Calendario',
  'dashboard.badges': 'Insignias',

  // Courses & Quiz
  'course.active': 'Activo',
  'course.enter': 'Entrar al aula',
  'quiz.startAttempt': 'Iniciar Intento',
  'quiz.timeRemaining': 'Tiempo restante',
  'quiz.finishAttempt': 'Terminar intento',
  'quiz.review': 'Revisión del intento',
} as const;

export type TranslationKey = keyof typeof es;
