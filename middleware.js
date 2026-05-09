import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Public paths — always allow
  const publicPaths = ['/login', '/api/auth', '/api/setup-all', '/_next', '/favicon.ico']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Get JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Not logged in → send to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Student trying to access admin pages → send to dashboard
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    const dashUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashUrl)
  }

  // Admin trying to access student pages → send to admin
  if (!pathname.startsWith('/admin') && pathname !== '/' && token.role === 'admin') {
    // Allow admin to visit any page
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/setup-all).*)',
  ],
}
