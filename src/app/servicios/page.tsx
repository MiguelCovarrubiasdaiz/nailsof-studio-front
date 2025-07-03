'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiClock, FiDollarSign, FiTag } from 'react-icons/fi';
import { Service, serviceService } from '@/services/serviceService';
import { categoryService, Category } from '@/services/categoryService';
import ServiceForm from '@/components/ServiceForm';

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const loadServices = async (page = 1, search = '', categoryId = '', active?: boolean) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await serviceService.getServices({
        page,
        limit: 12,
        search: search || undefined,
        category_id: categoryId || undefined,
        active,
        sort: 'name:asc'
      });
      console.log(data)
      setServices(data.services);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar servicios');
      console.error('Error loading services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getActiveCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
    loadServices(1, searchTerm, categoryFilter, activeFilter);
  }, [searchTerm, categoryFilter, activeFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setCurrentPage(1);
  };

  const handleActiveFilter = (active?: boolean) => {
    setActiveFilter(active);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadServices(page, searchTerm, categoryFilter, activeFilter);
  };

  const handleCreateService = () => {
    setSelectedService(undefined);
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${service.name}"?`)) {
      return;
    }

    try {
      await serviceService.deleteService(service.id);
      loadServices(currentPage, searchTerm, categoryFilter, activeFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar servicio');
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await serviceService.updateService(service.id, { active: !service.active });
      loadServices(currentPage, searchTerm, categoryFilter, activeFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar servicio');
    }
  };

  const handleSaveService = (service: Service) => {
    setShowForm(false);
    loadServices(currentPage, searchTerm, categoryFilter, activeFilter);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
  };

  // Categories are loaded in useEffect

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadServices(currentPage, searchTerm, categoryFilter, activeFilter)}
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
                Catálogo de Servicios
              </h1>
              <button
                onClick={handleCreateService}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </button>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar servicios por nombre o descripción..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  disabled={loadingCategories}
                  className={`px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    loadingCategories ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                
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
                <p className="mt-2 text-gray-500">Cargando servicios...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm || categoryFilter || activeFilter !== undefined
                    ? 'No se encontraron servicios con los filtros aplicados.' 
                    : 'No hay servicios registrados.'}
                </p>
                {!searchTerm && !categoryFilter && activeFilter === undefined && (
                  <button
                    onClick={handleCreateService}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Agregar primer servicio
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`bg-white border rounded-lg shadow-sm p-6 ${
                      !service.active ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {service.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FiTag className="mr-1 h-4 w-4" />
                          {service.category?.name || 'Sin categoría'}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          service.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {service.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <FiClock className="mr-1 h-4 w-4" />
                          Duración:
                        </div>
                        <span className="font-medium text-black">
                          {formatDuration(service.duration)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <FiDollarSign className="mr-1 h-4 w-4" />
                          Precio:
                        </div>
                        <span className="font-bold text-lg text-green-600">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center justify-center"
                      >
                        <FiEdit2 className="mr-1 h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`flex-1 text-sm font-medium py-2 border rounded transition-colors ${
                          service.active
                            ? 'text-orange-600 border-orange-600 hover:bg-orange-50'
                            : 'text-green-600 border-green-600 hover:bg-green-50'
                        }`}
                      >
                        {service.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service)}
                        className="px-3 text-red-600 hover:text-red-800 text-sm font-medium border border-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar servicio"
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
        <ServiceForm
          service={selectedService}
          onSave={handleSaveService}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}