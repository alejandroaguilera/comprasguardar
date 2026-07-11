import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE, verifyPassword } from "@/lib/session";
import { isRateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Demasiados intentos, espera un minuto" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const valid = await verifyPassword(parsed.data.password);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
