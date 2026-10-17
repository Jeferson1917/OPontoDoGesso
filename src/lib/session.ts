// src/lib/session.ts
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface AdminSession {
  role: 'ADMIN';
  email: string;
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'chave_padrao_temporaria_32_caracteres_min'
);

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ role: 'ADMIN', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

// Retorna a sessão se o token for válido e de um admin; caso contrário, null
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, { algorithms: ['HS256'] });
    if (payload.role !== 'ADMIN' || typeof payload.email !== 'string') return null;
    return { role: 'ADMIN', email: payload.email };
  } catch {
    return null;
  }
}
