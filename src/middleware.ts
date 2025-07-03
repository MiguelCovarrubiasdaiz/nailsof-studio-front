import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isPublicPage = req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/public')

    // Si está en página de auth y tiene token, redirigir al dashboard
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Si no tiene token y no está en página pública o auth, redirigir al login
    if (!token && !isAuthPage && !isPublicPage) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Validación de roles para rutas específicas
    if (token) {
      const role = token.role as string
      const pathname = req.nextUrl.pathname

      // Rutas solo para admin
      if (pathname.startsWith('/empleados') || pathname.startsWith('/admin')) {
        if (role !== 'admin') {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      }

      // Rutas para admin y employee
      if (pathname.startsWith('/citas') || pathname.startsWith('/servicios')) {
        if (role !== 'admin' && role !== 'employee') {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      }

      // Rutas para todos los roles autenticados
      if (pathname.startsWith('/clientes') || pathname.startsWith('/dashboard') || pathname.startsWith('/historial')) {
        // Permitir acceso a todos los roles autenticados
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a páginas públicas y de auth sin token
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
        const isPublicPage = req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/public')
        
        if (isAuthPage || isPublicPage) {
          return true
        }
        
        // Para todas las demás rutas, requerir token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}