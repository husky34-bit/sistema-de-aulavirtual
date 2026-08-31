* [ ] 

# 🎓 ZenviaLMS — Documentación Completa del Sistema (Fases 1 a 6)

> **ZenviaLMS** es una plataforma institucional de gestión de aprendizaje (*Learning Management System*) inspirada en Moodle, desarrollada con una arquitectura moderna basada en **Next.js 16 (App Router)**, **React 19**, **Prisma ORM 7**, **PostgreSQL** y **TypeScript**.

---

## 📌 Índice General

1. [Resumen Ejecutivo &amp; Visión General](#1-resumen-ejecutivo--visión-general)
2. [Arquitectura &amp; Stack Tecnológico](#2-arquitectura--stack-tecnológico)
3. [Fase 1: Autenticación, Usuarios y Control de Acceso (RBAC)](#3-fase-1-autenticación-usuarios-y-control-de-acceso-rbac)
4. [Fase 2: Cursos, Secciones y Métodos de Matriculación](#4-fase-2-cursos-secciones-y-métodos-de-matriculación)
5. [Fase 3: Banco de Preguntas &amp; Motor de Evaluación](#5-fase-3-banco-de-preguntas--motor-de-evaluación)
6. [Fase 4: Cuestionarios y Exámenes Cronometrados](#6-fase-4-cuestionarios-y-exámenes-cronometrados)
7. [Fase 5: Tareas y Libro de Calificaciones (Gradebook)](#7-fase-5-tareas-y-libro-de-calificaciones-gradebook)
8. [Fase 6: Contenido, Interacción, Gestión e Integraciones](#8-fase-6-contenido-interacción-gestión-e-integraciones)
   - [Sub-fase 6A: Almacenamiento &amp; Recursos](#sub-fase-6a-almacenamiento-de-archivos--recursos-de-contenido)
   - [Sub-fase 6B: Foros, Mensajería &amp; Notificaciones](#sub-fase-6b-comunicación-e-interacción)
   - [Sub-fase 6C: Finalización, Restricciones, Insignias &amp; Reportes](#sub-fase-6c-gestión-académica-y-seguimiento)
   - [Sub-fase 6D: API REST, Respaldos &amp; Auditoría](#sub-fase-6d-integraciones-respaldos-y-privacidad)
9. [Diseño Visual &amp; Experiencia de Usuario (UI/UX)](#9-diseño-visual--experiencia-de-usuario-uiux)
10. [Control de Calidad, Pruebas y Métricas de Rendimiento](#10-control-de-calidad-pruebas-y-métricas-de-rendimiento)
11. [Guía de Despliegue y Accesos de Prueba](#11-guía-de-despliegue-y-accesos-de-prueba)

---

## 1. Resumen Ejecutivo & Visión General

ZenviaLMS fue concebido para resolver la rigidez de los LMS tradicionales heredados, ofreciendo:

- **Rendimiento instantáneo:** Renderizado híbrido (RSC + Client Components) y Turbopack.
- **Rigor pedagógico:** Mismas capacidades de evaluación, libro de calificaciones ponderado y restricciones condicionales de Moodle.
- **Diseño de primer nivel:** Interfaz moderna, accesible, con paleta institucional en **Azul Oscuro (Deep Navy)** y **Blanco**, tipografía optimizada y micro-interacciones.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                               ZenviaLMS                                 │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ │
│  │ Autenticación │ │    Cursos     │ │  Evaluación   │ │  Gradebook   │ │
│  │   (9 Roles)   │ │  Matrículas   │ │ (16 Preguntas)│ │ (7 Métodos)  │ │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └──────┬───────┘ │
│          │                 │                 │                │         │
│  ┌───────┴─────────────────┴─────────────────┴────────────────┴──────┐  │
│  │       Contenido, Interacción, Gestión & API REST (Fase 6)         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura & Stack Tecnológico

| Capa                            | Tecnología                      | Propósito                                                          |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------- |
| **Framework Web**         | Next.js 16.3.0 (Turbopack)       | App Router, Server Actions, Dynamic API Routes                      |
| **Biblioteca UI**         | React 19.2.8                     | Server Components, Hooks, Transitions (`useActionState`)          |
| **ORM & Base de Datos**   | Prisma ORM 7.9.1 + PostgreSQL    | Modelado tipado, relaciones cascade, adapters`@prisma/adapter-pg` |
| **Autenticación**        | Auth.js v5 (NextAuth beta 32)    | Sesiones JWT/Base de datos, adapter Prisma, hash bcrypt             |
| **Validación de Datos**  | Zod 4.4.3                        | Schemas estrictos en frontend, Server Actions y API REST            |
| **Estilos & UI**          | TailwindCSS v4 + CSS Vanilla     | Variables de diseño, scrollbars modernos, paleta Deep Navy & White |
| **Seguridad HTML**        | Isomorphic DOMPurify             | Sanitización estricta anti-XSS en contenidos ricos                 |
| **Ejecución TypeScript** | TSX + TypeScript 5 (Strict Mode) | Pruebas automatizadas y tipado riguroso sin`any`                  |

---

## 3. Fase 1: Autenticación, Usuarios y Control de Acceso (RBAC)

### Capacidades Principales:

- **Catálogo de 9 Roles Institucionales:**
  1. `ADMIN`: Control total del sistema y configuración.
  2. `MANAGER`: Gestión de cursos, docentes y cohortes.
  3. `TEACHER`: Creación de contenidos, exámenes, tareas y calificaciones.
  4. `NON_EDITING_TEACHER`: Calificación y moderación sin edición de estructura.
  5. `STUDENT`: Inscripción, resolución de cuestionarios y envíos de tareas.
  6. `GUEST`: Navegación limitada a cursos de acceso abierto.
  7. `PARENT`: Consulta de progreso de alumnos vinculados.
  8. `SUPPORT`: Soporte técnico institucional.
  9. `STAFF`: Personal administrativo.
- **Seguridad:** Encriptación de contraseñas con `bcryptjs`, protección contra fuerza bruta y expiración de sesiones.
- **Helpers de Autorización:**
  - `requireAuth()`: Garantiza sesión activa o redirige a `/login`.
  - `requireRole(['TEACHER', 'ADMIN'])`: Valida roles permitidos.
  - `hasRole(userRole, requiredRole)`: Jerarquía numérica de permisos.

---

## 4. Fase 2: Cursos, Secciones y Métodos de Matriculación

### Capacidades Principales:

- **Estructura Jerárquica:** Cursos categorizados con secciones ordenadas (`position: asc`).
- **3 Métodos de Matriculación:**
  1. **Auto-matriculación Abierta (`self`):** El alumno se inscribe con un clic.
  2. **Matriculación con Clave de Acceso (`key`):** Acceso protegido por contraseña específica del curso.
  3. **Matriculación Manual (`manual`):** Docentes o administradores asignan alumnos individualmente.
- **Gestión de Secciones en Tiempo Real:** Reordenamiento dinámico (subir/bajar posición), renombrado en línea y eliminación segura.

---

## 5. Fase 3: Banco de Preguntas & Motor de Evaluación

### Capacidades Principales:

- **16 Tipos de Preguntas Soportados:**
  1. Opción múltiple (respuesta única)
  2. Opción múltiple (respuesta múltiple con puntajes negativos)
  3. Verdadero / Falso
  4. Respuesta corta (con sensibilidad a mayúsculas opcional)
  5. Ensayo / Desarrollo
  6. Emparejamiento (*Matching*)
  7. Numérica (con tolerancia de error ±Δ)
  8. Rellenar espacios en blanco (*Fill in the Blanks*)
  9. Arrastrar y soltar texto (*Drag and Drop Text*)
  10. Arrastrar y soltar sobre imagen
  11. Marcadores sobre imagen
  12. Selección de palabras perdidas
  13. Pregunta calculada simple
  14. Pregunta calculada multivariable
  15. Pregunta de matriz / cuadrícula
  16. Descripción informativa
- **Versionado Inmutable:** Cada edición de una pregunta genera una nueva versión (`version: number`), asegurando que exámenes pasados nunca pierdan su contexto histórico ni su puntaje original.
- **Motor de Evaluación Determinista:** Función pura `evaluateQuestionResponse(type, response, correctData)` libre de efectos secundarios.

---

## 6. Fase 4: Cuestionarios y Exámenes Cronometrados

### Capacidades Principales:

- **Motor de Intentos:** Temporizador regresivo en cliente sincronizado con límite de tiempo en servidor.
- **Autosave Continuo:** Guardado automático en segundo plano por cada respuesta seleccionada para evitar pérdida de datos por desconexión.
- **Navegación Flexible:**
  - Modo libre (cuadrícula de preguntas con estado respondida/marcada).
  - Modo secuencial (avance forzado pregunta por pregunta).
- **Pantalla de Revisión Detallada:** Retroalimentación inmediata, desglose de respuestas correctas, cálculo de puntaje obtenido vs máximo y estado del intento.

---

## 7. Fase 5: Tareas y Libro de Calificaciones (Gradebook)

### Capacidades Principales:

- **Gestión de Tareas (`Assignment`):**
  - Fechas de apertura (`openAt`), entrega límite (`dueAt`) y corte estricto (`cutoffAt`).
  - Envíos en texto enriquecido en línea o archivos adjuntos (con límite de tamaño y tipo).
  - Sistema de extensiones individuales de plazo por estudiante.
- **Libro de Calificaciones en Cascada (`Gradebook`):**
  - **7 Métodos de Agregación:**
    1. Media ponderada simple (`mean`)
    2. Media ponderada por pesos (`weighted`)
    3. Mediana (`median`)
    4. Suma directa de puntos (`sum`)
    5. Calificación máxima (`max`)
    6. Calificación mínima (`min`)
    7. Moda estadística (`mode`)
  - **Protección de Overrides Manuales:** Si un docente sobrescribe manualmente una nota en el libro general, el sistema marca `overridden: true` e **impide que recálculos automáticos borren la decisión del profesor**.
  - **Escalas de Letras:** Conversión automática a letras cualitativas (A, B, C, D, F) configurables por curso.
  - **Exportación:** Reporte completo de calificaciones descargable en CSV compatible con Excel.

---

## 8. Fase 6: Contenido, Interacción, Gestión e Integraciones

La Fase 6 completó la visión integral del LMS incorporando 30 nuevos modelos en base de datos divididos en 4 sub-fases:

### Sub-fase 6A: Almacenamiento de Archivos & Recursos de Contenido

- **`LocalStorageDriver` con interfaz `StorageDriver`:** Manejo de archivos locales o en almacenamiento S3, con nombres sanitizados y UUIDs (`makeStorageKey`).
- **Control de Acceso por Contexto:** Endpoints `/api/files/upload` y `/api/files/[fileId]` que verifican matrícula e instructor antes de servir un recurso.
- **6 Tipos de Recursos:**
  1. `Resource`: Archivos descargables (PDF, documentos, multimedia).
  2. `ContentPage`: Páginas HTML con contenido sanitizado.
  3. `Book`: Libros digitales con índice interactivo y navegación por capítulos.
  4. `UrlResource`: Enlaces externos embebidos o directos.
  5. `Folder`: Carpetas agrupadoras de múltiples archivos.
  6. `Label`: Etiquetas visuales con HTML decorativo en las secciones del curso.
- **Sanitización Anti-XSS:** Filtro `isomorphic-dompurify` que elimina scripts maliciosos y permite iframes educativos seguros (YouTube, Vimeo).

### Sub-fase 6B: Comunicación e Interacción

- **Foros de Discusión:**
  - Hilos de respuestas recursivas anidadas ilimitadas.
  - Foros estándar, de tema único y modo **Q&A** (los alumnos no ven respuestas ajenas hasta publicar la suya).
  - Herramientas de moderación: fijar hilos (`pinned`), bloquear (`locked`) y ventana de edición de 30 minutos.
- **Mensajería Instantánea 1:1:** Conversaciones privadas entre docentes y alumnos con contador de mensajes no leídos en tiempo real.
- **Dispatcher Central de Notificaciones:** Sistema unificado `notify()` y `notifyMany()` que dispara alertas automáticas ante calificaciones, nuevos mensajes y tareas. Campana con contador en la barra de navegación.
- **Calendario Académico:** Vista mensual con cuadrícula CSS que auto-sincroniza fechas límites de cuestionarios y tareas.
- **Comentarios Reutilizables:** Componente modular `CommentSection` para cualquier actividad.

### Sub-fase 6C: Gestión Académica y Seguimiento

- **Motor de Finalización (`ActivityCompletion`):** Registro de completitud manual o automática con barra de progreso porcentual (`completed / total`).
- **Motor de Restricciones de Disponibilidad (`restriction-engine.ts`):** Reglas lógicas `AND/OR` que condicionan el acceso a una actividad según fecha (`date`), finalización de actividades previas (`completion`) o nota mínima (`grade`).
- **Sistema de Insignias (`Badges`):** Creación de medallas y otorgamiento automático al cumplir el 100% de actividades de un curso.
- **Cohortes y Grupos:**
  - Carga masiva de estudiantes mediante CSV con previsualización de errores.
  - Sincronización automática de cohortes con matrículas de cursos.
  - Generador de grupos aleatorios por número de integrantes o cantidad de equipos.
- **Reportes Académicos:** Overview general del curso, matriz de completitud por estudiante y reporte de participación exportables a CSV con codificación UTF-8 BOM.

### Sub-fase 6D: Integraciones, Respaldos y Privacidad

- **API REST Externa v1 (`/api/v1/`):**
  - Autenticación mediante tokens Bearer (`znv_` + 32 bytes hex).
  - 6 endpoints listos para integración institucional: `/courses`, `/courses/[id]`, `/users`, `/enrolments`, `/grades` y `/completion`.
- **Respaldos Portables (`backup-serializer.ts`):** Exportación de cursos completos a JSON (secciones, actividades, preguntas y versiones) y restauración inteligente con remapeo de identificadores (`id-remapper.ts`).
- **Privacidad y GDPR:** Exportación completa de datos personales descargables por el usuario.
- **Registro de Auditoría (`audit-log.ts`):** Historial inmutable de acciones sensibles (cambios de rol, overrides de notas, eliminaciones).

---

## 9. Fase 7: Maduración, Calidad, Refinamiento & Asistente de IA

La Fase 7 consolidó la calidad, seguridad, flexibilidad e inteligencia de la plataforma:

### Sub-fase 7A: Testing Automatizado con Vitest

- **6 suites con 36 pruebas unitarias:** `question-engine`, `grading-engine`, `aggregation-engine`, `attempt-engine`, `calculated-datasets` y `ai-provider`.
- **Protección Anti-Inyección:** Validación matemática estricta que bloquea la ejecución de código arbitrario en preguntas calculadas.

### Sub-fase 7B: Búsqueda Global, Etiquetas y Favoritos

- **Búsqueda Multi-Entidad:** Localización instantánea de cursos, páginas de estudio y foros en `/dashboard/search`.
- **Favoritos de Cursos:** Marcado rápido de cursos preferidos para acceso directo en el dashboard.

### Sub-fase 7C: Campos Personalizados y Constructor de Reportes

- **Constructor de Reportes (`report-builder.ts`):** Generación modular de reportes por fuentes (`users`, `enrollments`, `grades`, `quizzes`) en `/dashboard/reports/builder` y exportación a CSV.
- **Campos Dinámicos (`dynamic-field.tsx`):** Soporte para atributos extendidos (`text`, `textarea`, `date`, `select`, `checkbox`).

### Sub-fase 7D: UI Visual para Preguntas Complejas

- **Editor Cloze Visual (`cloze-editor.tsx`):** Asignación interactiva de opciones múltiples sobre huecos `[[1]]`, `[[2]]`.
- **Editor Drag & Drop sobre Imagen (`drag-drop-image-editor.tsx`):** Definición gráfica de zonas receptoras sobre imágenes para preguntas interactivas.

### Sub-fase 7E: Seguridad y Rendimiento

- **Cabeceras HTTP de Seguridad:** `X-Frame-Options`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
- **Limitador de Tasa (`rate-limiter.ts`):** Prevención de ataques de fuerza bruta en inicio de sesión (máximo 5 intentos por minuto).

### Sub-fase 7F: Internacionalización (i18n)

- **Diccionarios Tipados:** Soporte bilingüe Español/Inglés (`src/lib/i18n/es.ts`, `src/lib/i18n/en.ts`) y helper reactivo `t()`.

### Sub-fase 7G: Asistente de IA (Inspirado en el subsistema `ai/` de Moodle)

- **Placement 1 (`courseassist`):** Generación de preguntas para el banco validadas con schema Zod antes de guardarse como borradores (`[IA]`).
- **Placement 2 (`editor`):** Asistente de mejora de redacción y claridad pedagógica para docentes.

---

## 10. Diseño Visual & Experiencia de Usuario (UI/UX)

La interfaz fue construida siguiendo una estética **institucional, ejecutiva y moderna**:

### 🎨 Paleta de Colores:

- **Azul Noche Profundo (Canvas & Header):** `#070F1E` / `#0B172B`
- **Azul Real & Acentos Eléctricos:** `#2563EB` / `#3B82F6` / `#38BDF8` (Cyan)
- **Blanco Puro & Fondos de Tarjetas:** `#FFFFFF` sobre fondos suaves `#F8FAFC`
- **Bordes & Separadores:** `#E2E8F0` / `#1E293B`

### ✨ Aspectos Destacados de la UI:

- **Header Dark Navy:** Barra superior con logotipo 3D en gradiente, navegación horizontal y badge de rol distintivo.
- **Hero Dashboard:** Tarjeta superior con estadísticas clave (cursos inscritos, rol activo, estado).
- **Tarjetas de Actividades:** Iconografía moderna por tipo de recurso (📋 Cuestionario, 📝 Tarea, 📄 PDF, 📚 Libro, 💬 Foro).
- **Formularios Elegantes:** Inputs con anillos de foco azul suave (`ring-4 ring-blue-500/10`) y botones en gradiente interactivos.

---

## 11. Control de Calidad, Pruebas y Métricas de Rendimiento

El proyecto cuenta con un estándar de compilación y pruebas estrictas:

```
$ npx tsc --noEmit
✔ 0 errores de TypeScript

$ npm run lint
✔ 0 errores, 0 warnings (ESLint limpio)

$ npm test
✔ 36 tests pasados en 6 suites de Vitest (100%)

$ npx tsx scripts/test-phase7.ts
✔ Todas las validaciones de la Fase 7 pasaron exitosamente (100%)
```

$ npx tsx scripts/test-phase6.ts
1️⃣ Probando almacenamiento de archivos (file-storage)...
   ✅ File Storage (put, get, delete) validado correctamente.
2️⃣ Probando sanitización de contenido HTML (anti-XSS)...
   ✅ Sanitizador anti-XSS validado correctamente.
3️⃣ Verificando usuario y curso para pruebas de interacción y gestión...

- Curso: Curso de Matemáticas y Física
  4️⃣ Probando motor de finalización de actividades (completion-engine)...
- Progreso del curso: 1/5 actividades
  ✅ Completion Engine validado correctamente.
  5️⃣ Probando motor de restricciones de acceso (restriction-engine)...
  ✅ Restriction Engine validado correctamente.
  6️⃣ Probando dispatcher de notificaciones...
  ✅ Dispatcher de notificaciones validado correctamente.
  7️⃣ Probando generación y estructura de tokens API...
- Token generado: znv_0d2fdf8e...
  ✅ API Tokens validado correctamente.
  8️⃣ Probando serialización de respaldos (backup-serializer)...
- Respaldo generado versión: 1.0 con 1 secciones
  ✅ Backup Serializer validado correctamente.
  9️⃣ Probando registro de auditoría (audit-log)...
  ✅ Audit Logging validado correctamente.

🎉 ¡TODAS LAS PRUEBAS DE LA FASE 6 PASARON CON ÉXITO (100% FUNCIONAL)!

```

---

## 11. Guía de Despliegue y Accesos de Prueba

### Servidor Local:
- **URL Base:** [http://localhost:3015/](http://localhost:3015/)
- **Puerto:** `3015`

### Usuarios Preconfigurados:

| Rol | Correo Electrónico | Contraseña | Enlace Directo |
|---|---|---|---|
| **Docente (Profesor)** | `teacher@zenvia.lms` | `Password1!` | [Iniciar sesión](http://localhost:3015/login) |
| **Estudiante** | `student@zenvia.lms` | `Password1!` | [Iniciar sesión](http://localhost:3015/login) |

### Rutas Clave:
- **Catálogo de Cursos:** [http://localhost:3015/dashboard/courses](http://localhost:3015/dashboard/courses)
- **Curso de Matemáticas y Física:** [http://localhost:3015/dashboard/courses/cmt6sof2o00006gvqwhgqtkoq](http://localhost:3015/dashboard/courses/cmt6sof2o00006gvqwhgqtkoq)
- **Boleta de Calificaciones:** [http://localhost:3015/dashboard/grades](http://localhost:3015/dashboard/grades)
- **Bandeja de Mensajes:** [http://localhost:3015/dashboard/messages](http://localhost:3015/dashboard/messages)
- **Calendario Académico:** [http://localhost:3015/dashboard/calendar](http://localhost:3015/dashboard/calendar)
- **Galería de Insignias:** [http://localhost:3015/dashboard/badges](http://localhost:3015/dashboard/badges)
- **Gestión de Tokens API:** [http://localhost:3015/dashboard/settings/tokens](http://localhost:3015/dashboard/settings/tokens)

---

**© 2026 ZenviaLMS** — *Plataforma Educativa Institucional de Nueva Generación.*
```
