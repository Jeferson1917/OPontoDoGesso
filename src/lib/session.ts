// src/lib/session.ts
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface AdminSession {
  role: 'ADMIN';
  email: string;
}

const MIN_SECRET_LENGTH = 32;
let secretKey: Uint8Array | null = null;

// Lido sob demanda para não quebrar o build quando a variável só existe em runtime
function getSecretKey(): Uint8Array {
  if (secretKey) return secretKey;

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET ausente ou com menos de ${MIN_SECRET_LENGTH} caracteres. ` +
        'Gere uma com: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"'
    );
  }

  secretKey = new TextEncoder().encode(secret);
  return secretKey;
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ role: 'ADMIN', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

// Retorna a sessão se o token for válido e de um admin; caso contrário, null
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const key = getSecretKey(); // Fora do try: configuração inválida deve falhar alto, não parecer "deslogado"

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    if (payload.role !== 'ADMIN' || typeof payload.email !== 'string') return null;
    return { role: 'ADMIN', email: payload.email };
  } catch {
    return null;
  }
}
