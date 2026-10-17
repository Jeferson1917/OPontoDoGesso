// src/lib/session.ts
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface AdminSession {
  role: 'ADMIN';
  email: string;
  jti: string;      // Identificador do token (usado para revogar no logout)
  expiresAt: Date;
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

// "Impressão digital" da senha atual: trocar ADMIN_PASSWORD invalida todos os tokens já emitidos.
// Usa Web Crypto para funcionar tanto no proxy quanto no servidor.
async function passwordFingerprint(): Promise<string> {
  const data = new TextEncoder().encode(`${process.env.ADMIN_PASSWORD ?? ''}:${process.env.AUTH_SECRET ?? ''}`);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return Array.from(digest.slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ role: 'ADMIN', email, pv: await passwordFingerprint() })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(crypto.randomUUID())
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

// Retorna a sessão se o token for válido, de um admin e emitido com a senha atual; caso contrário, null.
// Não consulta revogações (isso exige o banco): veja getAdminSession em auth.ts.
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const key = getSecretKey(); // Fora do try: configuração inválida deve falhar alto, não parecer "deslogado"

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    if (payload.role !== 'ADMIN' || typeof payload.email !== 'string') return null;
    if (typeof payload.jti !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.pv !== (await passwordFingerprint())) return null;
    return { role: 'ADMIN', email: payload.email, jti: payload.jti, expiresAt: new Date(payload.exp * 1000) };
  } catch {
    return null;
  }
}
