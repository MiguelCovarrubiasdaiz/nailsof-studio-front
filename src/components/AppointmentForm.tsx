'use client';

import { useState, useEffect } from 'react';
import { Appointment, appointmentService, AppointmentFormData, AppointmentServiceData } from '@/services/appointmentService';
import { Client, clientService } from '@/services/clientService';
import { Employee, employeeService } from '@/services/employeeService';
import { Service, serviceService } from '@/services/serviceService';
import { appointmentSchema, AppointmentFormData as ValidationAppointmentFormData } from '@/lib/validations';
import { calculateEndTime } from '@/utils';

interface AppointmentFormProps {
  appointment?: Appointment;
  preSelectedDate?: Date | null;
  preSelectedTime?: string;
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
}

export default function AppointmentForm({ appointment, preSelectedDate, preSelectedTime, onSave, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState<ValidationAppointmentFormData>({
    client_id: appointment?.client_id || '',
    employee_id: appointment?.employee_id || '',
    date: appointment?.date ? new Date(appointment.date) : (preSelectedDate || new Date()),
    start_time: appointment?.start_time || preSelectedTime || '',
    end_time: appointment?.end_time || (preSelectedTime ? calculateEndTime(preSelectedTime) : ''),
    services: appointment?.services?.map(s => ({
      service_id: s.id,
      price: s.AppointmentService.price
    })) || [],
    notes: appointment?.notes || '',
    total_price: appointment?.total_price || 0
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<AppointmentServiceData[]>(
    appointment?.services?.map(s => ({
      service_id: s.id,
      price: s.AppointmentService.price
    })) || []
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedServices]);

  const loadInitialData = async () => {
    try {
      const [clientsData, employeesData, servicesData] = await Promise.all([
        clientService.getClients({ limit: 1000, active: true }),
        employeeService.getEmployees({ limit: 1000, active: true }),
        serviceService.getServices({ limit: 1000, active: true })
      ]);

      setClients(clientsData.clients);
      setEmployees(employeesData.employees);
      setServices(servicesData.services);
    } catch (error) {
      console.error('Error loading data:', error);
      setErrors({ general: 'Error al cargar datos iniciales' });
    } finally {
      setLoadingData(false);
    }
  };

  const calculateTotalPrice = () => {
    const total = selectedServices.reduce((sum, service) => sum + service.price, 0);
    setFormData(prev => ({ ...prev, total_price: total }));
  };

  const validateForm = async () => {
    try {
      const dataToValidate = {
        ...formData,
        services: selectedServices
      };
      await appointmentSchema.validate(dataToValidate, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      error.inner?.forEach((err: any) => {
        if (err.path) {
          validationErrors[err.path] = err.message;
        }
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const appointmentData: AppointmentFormData = {
        client_id: formData.client_id,
        employee_id: formData.employee_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        services: selectedServices,
        notes: formData.notes?.trim() || null,
        total_price: formData.total_price
      };

      let savedAppointment: Appointment;
      if (appointment) {
        savedAppointment = await appointmentService.updateAppointment(appointment.id, appointmentData);
      } else {
        savedAppointment = await appointmentService.createAppointment(appointmentData);
      }

      onSave(savedAppointment);
    } catch (error) {
      console.error('Error saving appointment:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error al guardar cita' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               name === 'date' ? new Date(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.service_id === service.id);
      if (exists) {
        return prev.filter(s => s.service_id !== service.id);
      } else {
        return [...prev, { service_id: service.id, price: service.price }];
      }
    });
  };

  const handleServicePriceChange = (serviceId: string, price: number) => {
    setSelectedServices(prev =>
      prev.map(s => s.service_id === serviceId ? { ...s, price } : s)
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };


  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-black">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">
            {appointment ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.client_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.last_name} - {client.phone}
                    </option>
                  ))}
                </select>
                {errors.client_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado *
                </label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.employee_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona un empleado</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} {employee.last_name}
                    </option>
                  ))}
                </select>
                {errors.employee_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.employee_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formatDate(formData.date)}
                  onChange={handleInputChange}
                  min={formatDate(new Date())}
                  className={`w-full p-2 border rounded-md ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora inicio *
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora fin *
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.end_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servicios *
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                {services.length === 0 ? (
                  <p className="text-gray-500">No hay servicios disponibles</p>
                ) : (
                  <div className="space-y-2">
                    {services.map(service => {
                      const isSelected = selectedServices.find(s => s.service_id === service.id);
                      return (
                        <div key={service.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleServiceToggle(service)}
                              className="mr-3"
                            />
                            <div>
                              <p className="font-medium text-black">{service.name}</p>
                              <p className="text-sm text-gray-600">
                                {service.duration}min - {service.category?.name || 'Sin categoría'}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">$</span>
                              <input
                                type="number"
                                value={isSelected.price}
                                onChange={(e) => handleServicePriceChange(service.id, parseFloat(e.target.value) || 0)}
                                className="w-20 p-1 border border-gray-300 rounded text-sm"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          )}
                          {!isSelected && (
                            <span className="text-sm font-medium text-gray-600">
                              {formatPrice(service.price)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {errors.services && (
                <p className="text-red-500 text-sm mt-1">{errors.services}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Observaciones especiales..."
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-black">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(formData.total_price)}
                </span>
              </div>
            </div>

            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : (appointment ? 'Actualizar' : 'Guardar')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}