// src/lib/auth.ts
import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken, type AdminSession } from './session';

export function unauthorized() {
  return { success: false as const, error: 'Não autorizado. Faça login novamente.' };
}

// Server Actions são endpoints POST públicos: toda action protegida deve chamar isto
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

// Para Server Components que consultam o banco diretamente
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
