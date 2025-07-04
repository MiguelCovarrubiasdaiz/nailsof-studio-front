'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import { useAuth } from '@/hooks/useAuth';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Rutas que no necesitan navegación (auth pages)
  const authRoutes = ['/auth/login', '/auth/register', '/unauthorized'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Layout para páginas de autenticación (sin navegación)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Layout para páginas del admin (con navegación)
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}