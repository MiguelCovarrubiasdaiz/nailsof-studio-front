'use client';

import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from 'react-icons/fi';
import { Appointment, appointmentService } from '@/services/appointmentService';
import { formatDateForAPI } from '@/utils';

interface CalendarProps {
  onNewAppointment: (date: Date, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export default function Calendar({ 
  onNewAppointment, 
  onEditAppointment 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'semana' | 'dia'>('semana');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [currentDate, calendarView]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const startDate = calendarView === 'semana' ? getWeekStart(currentDate) : currentDate;
      const endDate = calendarView === 'semana' ? getWeekEnd(startDate) : currentDate;
      
      const data = await appointmentService.getAppointments({
        start_date: formatDateForAPI(startDate),
        end_date: formatDateForAPI(endDate),
        limit: 100
      });
      
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekStart = (date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart;
  };

  const getWeekEnd = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };


  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const dayHours = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getDayAppointments = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const navigateWeek = (direction: 'anterior' | 'siguiente') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'siguiente' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header del calendario */}
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateWeek('anterior')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded flex items-center space-x-1"
            >
              <FiCalendar className="h-3 w-3" />
              <span>Hoy</span>
            </button>
            <button
              onClick={() => navigateWeek('siguiente')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setCalendarView('semana')}
            className={`px-3 py-1 text-sm rounded ${
              calendarView === 'semana' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setCalendarView('dia')}
            className={`px-3 py-1 text-sm rounded ${
              calendarView === 'dia' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Día
          </button>
        </div>
      </div>

      {/* Vista de semana */}
      {calendarView === 'semana' && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Headers de días */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-3 text-sm font-medium text-gray-500">Hora</div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-3 text-center border-l">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(day)}
                  </div>
                  <div className={`text-xs ${
                    day.toDateString() === new Date().toDateString()
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-500'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid de horas y citas */}
            {dayHours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                <div className="p-3 text-sm text-gray-500 border-r">
                  {hour}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = getDayAppointments(day);
                  const hourAppointments = dayAppointments.filter(appointment => 
                    appointment.startTime === hour
                  );

                  return (
                    <div 
                      key={dayIndex} 
                      className="border-l p-1 hover:bg-gray-50 cursor-pointer relative"
                      onClick={() => onNewAppointment(day, hour)}
                    >
                      {hourAppointments.map(appointment => {
                        const client = getClientById(appointment.clientId);
                        const employee = getEmployeeById(appointment.employeeId);
                        const mainServices = appointment.services.map(s => 
                          getServiceById(s.serviceId)
                        ).filter(Boolean);

                        return (
                          <div
                            key={appointment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAppointment(appointment);
                            }}
                            className={`text-xs p-2 rounded mb-1 cursor-pointer hover:opacity-80 ${
                              appointment.status === 'programada' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'completada' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            <div className="font-medium">
                              {client?.name} {client?.lastName}
                            </div>
                            <div className="opacity-75">
                              {mainServices[0]?.name}
                              {mainServices.length > 1 && ` +${mainServices.length - 1}`}
                            </div>
                            <div className="opacity-75">
                              {employee?.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista de día */}
      {calendarView === 'dia' && (
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium">
              {formatDate(currentDate)} - {currentDate.getDate()}
            </h3>
          </div>
          
          <div className="space-y-2">
            {dayHours.map(hour => {
              const hourAppointments = getDayAppointments(currentDate).filter(appointment => 
                appointment.startTime === hour
              );

              return (
                <div key={hour} className="flex border rounded-lg p-3 hover:bg-gray-50">
                  <div className="w-20 text-sm text-gray-500 font-medium">
                    {hour}
                  </div>
                  <div className="flex-1">
                    {hourAppointments.length === 0 ? (
                      <button
                        onClick={() => onNewAppointment(currentDate, hour)}
                        className="w-full text-left text-gray-400 hover:text-gray-600"
                      >
                        Hacer clic para agendar cita
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {hourAppointments.map(appointment => {
                          const client = getClientById(appointment.clientId);
                          const employee = getEmployeeById(appointment.employeeId);
                          
                          return (
                            <div
                              key={appointment.id}
                              onClick={() => onEditAppointment(appointment)}
                              className="cursor-pointer p-3 rounded border hover:shadow-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {client?.name} {client?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {employee?.name} - ${appointment.totalPrice}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  appointment.status === 'programada' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}