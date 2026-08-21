import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'chave_padrao_temporaria_32_caracteres_min'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apenas rotas /admin que NÃO sejam /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(sessionToken, SECRET_KEY);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Se já estiver logada e tentar acessar /admin/login, manda direto pro orçamento
  if (pathname === '/admin/login') {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (sessionToken) {
      try {
        await jwtVerify(sessionToken, SECRET_KEY);
        return NextResponse.redirect(new URL('/admin/orcamento', request.url));
      } catch {
        // Token inválido, deixa ir pro login normalmente
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};