// Diagnóstico: imprimir todos los set-cookie crudos del callback de login.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const BASE = process.env.BASE_URL ?? "http://localhost:3013";
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:7415@localhost:5432/zenvialms";

function cookieJar() {
  const map = new Map<string, string>();
  return {
    set(setCookie: string | string[] | null) {
      if (!setCookie) return;
      // undici concatena los múltiples Set-Cookie con ", " y eso puede parecer
      // parte de un atributo (Expires=Wed, 09 Sep 2026...). Split para separar
      // cookies individuales: usar lookahead de "<name>=" tras la coma.
      const raw = Array.isArray(setCookie) ? setCookie.join(", ") : setCookie;
      const parts = raw.split(/,(?=\s*[\w!#$%&'*+.^`|~-]+=)/);
      for (const line of parts) {
        const [kv] = line.split(";");
        const idx = kv.indexOf("=");
        if (idx > 0) map.set(kv.slice(0, idx).trim(), kv.slice(idx + 1).trim());
      }
    },
    header() {
      return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function req(path: string, opts: RequestInit = {}, jar: ReturnType<typeof cookieJar>, follow = false) {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> ?? {}) };
  if (jar) {
    const c = jar.header();
    if (c) headers.Cookie = c;
  }
  const url = /^https?:\/\//.test(path) ? path : BASE + path;
  const res = await fetch(url, { ...opts, headers, redirect: follow ? "follow" : "manual" });
  if (jar) jar.set(res.headers.get("set-cookie"));
  return res;
}

async function main() {
  const adapter = new PrismaPg(DATABASE_URL);
  const prisma = new PrismaClient({ adapter });
  const email = `diag+${Date.now()}@zenvia.lms`;
  const passwordRaw = "Password1!";
  const password = await bcrypt.hash(passwordRaw, 10);
  await prisma.user.create({ data: { name: "Diag", email, password, role: "STUDENT" } });
  await prisma.$disconnect();
  console.log("usuario:", email);

  const jar = cookieJar();

  // 1. GET /api/auth/csrf
  let r = await req("/api/auth/csrf", {}, jar);
  const csrf = (await r.json()).csrfToken;
  console.log("\n1) GET /api/auth/csrf");
  console.log("   status:", r.status);
  console.log("   set-cookie:", r.headers.get("set-cookie"));
  console.log("   csrf token:", csrf);

  // 2. POST /api/auth/callback/credentials (SIN seguir redirect)
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
  console.log("\n2) POST /api/auth/callback/credentials (redirect: manual)");
  console.log("   status:", r.status);
  console.log("   location:", r.headers.get("location"));
  console.log("   set-cookie:");
  const sc = r.headers.get("set-cookie");
  if (sc) {
    for (const line of sc.split(/,(?=\s*[a-zA-Z_-]+=)/)) {
      console.log("     -", line.trim());
    }
  } else {
    console.log("     (none!)");
  }
  console.log("   jartras callback:", jar.header());

  // 3. Si location va al dashboard, seguirlo y ver qué cookies se setean
  const loc = r.headers.get("location") ?? "";
  if (loc) {
    console.log("\n3) GET <location>");
    r = await req(loc, {}, jar, false);
    console.log("   status:", r.status);
    console.log("   location:", r.headers.get("location"));
    console.log("   set-cookie:");
    const sc2 = r.headers.get("set-cookie") ?? "(none)";
    for (const line of (Array.isArray(sc2) ? sc2 : [sc2])) console.log("     -", line);
    console.log("   jar tras hop 1:", jar.header());
  }
}

main().catch((e) => { console.error("ERROR", e); process.exit(1); });
