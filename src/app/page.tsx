'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiCheckCircle, FiDollarSign, FiUsers, FiTrendingUp, FiClock, FiUser, FiPhone } from 'react-icons/fi';
import { appointmentService } from '@/services/appointmentService';
import { clientService } from '@/services/clientService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/serviceService';

interface DashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  weekRevenue: number;
  totalClients: number;
  totalEmployees: number;
  totalServices: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    weekAppointments: 0,
    weekRevenue: 0,
    totalClients: 0,
    totalEmployees: 0,
    totalServices: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Cargar datos en paralelo
      const [
        todayAppointmentsData,
        weekAppointmentsData,
        clientsData,
        employeesData,
        servicesData
      ] = await Promise.all([
        appointmentService.getAppointmentsByDate(today),
        appointmentService.getAppointments({
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0],
          limit: 1000
        }),
        clientService.getClients({ limit: 1000 }),
        employeeService.getEmployees({ limit: 1000, active: true }),
        serviceService.getServices({ limit: 1000, active: true })
      ]);

      // Calcular estadísticas
      const weekRevenue = weekAppointmentsData.appointments
        .filter(apt => apt.status === 'completada')
        .reduce((total, apt) => total + apt.total_price, 0);

      setStats({
        todayAppointments: todayAppointmentsData.length,
        weekAppointments: weekAppointmentsData.appointments.length,
        weekRevenue,
        totalClients: clientsData.pagination.total,
        totalEmployees: employeesData.pagination.total,
        totalServices: servicesData.pagination?.total
      });

      // Próximas citas (los próximos 5 días)
      const upcomingData = await appointmentService.getAppointments({
        start_date: today,
        status: 'programada,confirmada',
        limit: 10,
        sort: 'date:asc,start_time:asc'
      });
      setUpcomingAppointments(upcomingData.appointments.slice(0, 5));

      // Clientes recientes
      const recentClientsData = await clientService.getClients({
        limit: 5,
        sort: 'created_at:desc'
      });
      setRecentClients(recentClientsData.clients);

      // Empleados activos
      setActiveEmployees(employeesData.employees);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      programada: 'bg-blue-100 text-blue-800',
      confirmada: 'bg-green-100 text-green-800',
      en_proceso: 'bg-yellow-100 text-yellow-800',
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      no_asistio: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      programada: 'Programada',
      confirmada: 'Confirmada',
      en_proceso: 'En Proceso',
      completada: 'Completada',
      cancelada: 'Cancelada',
      no_asistio: 'No Asistió'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al panel de control de tu salón de belleza</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
          </div>
        ) : (
          <>
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Citas Esta Semana</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.weekAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Ingresos Semana</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.weekRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FiUser className="text-indigo-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Servicios Disponibles</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="text-pink-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Próximas citas */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
                </div>
                <div className="p-6">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay citas próximas</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map(appointment => (
                        <div key={appointment.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">
                                {appointment.client?.name} {appointment.client?.last_name}
                              </p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                                {getStatusLabel(appointment.status)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <FiCalendar className="mr-1 h-4 w-4" />
                                {formatDate(appointment.date)}
                              </div>
                              <div className="flex items-center">
                                <FiClock className="mr-1 h-4 w-4" />
                                {appointment.start_time}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(appointment.total_price)} • {appointment.employee?.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Panel derecho */}
              <div className="space-y-6">
                {/* Clientes recientes */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Clientes Recientes</h3>
                  </div>
                  <div className="p-6">
                    {recentClients.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay clientes recientes</p>
                    ) : (
                      <div className="space-y-3">
                        {recentClients.map(client => (
                          <div key={client.id} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-blue-600 text-sm" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {client.name} {client.last_name}
                              </p>
                              <div className="flex items-center text-sm text-gray-600">
                                <FiPhone className="mr-1 h-3 w-3" />
                                {client.phone}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navegación rápida */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="/citas"
                      className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-sm font-medium">Nueva Cita</span>
                    </a>
                    <a
                      href="/clientes"
                      className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <span className="text-sm font-medium">Nuevo Cliente</span>
                    </a>
                    <a
                      href="/servicios"
                      className="flex items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <span className="text-sm font-medium">Servicios</span>
                    </a>
                    <a
                      href="/historial"
                      className="flex items-center justify-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium">Historial</span>
                    </a>
                  </div>
                </div>

                {/* Personal activo */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Activo</h3>
                  </div>
                  <div className="p-6">
                    {activeEmployees.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay empleados activos</p>
                    ) : (
                      <div className="space-y-3">
                        {activeEmployees.map(employee => (
                          <div key={employee.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {employee.name} {employee.last_name}
                              </p>
                            </div>
                            <span className="w-3 h-3 bg-green-400 rounded-full" title="Activo"></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}