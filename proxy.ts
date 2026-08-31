import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

// Rutas protegidas: requieren sesión iniciada
const protectedPaths = ["/dashboard"];
// Rutas omniscientes: si ya hay sesión, redirige al dashboard
const authPaths = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthRoute = authPaths.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await auth();

  if (isProtected && !session?.user) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session?.user) {
    const url = new URL("/dashboard", req.nextUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Proxy corre en todo excepto assets estáticos, API de Auth.js y archivos especiales
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
