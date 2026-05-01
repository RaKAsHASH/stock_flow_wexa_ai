import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/settings')
  );
}

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');

  if (!session && !isAuthPage && isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session) {
    try {
      await decrypt(session);
      if (isAuthPage) return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      const res = isAuthPage
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('session');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products',
    '/products/:path*',
    '/settings',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};
