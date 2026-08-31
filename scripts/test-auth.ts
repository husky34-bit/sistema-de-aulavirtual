// Test E2E de la Fase 1 — ZenviaLMS
// Uso:
//   npx tsx scripts/test-auth.ts
// Requiere `npm run dev` corriendo en el puerto indicado.

import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:7415@localhost:5432/zenvialms";

function cookieJar() {
  const map = new Map();
  return {
    set(setCookie: string | string[] | null) {
      if (!setCookie) return;
      // undici concatena los múltiples Set-Cookie con ", ", lo que parece
      // parte de un atributo (p.ej. Expires=Wed, 09 Sep 2026). Split usando
      // lookahead de "<name>=" tras la coma (con posible espacio) para
      // separar cookies individuales.
      const parts = (Array.isArray(setCookie) ? setCookie.join(", ") : setCookie)
        .split(/,(?=\s*[\w!#$%&'*+.^`|~-]+=)/);
      for (const line of parts) {
        const [kv] = line.split(";");
        const idx = kv.indexOf("=");
        if (idx > 0) {
          map.set(kv.slice(0, idx).trim(), kv.slice(idx + 1).trim());
        }
      }
    },
    header() {
      return Array.from(map.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    },
  };
}

async function req(path: string, opts: RequestInit = {}, jar: ReturnType<typeof cookieJar>, followRedirects = false) {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> ?? {}) };
  if (jar) {
    const c = jar.header();
    if (c) headers.Cookie = c;
  }
  // Si la URL ya es absoluta, úsala directo (puede venir desde NEXTAUTH_URL en otro host/puerto).
  const url = /^https?:\/\//.test(path) ? path : BASE + path;
  const res = await fetch(url, {
    ...opts,
    headers,
    redirect: followRedirects ? "follow" : "manual",
  });
  if (jar) {
    jar.set(res.headers.get("set-cookie"));
  }
  return res;
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("  X " + msg);
    process.exitCode = 1;
  } else {
    console.log("  + " + msg);
  }
}

async function main() {
  console.log("→ Sembrando usuario de prueba via Prisma");
  const adapter = new PrismaPg(DATABASE_URL);
  const prisma = new PrismaClient({ adapter });
  const email = `test+${Date.now()}@zenvia.lms`;
  const passwordRaw = "Password1!";
  const password = await bcrypt.hash(passwordRaw, 10);
  await prisma.user.deleteMany({ where: { email } }).catch(() => {});
  const user = await prisma.user.create({
    data: { name: "Usuario Test", email, password, role: "STUDENT" },
  });
  console.log(`  creado: ${user.email} (id ${user.id})`);
  await prisma.$disconnect();

  console.log("\n→ GET / (home, publica)");
  const jar = cookieJar();
  let r = await req("/", {}, jar);
  assert(r.status === 200, `/ devolvio 200 (fue ${r.status})`);

  console.log("\n→ GET /dashboard SIN sesion -> debe redirigir a /login");
  r = await req("/dashboard", {}, jar);
  const loc1 = r.headers.get("location") ?? "";
  assert(r.status >= 300 && r.status < 400, `redirige 3xx (fue ${r.status})`);
  assert(loc1.startsWith("/login"), `Location a /login (fue ${loc1})`);

  console.log("\n→ GET /dashboard/courses SIN sesion -> debe redirigir a /login");
  r = await req("/dashboard/courses", {}, jar);
  const loc2 = r.headers.get("location") ?? "";
  assert(r.status >= 300 && r.status < 400, `redirige 3xx (fue ${r.status})`);
  assert(loc2.startsWith("/login"), `Location a /login (fue ${loc2})`);

  console.log("\n→ GET /login y /register (publicas) -> 200");
  r = await req("/login", {}, jar);
  assert(r.status === 200, `/login devolvio 200 (fue ${r.status})`);
  r = await req("/register", {}, jar);
  assert(r.status === 200, `/register devolvio 200 (fue ${r.status})`);

  console.log("\n→ /api/auth/csrf + login real siguiendo redirects manualmente");
  r = await req("/api/auth/csrf", {}, jar);
  const csrf = (await r.json()).csrfToken;
  // Auth.js responde 302 con set-cookie que contiene authjs.session-token.
  // Seguir redirects manualmente (NO usar redirect:"follow") para que el jar
  // capture los set-cookie intermedios (undici no los expone en "follow").
  r = await req("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      email,
      password: passwordRaw,
      csrfToken: csrf,
      callbackUrl: "/dashboard",
    }).toString(),
  }, jar, false);
  let loginLoc = r.headers.get("location") ?? "";
  assert(r.status === 302, `callback/credentials 302 (fue ${r.status})`);
  assert(!loginLoc.includes("error="), `login sin error (fue ${loginLoc})`);

  // Sigue los redirects manualmente (5 hops max) actualizando cookies en cada salto
  let steps = 0;
  while (loginLoc && steps < 8) {
    r = await req(loginLoc, {}, jar, false);
    loginLoc = r.headers.get("location") ?? "";
    steps++;
    if (r.status < 300 || r.status >= 400) break;
  }
  assert(r.status === 200, `destino final tras login 200 (fue ${r.status})`);
  const hasSession = jar.header().includes("authjs.session-token");
  assert(hasSession, "cookie authjs.session-token presente tras login");

  console.log("\n→ GET /dashboard CON sesion -> 200");
  r = await req("/dashboard", {}, jar);
  assert(r.status === 200, `/dashboard con sesion 200 (fue ${r.status})`);
  const body = await r.text();
  assert(body.includes("Usuario Test"), `dashboard muestra el nombre del usuario`);
  assert(body.includes("Mis cursos"), `dashboard muestra seccion "Mis cursos"`);

  console.log("\n→ GET /login CON sesion -> redirige a /dashboard");
  r = await req("/login", {}, jar);
  const loc3 = r.headers.get("location") ?? "";
  assert(r.status >= 300 && r.status < 400, `redirige 3xx (fue ${r.status})`);
  assert(loc3.startsWith("/dashboard"), `Location a /dashboard (fue ${loc3})`);

  console.log("\n→ POST /api/auth/signout -> logout");
  r = await req("/api/auth/csrf", {}, jar);
  const csrf2 = (await r.json()).csrfToken;
  r = await req("/api/auth/signout", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: csrf2, callbackUrl: "/login" }).toString(),
  }, jar, false);
  let outLoc = r.headers.get("location") ?? "";
  assert(r.status === 302, `signout 302 (fue ${r.status})`);
  let outSteps = 0;
  while (outLoc && outSteps < 8) {
    r = await req(outLoc, {}, jar, false);
    outLoc = r.headers.get("location") ?? "";
    outSteps++;
    if (r.status < 300 || r.status >= 400) break;
  }
  assert(r.status === 200, `destino final tras logout 200 (fue ${r.status})`);

  console.log("\n→ GET /dashboard DESPUES de logout -> redirige a /login");
  r = await req("/dashboard", {}, jar);
  assert(r.status >= 300 && r.status < 400, `redirige 3xx (fue ${r.status})`);

  console.log("\n--- Fin del flujo E2E ---");
}

main().catch((e) => {
  console.error("ERROR", e);
  process.exitCode = 1;
});
