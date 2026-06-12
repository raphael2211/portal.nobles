import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow next internals and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // Allow public routes
  if (pathname === '/' || pathname === '/login') return NextResponse.next()

  const session = req.cookies.get('nobles_token')?.value
  const isAdmin = pathname.startsWith('/admin')
  const isStaff = pathname.startsWith('/staff')

  // Protect admin and staff routes server-side
  if ((isAdmin || isStaff) && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*'],
}
