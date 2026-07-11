import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"],
};

export async function proxy(request: NextRequest) {
  const isAuthApi = request.nextUrl.pathname === "/api/auth/login";
  if (isAuthApi) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = await verifySessionToken(token);

  if (isValid) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
