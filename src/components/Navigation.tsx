'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdDashboard, MdCalendarToday, MdPeople, MdContentCut, MdWork, MdHistory, MdSpa, MdLogout, MdPerson } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: MdDashboard },
    { href: '/calendario', label: 'Calendario', icon: MdCalendarToday },
    { href: '/citas', label: 'Citas', icon: MdCalendarToday },
    { href: '/clientes', label: 'Clientes', icon: MdPeople },
    { href: '/servicios', label: 'Servicios', icon: MdContentCut },
    { href: '/empleados', label: 'Personal', icon: MdWork },
    { href: '/historial', label: 'Historial', icon: MdHistory }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <MdSpa className="text-2xl" />
              <span className="text-xl font-bold text-gray-900">Beauty Salon</span>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="text-lg" />
                  <span>{item.label}</span>
                </Link>
              ))}
              

            </div>
          </div>

          <div className="flex items-center space-x-4">

            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <MdPerson className="text-lg text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || user.username}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        <div className="font-medium">{user.name || user.username}</div>
                        <div className="text-xs">{user.email}</div>
                        <div className="text-xs capitalize">{user.role}</div>
                      </div>
                    </div>
                    {isAuthenticated && user && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Cerrar Sesión"
                        >
                          <MdLogout className="text-lg" />
                          <span>Cerrar Sesión</span>
                        </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t pt-2 pb-3">
          <div className="grid grid-cols-3 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 p-2 rounded-md text-xs font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="text-lg" />
                <span>{item.label}</span>
              </Link>
            ))}



          </div>
        </div>
      </div>
    </nav>
  );
}