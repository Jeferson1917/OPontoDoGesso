'use server';

import { createHash, timingSafeEqual } from 'crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from '../../lib/session';
import { clearLoginFailures, getLoginBlockMinutes, registerLoginFailure } from '../../lib/loginRateLimit';

// Compara via hash para ter tamanho fixo e tempo constante
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  return forwardedFor?.split(',')[0].trim() || headerStore.get('x-real-ip') || 'desconhecido';
}

export async function loginAdmin(formData: FormData) {
  const ip = await getClientIp();
  const blockMinutes = getLoginBlockMinutes(ip);
  if (blockMinutes > 0) {
    return { error: `Muitas tentativas. Tente novamente em ${blockMinutes} min.` };
  }

  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    console.error('ADMIN_EMAIL ou ADMIN_PASSWORD não configurados.');
    return { error: 'Login indisponível. Contate o administrador.' };
  }

  // Avalia os dois sempre, para não revelar pelo tempo qual campo errou
  const emailOk = safeEqual(email, validEmail);
  const passwordOk = safeEqual(password, validPassword);

  if (!emailOk || !passwordOk) {
    registerLoginFailure(ip);
    return { error: 'E-mail ou senha inválidos.' };
  }

  clearLoginFailures(ip);

  // Gera o token JWT com validade de 7 dias
  const token = await createSessionToken(validEmail);

  // Salva no cookie httpOnly seguro
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}
