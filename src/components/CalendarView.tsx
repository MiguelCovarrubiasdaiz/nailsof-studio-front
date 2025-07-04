'use client';

import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser, FiDollarSign, FiX } from 'react-icons/fi';
import { Appointment, appointmentService } from '@/services/appointmentService';
import CancelAppointmentModal from '@/components/CancelAppointmentModal';
import {
  formatDateShort,
  formatDateForAPI,
  formatPrice,
  getWeekStartAsDate,
  getWeekEndAsDate,
  getMonthYear,
  addDays,
  isToday,
  generateDayHours,
  generateWeekDaysAsDate,
  getStatusColor,
  getStatusLabel,
  dayJS
} from '@/utils';

interface CalendarViewProps {
  onNewAppointment: (date: Date, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export default function CalendarView({
                                       onNewAppointment,
                                       onEditAppointment
                                     }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'semana' | 'dia'>('semana');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [currentDate, calendarView]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const startDate = calendarView === 'semana' ? getWeekStartAsDate(currentDate) : currentDate;
      const endDate = calendarView === 'semana' ? getWeekEndAsDate(startDate) : currentDate;

      const data = await appointmentService.getAppointments({
        start_date: formatDateForAPI(startDate),
        end_date: formatDateForAPI(endDate),
        limit: 100
      });

      // Asegurarse de que appointments sea un array
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]); // En caso de error, establecer array vacío
    } finally {
      setIsLoading(false);
    }
  };

  const weekDays = generateWeekDaysAsDate(currentDate);
  const dayHours = generateDayHours();

  const getDayAppointments = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = dayJS(appointment.date);
      const targetDate = dayJS(date);
      return appointmentDate.isSame(targetDate, 'day');
    });
  };

  const navigateWeek = (direction: 'anterior' | 'siguiente') => {
    const days = direction === 'siguiente' ? 7 : -7;
    setCurrentDate(addDays(currentDate, days).toDate());
  };

  const navigateDay = (direction: 'anterior' | 'siguiente') => {
    const days = direction === 'siguiente' ? 1 : -1;
    setCurrentDate(addDays(currentDate, days).toDate());
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };




  const handleCancelAppointment = (appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelSuccess = (updatedAppointment: Appointment) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === updatedAppointment.id ? updatedAppointment : apt
    ));
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  return (
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header del calendario */}
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {getMonthYear(currentDate)}
            </h2>
            <div className="flex space-x-2">
              <button
                  onClick={() => calendarView === 'semana' ? navigateWeek('anterior') : navigateDay('anterior')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  disabled={isLoading}
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded flex items-center space-x-1 hover:bg-blue-200 transition-colors"
                  disabled={isLoading}
              >
                <FiCalendar className="h-3 w-3" />
                <span>Hoy</span>
              </button>
              <button
                  onClick={() => calendarView === 'semana' ? navigateWeek('siguiente') : navigateDay('siguiente')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  disabled={isLoading}
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
                onClick={() => setCalendarView('semana')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                    calendarView === 'semana'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Semana
            </button>
            <button
                onClick={() => setCalendarView('dia')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                    calendarView === 'dia'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Día
            </button>
          </div>
        </div>

        {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Cargando citas...</p>
            </div>
        )}

        {/* Vista de semana */}
        {!isLoading && calendarView === 'semana' && (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Headers de días */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 text-sm font-medium text-gray-500">Hora</div>
                  {weekDays.map((day, index) => {
                    const isDayToday = isToday(day);
                    return (
                        <div key={index} className={`p-3 text-center border-l ${isDayToday ? 'bg-blue-50' : ''}`}>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateShort(day)}
                          </div>
                          <div className={`text-xs ${
                              isDayToday
                                  ? 'text-blue-600 font-semibold'
                                  : 'text-gray-500'
                          }`}>
                            {day.getDate()}
                          </div>
                        </div>
                    );
                  })}
                </div>

                {/* Grid de horas y citas */}
                {dayHours.map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b min-h-[80px]">
                      <div className="p-3 text-sm text-gray-500 border-r">
                        {hour}
                      </div>
                      {weekDays.map((day, dayIndex) => {
                        const dayAppointments = getDayAppointments(day);
                        const hourAppointments = dayAppointments.filter(appointment =>
                            appointment.start_time.startsWith(hour.substring(0, 2))
                        );
                        const isDayToday = isToday(day);

                        return (
                            <div
                                key={dayIndex}
                                className={`border-l p-1 hover:bg-gray-50 cursor-pointer relative ${
                                    isDayToday ? 'bg-blue-50/30' : ''
                                }`}
                                onClick={() => onNewAppointment(day, hour)}
                            >
                              {hourAppointments.map(appointment => (
                                  <div
                                      key={appointment.id}
                                      className={`text-xs p-2 rounded mb-1 border transition-all hover:shadow-sm group relative ${getStatusColor(appointment.status)}`}
                                  >
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditAppointment(appointment);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="font-medium truncate">
                                        {appointment.client?.name} {appointment.client?.last_name}
                                      </div>
                                      <div className="opacity-75 truncate">
                                        {appointment.services?.[0]?.name}
                                        {(appointment.services?.length || 0) > 1 && ` +${(appointment.services?.length || 0) - 1}`}
                                      </div>
                                      <div className="opacity-75 truncate">
                                        {appointment.employee?.name}
                                      </div>
                                      <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] opacity-75">
                                {appointment.start_time} - {appointment.end_time}
                              </span>
                                      </div>
                                    </div>
                                    {appointment.status !== 'cancelada' && appointment.status !== 'completada' && (
                                      <button
                                        onClick={(e) => handleCancelAppointment(appointment, e)}
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                        title="Cancelar cita"
                                      >
                                        <FiX className="w-2 h-2" />
                                      </button>
                                    )}
                                  </div>
                              ))}
                            </div>
                        );
                      })}
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* Vista de día */}
        {!isLoading && calendarView === 'dia' && (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  {formatDateShort(currentDate)} - {currentDate.getDate()}
                </h3>
              </div>

              <div className="space-y-2">
                {dayHours.map(hour => {
                  const hourAppointments = getDayAppointments(currentDate).filter(appointment =>
                      appointment.start_time.startsWith(hour.substring(0, 2))
                  );

                  return (
                      <div key={hour} className="flex border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="w-20 text-sm text-gray-500 font-medium flex items-center">
                          <FiClock className="h-3 w-3 mr-1" />
                          {hour}
                        </div>
                        <div className="flex-1">
                          {hourAppointments.length === 0 ? (
                              <button
                                  onClick={() => onNewAppointment(currentDate, hour)}
                                  className="w-full text-left text-gray-400 hover:text-gray-600 p-2 transition-colors"
                              >
                                Hacer clic para agendar cita
                              </button>
                          ) : (
                              <div className="space-y-2">
                                {hourAppointments.map(appointment => (
                                    <div
                                        key={appointment.id}
                                        className={`p-3 rounded border hover:shadow-sm transition-all group relative ${getStatusColor(appointment.status)}`}
                                    >
                                      <div 
                                        onClick={() => onEditAppointment(appointment)}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="font-medium flex items-center">
                                              <FiUser className="h-3 w-3 mr-1" />
                                              {appointment.client?.name} {appointment.client?.last_name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                              <span className="font-medium">Empleado:</span> {appointment.employee?.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              <span className="font-medium">Servicios:</span> {appointment.services?.map(s => s.name).join(', ') || 'Sin servicios'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              <span className="font-medium">Horario:</span> {appointment.start_time} - {appointment.end_time}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 mt-1">
                                              <FiDollarSign className="h-3 w-3 mr-1" />
                                              {formatPrice(appointment.total_price)}
                                            </div>
                                            {appointment.notes && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                  <span className="font-medium">Notas:</span> {appointment.notes}
                                                </div>
                                            )}
                                            {appointment.cancellation_reason && (
                                                <div className="text-sm text-red-600 mt-1">
                                                  <span className="font-medium">Motivo de cancelación:</span> {appointment.cancellation_reason}
                                                </div>
                                            )}
                                          </div>
                                          <div className="flex flex-col items-end space-y-2">
                                            <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(appointment.status)}`}>
                                              {getStatusLabel(appointment.status)}
                                            </span>
                                            {appointment.status !== 'cancelada' && appointment.status !== 'completada' && (
                                              <button
                                                onClick={(e) => handleCancelAppointment(appointment, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                title="Cancelar cita"
                                              >
                                                <FiX className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
        )}

        {/* Mensaje cuando no hay citas */}
        {!isLoading && appointments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <FiCalendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay citas programadas para este período</p>
              <p className="text-sm mt-1">Haz clic en cualquier espacio para agendar una cita</p>
            </div>
        )}

        {/* Modal de cancelación */}
        {showCancelModal && appointmentToCancel && (
          <CancelAppointmentModal
            appointment={appointmentToCancel}
            onCancel={handleCancelModalClose}
            onSuccess={handleCancelSuccess}
          />
        )}
      </div>
  );
}