'use client';

import { useState } from 'react';
import { Employee, employeeService, EmployeeSchedule } from '@/services/employeeService';
import { employeeSchema, EmployeeFormData } from '@/lib/validations';

interface EmployeeFormProps {
  employee?: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

// Mapeo entre índices y nombres de días
const DAY_MAPPING = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábado'
} as const;

const DAY_LABELS = {
  'domingo': 'Domingo',
  'lunes': 'Lunes',
  'martes': 'Martes',
  'miercoles': 'Miercoles',
  'jueves': 'Jueves',
  'viernes': 'Viernes',
  'sábado': 'Sábado'
} as const;

// Función para convertir el nombre del día a índice
const dayNameToIndex = (dayName: string): number => {
  const entry = Object.entries(DAY_MAPPING).find(([_, name]) => name === dayName.toLowerCase());
  return entry ? parseInt(entry[0]) : -1;
};

export default function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: employee?.name || '',
    last_name: employee?.last_name || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    active: employee?.active ?? true
  });

  // Convertir los schedules del empleado (con nombres de días) a formato interno
  const [schedules, setSchedules] = useState<Record<string, { start_time: string; end_time: string }>>(
      employee?.schedules?.reduce((acc, schedule) => {
        if (schedule.day) {
          acc[schedule.day.toLowerCase()] = {
            start_time: schedule.start_time,
            end_time: schedule.end_time
          };
        }
        return acc;
      }, {} as Record<string, { start_time: string; end_time: string }>) || {}
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = async () => {
    try {
      await employeeSchema.validate(formData, { abortEarly: false });
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
      // Convertir schedules al formato esperado por el backend
      const formattedSchedules = Object.entries(schedules).map(([dayName, times]) => ({
        day: dayName,
        start_time: times.start_time,
        end_time: times.end_time
      }));

      const employeeData = {
        ...formData,
        email: formData.email.trim() || null,
        schedules: formattedSchedules
      };

      let savedEmployee: Employee;
      if (employee) {
        savedEmployee = await employeeService.updateEmployee(employee.id, employeeData);
      } else {
        savedEmployee = await employeeService.createEmployee(employeeData);
      }

      onSave(savedEmployee);
    } catch (error) {
      console.error('Error saving employee:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error al guardar empleado' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleScheduleChange = (dayName: string, field: 'start_time' | 'end_time', value: string) => {
    setSchedules(prev => {
      const newSchedules = { ...prev };

      if (!value && field === 'start_time') {
        // Si se borra la hora de inicio, eliminar todo el schedule del día
        delete newSchedules[dayName];
      } else if (value) {
        // Si hay valor, actualizar o crear el schedule
        if (!newSchedules[dayName]) {
          newSchedules[dayName] = { start_time: '09:00', end_time: '18:00' };
        }
        newSchedules[dayName][field] = value;
      }

      return newSchedules;
    });
  };

  const getSchedule = (dayName: string) => {
    return schedules[dayName];
  };

  // Orden de días para mostrar (lunes a domingo)
  const daysOrder = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre del empleado"
                  />
                  {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                          errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Apellido del empleado"
                  />
                  {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="55-1234-5678"
                  />
                  {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="empleado@email.com"
                  />
                  {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios de trabajo
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {daysOrder.map((dayName) => {
                    const schedule = getSchedule(dayName);
                    const dayLabel = DAY_LABELS[dayName as keyof typeof DAY_LABELS];

                    return (
                        <div key={dayName} className="flex items-center space-x-2">
                          <div className="w-24 text-sm font-medium text-black">{dayLabel}:</div>
                          <input
                              type="time"
                              value={schedule?.start_time || ''}
                              onChange={(e) => handleScheduleChange(dayName, 'start_time', e.target.value)}
                              className="p-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-500">a</span>
                          <input
                              type="time"
                              value={schedule?.end_time || ''}
                              onChange={(e) => handleScheduleChange(dayName, 'end_time', e.target.value)}
                              className="p-1 border border-gray-300 rounded text-sm"
                              disabled={!schedule}
                          />
                          {schedule && (
                              <button
                                  type="button"
                                  onClick={() => handleScheduleChange(dayName, 'start_time', '')}
                                  className="text-red-600 hover:text-red-800 text-sm px-2"
                              >
                                Quitar
                              </button>
                          )}
                        </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center">
                <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="rounded mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Empleado activo
                </label>
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
                  {isLoading ? 'Guardando...' : (employee ? 'Actualizar' : 'Guardar')}
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