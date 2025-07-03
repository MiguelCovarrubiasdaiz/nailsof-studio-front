import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    token: session?.accessToken || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    role: session?.user?.role || null
  };
}