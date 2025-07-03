'use client';

import { useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { Appointment, appointmentService } from '@/services/appointmentService';

interface CancelAppointmentModalProps {
  appointment: Appointment;
  onCancel: () => void;
  onSuccess: (appointment: Appointment) => void;
}

export default function CancelAppointmentModal({
  appointment,
  onCancel,
  onSuccess
}: CancelAppointmentModalProps) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cancellationReason.trim()) {
      setError('El motivo de cancelación es requerido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedAppointment = await appointmentService.cancelAppointment(
        appointment.id,
        cancellationReason.trim()
      );
      onSuccess(updatedAppointment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la cita');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <FiAlertTriangle className="text-orange-500 text-xl" />
            <h2 className="text-xl font-semibold text-gray-900">
              Cancelar Cita
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Detalles de la cita:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Cliente:</span> {appointment.client?.name} {appointment.client?.last_name}</p>
                <p><span className="font-medium">Fecha:</span> {new Date(appointment.date).toLocaleDateString('es-MX')}</p>
                <p><span className="font-medium">Hora:</span> {appointment.start_time} - {appointment.end_time}</p>
                <p><span className="font-medium">Empleado:</span> {appointment.employee?.name} {appointment.employee?.last_name}</p>
                <p><span className="font-medium">Servicios:</span> {appointment.services?.map(s => s.name).join(', ')}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="cancellation_reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de cancelación *
            </label>
            <textarea
              id="cancellation_reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Escriba el motivo de la cancelación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !cancellationReason.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? 'Cancelando...' : 'Cancelar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}