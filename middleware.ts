import { NextResponse, NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tirbeo.app';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // First-party apps share the .tirbeo.app cookie set by Accounts at login,
  // so a present session cookie is sufficient — no handoff token needed.
  if (request.cookies.has('__session')) {
    return NextResponse.next();
  }

  const host = request.headers.get('host') || '';
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const accountsHost = isLocalhost ? 'localhost:3001' : 'accounts.tirbeo.app';
  const protocol = isLocalhost ? 'http' : 'https';
  const dashUrl = `${protocol}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL(`${protocol}://${accountsHost}/login`);
  loginUrl.searchParams.set('redirect_to', dashUrl);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
