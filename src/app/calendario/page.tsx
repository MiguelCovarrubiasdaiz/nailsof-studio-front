'use client';

import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import CalendarView from '@/components/CalendarView';
import AppointmentForm from '@/components/AppointmentForm';
import { Appointment } from '@/services/appointmentService';

export default function CalendarioPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [calendarKey, setCalendarKey] = useState(0);

  const handleNewAppointment = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedAppointment(undefined);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(null);
    setSelectedTime('');
    setShowForm(true);
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    setShowForm(false);
    setSelectedAppointment(undefined);
    setSelectedDate(null);
    setSelectedTime('');
    setCalendarKey(prev => prev + 1);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedAppointment(undefined);
    setSelectedDate(null);
    setSelectedTime('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Calendario de Citas
              </h1>
              <p className="text-gray-600">
                Vista completa de las citas programadas
              </p>
            </div>
            <button
              onClick={() => handleNewAppointment(new Date(), '09:00')}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Nueva Cita
            </button>
          </div>
        </div>

        <CalendarView
          key={calendarKey}
          onNewAppointment={handleNewAppointment}
          onEditAppointment={handleEditAppointment}
        />

        {showForm && (
          <AppointmentForm
            appointment={selectedAppointment}
            preSelectedDate={selectedDate}
            preSelectedTime={selectedTime}
            onSave={handleSaveAppointment}
            onCancel={handleCancelForm}
          />
        )}
      </div>
    </div>
  );
}