// src/lib/auth.ts
import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { SESSION_COOKIE, verifySessionToken, type AdminSession } from './session';

export function unauthorized() {
  return { success: false as const, error: 'Não autorizado. Faça login novamente.' };
}

// Server Actions são endpoints POST públicos: toda action protegida deve chamar isto.
// Além da assinatura, confere se o token não foi revogado por um logout.
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const revoked = await prisma.revokedSession.findUnique({ where: { jti: session.jti }, select: { jti: true } });
  return revoked ? null : session;
}

// Para Server Components que consultam o banco diretamente
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}

// Logout: o token deixa de valer no servidor, não só no navegador
export async function revokeSession(session: AdminSession): Promise<void> {
  await prisma.$transaction([
    prisma.revokedSession.upsert({
      where: { jti: session.jti },
      create: { jti: session.jti, expiresAt: session.expiresAt },
      update: {},
    }),
    // Faxina: revogações de tokens que já expiraram não servem mais para nada
    prisma.revokedSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);
}
