import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync session with localStorage when session changes
  useEffect(() => {
    if (isClient && session?.user) {
      localStorage.setItem('user', JSON.stringify(session.user));
      localStorage.setItem('token', session.accessToken || '');
    } else if (isClient && !session) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [session, isClient]);

  // Get user from localStorage as fallback if session is loading
  const getStoredUser = () => {
    if (!isClient) return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const storedUser = getStoredUser();
  const currentUser = session?.user || storedUser;

  return {
    user: currentUser,
    token: session?.accessToken || (isClient ? localStorage.getItem('token') : null),
    isLoading: status === 'loading',
    isAuthenticated: !!session || !!storedUser,
    role: currentUser?.role || null
  };
}