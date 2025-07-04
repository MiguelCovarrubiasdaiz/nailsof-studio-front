'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiCalendar, FiClock, FiUser, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { Appointment, appointmentService } from '@/services/appointmentService';
import AppointmentForm from '@/components/AppointmentForm';
import CancelAppointmentModal from '@/components/CancelAppointmentModal';

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const loadAppointments = async (page = 1, search = '', status = '', date = '') => {
    setIsLoading(true);
    setError('');
    try {
      const data = await appointmentService.getAppointments({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        start_date: date || undefined,
        end_date: date || undefined,
        sort: 'date:desc,start_time:asc'
      });
      setAppointments(data.appointments);
      setTotalPages(data.pagination.pages);
      setCurrentPage(data.pagination.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar citas');
      console.error('Error loading appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(1, searchTerm, statusFilter, dateFilter);
  }, [searchTerm, statusFilter, dateFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAppointments(page, searchTerm, statusFilter, dateFilter);
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(undefined);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la cita del ${formatDate(appointment.date)} a las ${appointment.start_time}?`)) {
      return;
    }

    try {
      await appointmentService.deleteAppointment(appointment.id);
      loadAppointments(currentPage, searchTerm, statusFilter, dateFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar cita');
    }
  };

  const handleUpdateStatus = async (appointment: Appointment, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointment.id, newStatus);
      loadAppointments(currentPage, searchTerm, statusFilter, dateFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    setShowForm(false);
    loadAppointments(currentPage, searchTerm, statusFilter, dateFilter);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelAppointmentSuccess = (cancelledAppointment: Appointment) => {
    setShowCancelModal(false);
    setAppointmentToCancel(undefined);
    loadAppointments(currentPage, searchTerm, statusFilter, dateFilter);
  };

  const handleCancelAppointmentModalClose = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
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

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'programada', label: 'Programada' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'no_asistio', label: 'No Asistió' }
  ];

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadAppointments(currentPage, searchTerm, statusFilter, dateFilter)}
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                Gestión de Citas
              </h1>
              <button
                onClick={handleCreateAppointment}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Nueva Cita
              </button>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por cliente o empleado..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={dateFilter}
                  onChange={handleDateFilter}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Cargando citas...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm || statusFilter || dateFilter
                    ? 'No se encontraron citas con los filtros aplicados.' 
                    : 'No hay citas registradas.'}
                </p>
                {!searchTerm && !statusFilter && !dateFilter && (
                  <button
                    onClick={handleCreateAppointment}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Agregar primera cita
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="mr-1 h-4 w-4" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiClock className="mr-1 h-4 w-4" />
                            {appointment.start_time} - {appointment.end_time}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-6 mb-2">
                          <div className="flex items-center">
                            <FiUser className="mr-1 h-4 w-4 text-gray-400" />
                            <span className="text-sm text-black">
                              <strong>Cliente:</strong> {appointment.client?.name} {appointment.client?.last_name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FiUser className="mr-1 h-4 w-4 text-gray-400" />
                            <span className="text-sm text-black">
                              <strong>Empleado:</strong> {appointment.employee?.name} {appointment.employee?.last_name}
                            </span>
                          </div>
                        </div>

                        {appointment.services && appointment.services.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">
                              <strong>Servicios:</strong>{' '}
                              {appointment.services.map(s => s.name).join(', ')}
                            </span>
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">
                              <strong>Notas:</strong> {appointment.notes}
                            </span>
                          </div>
                        )}

                        <div className="text-lg font-semibold text-green-600">
                          Total: {formatPrice(appointment.total_price)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {appointment.status === 'programada' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment, 'confirmada')}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                          >
                            Confirmar
                          </button>
                        )}
                        {appointment.status === 'confirmada' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment, 'en_proceso')}
                            className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200"
                          >
                            En Proceso
                          </button>
                        )}
                        {appointment.status === 'en_proceso' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment, 'completada')}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            Completar
                          </button>
                        )}
                        
                        {(appointment.status === 'programada' || appointment.status === 'confirmada') && (
                          <button
                            onClick={() => handleCancelAppointment(appointment)}
                            className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200"
                            title="Cancelar cita"
                          >
                            <FiX className="h-3 w-3 inline mr-1" />
                            Cancelar
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Editar cita"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteAppointment(appointment)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Eliminar cita"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          preSelectedDate={null}
          preSelectedTime=""
          onSave={handleSaveAppointment}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showCancelModal && appointmentToCancel && (
        <CancelAppointmentModal
          appointment={appointmentToCancel}
          onSuccess={handleCancelAppointmentSuccess}
          onCancel={handleCancelAppointmentModalClose}
        />
      )}
    </div>
  );
}