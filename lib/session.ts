const SESSION_COOKIE = "cg_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 días

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no está configurado");
  return secret;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded);
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}

async function hmac(data: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
}

export async function createSessionToken(): Promise<string> {
  const expiry = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiry);
  const signature = toBase64Url(await hmac(payload));
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expiry = Number(payload);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const expectedSignature = toBase64Url(await hmac(payload));
  const expectedBytes = fromBase64Url(expectedSignature);
  const actualBytes = fromBase64Url(signature);
  if (expectedBytes.length !== actualBytes.length) return false;

  let diff = 0;
  for (let i = 0; i < expectedBytes.length; i++) {
    diff |= expectedBytes[i] ^ actualBytes[i];
  }
  return diff === 0;
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error("APP_PASSWORD no está configurado");

  const encoder = new TextEncoder();
  const a = encoder.encode(candidate);
  const b = encoder.encode(expected);
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
