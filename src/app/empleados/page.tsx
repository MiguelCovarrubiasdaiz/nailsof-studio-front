'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMail, FiClock, FiUser } from 'react-icons/fi';
import { Employee, employeeService } from '@/services/employeeService';
import EmployeeForm from '@/components/EmployeeForm';

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const loadEmployees = async (page = 1, search = '', active?: boolean) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await employeeService.getEmployees({
        page,
        limit: 10,
        search: search || undefined,
        active,
        sort: 'created_at:desc'
      });
      setEmployees(data.employees);
      setTotalPages(data.pagination.total);
      setCurrentPage(data.pagination.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados');
      console.error('Error loading employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees(1, searchTerm, activeFilter);
  }, [searchTerm, activeFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleActiveFilter = (active?: boolean) => {
    setActiveFilter(active);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadEmployees(page, searchTerm, activeFilter);
  };

  const handleCreateEmployee = () => {
    setSelectedEmployee(undefined);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${employee.name} ${employee.last_name}?`)) {
      return;
    }

    try {
      await employeeService.deleteEmployee(employee.id);
      loadEmployees(currentPage, searchTerm, activeFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar empleado');
    }
  };

  const handleToggleActive = async (employee: Employee) => {
    try {
      await employeeService.updateEmployee(employee.id, { active: !employee.active });
      loadEmployees(currentPage, searchTerm, activeFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar empleado');
    }
  };

  const handleSaveEmployee = (employee: Employee) => {
    setShowForm(false);
    loadEmployees(currentPage, searchTerm, activeFilter);
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  const getDayLabel = (day: number) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[day];
  };

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadEmployees(currentPage, searchTerm, activeFilter)}
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
                Gestión de Personal
              </h1>
              <button
                onClick={handleCreateEmployee}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium  bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </button>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar empleados por nombre, teléfono o email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleActiveFilter(undefined)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    activeFilter === undefined
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleActiveFilter(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    activeFilter === true
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => handleActiveFilter(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    activeFilter === false
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Inactivos
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Cargando empleados...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm || activeFilter !== undefined 
                    ? 'No se encontraron empleados con los filtros aplicados.' 
                    : 'No hay empleados registrados.'}
                </p>
                {!searchTerm && activeFilter === undefined && (
                  <button
                    onClick={handleCreateEmployee}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Agregar primer empleado
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`bg-white border rounded-lg shadow-sm p-6 ${
                      !employee.active ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FiUser className="mr-2 h-4 w-4" />
                          {employee.name} {employee.last_name}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiPhone className="mr-2 h-4 w-4" />
                            {formatPhone(employee.phone)}
                          </div>
                          {employee.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FiMail className="mr-2 h-4 w-4" />
                              {employee.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          employee.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {employee.schedules && employee.schedules.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FiClock className="mr-1 h-4 w-4" />
                            Horarios:
                          </h4>
                          <div className="grid grid-cols-7 gap-1">
                            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dayName) => {
                              const schedule = employee.schedules?.find((s) =>
                                  s.day?.toLowerCase() === dayName.toLowerCase()
                              );

                              return (
                                  <div key={dayName} className="text-center">
                                    <div className="text-xs font-medium text-gray-600 mb-1 capitalize">
                                      {dayName.substring(0, 3)} {/* Muestra: Lun, Mar, Mié, etc. */}
                                    </div>
                                    <div
                                        className={`text-xs p-1 rounded ${
                                            schedule
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                      {schedule
                                          ? `${schedule.start_time.substring(0, 5)}-${schedule.end_time.substring(0, 5)}`
                                          : 'Libre'}
                                    </div>
                                  </div>
                              );
                            })}
                          </div>
                        </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center justify-center"
                      >
                        <FiEdit2 className="mr-1 h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(employee)}
                        className={`flex-1 text-sm font-medium py-2 border rounded transition-colors ${
                          employee.active
                            ? 'text-orange-600 border-orange-600 hover:bg-orange-50'
                            : 'text-green-600 border-green-600 hover:bg-green-50'
                        }`}
                      >
                        {employee.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="px-3 text-red-600 hover:text-red-800 text-sm font-medium border border-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar empleado"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
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
        <EmployeeForm
          employee={selectedEmployee}
          onSave={handleSaveEmployee}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}