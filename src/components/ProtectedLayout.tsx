'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'employee' | 'client')[];
}

export default function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado y no está en una página de auth, redirigir al login
      if (!isAuthenticated && !pathname.startsWith('/auth') && pathname !== '/unauthorized') {
        router.push('/auth/login');
        return;
      }

      // Si está autenticado y está en una página de auth, redirigir al dashboard
      if (isAuthenticated && pathname.startsWith('/auth')) {
        router.push('/');
        return;
      }

      // Verificar roles permitidos
      if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, router, allowedRoles, pathname]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado y no está en una página de auth, no mostrar nada (está redirigiendo)
  if (!isAuthenticated && !pathname.startsWith('/auth') && pathname !== '/unauthorized') {
    return null;
  }

  // Si está autenticado y está en una página de auth, no mostrar nada (está redirigiendo)
  if (isAuthenticated && pathname.startsWith('/auth')) {
    return null;
  }

  // Verificar roles
  if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}