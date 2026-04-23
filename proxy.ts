import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicPrefixes = ['/review', '/loading', '/wrap', '/privacy', '/test']
const protectedPrefixes = ['/create-trip', '/trip', '/trips', '/achievements', '/settings']
const adminPrefixes = ['/admin']
const authRoutes = ['/login', '/signup']

function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

function isPublicRoute(path: string): boolean {
  const normalized = normalizePath(path)
  return publicPrefixes.some(p => normalized === p || normalized.startsWith(`${p}/`))
}

function isProtectedRoute(path: string): boolean {
  const normalized = normalizePath(path)
  return protectedPrefixes.some(p => normalized === p || normalized.startsWith(`${p}/`))
}

function isAdminRoute(path: string): boolean {
  const normalized = normalizePath(path)
  return adminPrefixes.some(p => normalized === p || normalized.startsWith(`${p}/`))
}

function isAuthRoute(path: string): boolean {
  const normalized = normalizePath(path)
  return authRoutes.includes(normalized)
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response to attach cookies to
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get session - this will refresh the session if needed
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Proxy auth error:', error)
  }
  
  const isAuthenticated = !!session

  // 1. Public routes - always allow
  if (isPublicRoute(pathname)) {
    return response
  }

  // 2. Root path - always show landing page
  if (pathname === '/') {
    return response
  }
  
  // 2b. Dashboard route - redirect admin to /admin
  if (pathname === '/dashboard') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user is admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    
    const isAdmin = profileData?.role === 'admin'
    
    // If admin tries to access /dashboard, redirect to /admin
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    return response
  }

  // 3. Admin routes - require authentication + admin role
  if (isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user is admin from profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    
    const isAdmin = profileData?.role === 'admin'
    
    if (!isAdmin) {
      // Not an admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // 4. Protected routes - require authentication
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // 5. Auth routes - redirect if already authenticated
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      // Check if user is admin from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
      
      const isAdmin = profileData?.role === 'admin'
      const redirectUrl = isAdmin ? '/admin' : '/dashboard'
      
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    return response
  }

  // 6. All other routes - allow
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)'],
};
