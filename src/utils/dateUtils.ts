import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es-mx';

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es-mx');

// Configurar timezone por defecto (Mexico)
const DEFAULT_TIMEZONE = 'America/Mexico_City';

/**
 * Crear una instancia de dayjs con timezone de Mexico
 */
export const dayJS = (date?: dayjs.ConfigType) => {
  return dayjs(date).tz(DEFAULT_TIMEZONE);
};

/**
 * Formatear fecha para mostrar en UI (formato largo)
 * Ejemplo: "lunes, 15 de enero de 2024"
 */
export const formatDateLong = (date: dayjs.ConfigType): string => {
  return dayJS(date).format('dddd, D [de] MMMM [de] YYYY');
};

/**
 * Formatear fecha para mostrar en UI (formato corto)
 * Ejemplo: "lun, 15 ene"
 */
export const formatDateShort = (date: dayjs.ConfigType): string => {
  return dayJS(date).format('ddd, D MMM');
};

/**
 * Formatear fecha para la API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: dayjs.ConfigType): string => {
  return dayJS(date).format('YYYY-MM-DD');
};

/**
 * Formatear fecha para input date (YYYY-MM-DD)
 */
export const formatDateForInput = (date: dayjs.ConfigType): string => {
  return dayJS(date).format('YYYY-MM-DD');
};

/**
 * Formatear precio en pesos mexicanos
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0);
};

/**
 * Obtener el inicio de la semana (domingo)
 */
export const getWeekStart = (date: dayjs.ConfigType): dayjs.Dayjs => {
  return dayJS(date).startOf('week');
};

/**
 * Obtener el fin de la semana (sábado)
 */
export const getWeekEnd = (date: dayjs.ConfigType): dayjs.Dayjs => {
  return dayJS(date).endOf('week');
};

/**
 * Obtener el inicio de la semana como Date object
 */
export const getWeekStartAsDate = (date: dayjs.ConfigType): Date => {
  return getWeekStart(date).toDate();
};

/**
 * Obtener el fin de la semana como Date object
 */
export const getWeekEndAsDate = (date: dayjs.ConfigType): Date => {
  return getWeekEnd(date).toDate();
};

/**
 * Verificar si una fecha es hoy
 */
export const isToday = (date: dayjs.ConfigType): boolean => {
  return dayJS(date).isSame(dayJS(), 'day');
};

/**
 * Verificar si una fecha es este mes
 */
export const isThisMonth = (date: dayjs.ConfigType): boolean => {
  return dayJS(date).isSame(dayJS(), 'month');
};

/**
 * Obtener el nombre del mes y año
 * Ejemplo: "enero 2024"
 */
export const getMonthYear = (date: dayjs.ConfigType): string => {
  return dayJS(date).format('MMMM YYYY');
};

/**
 * Agregar días a una fecha
 */
export const addDays = (date: dayjs.ConfigType, days: number): dayjs.Dayjs => {
  return dayJS(date).add(days, 'day');
};

/**
 * Agregar semanas a una fecha
 */
export const addWeeks = (date: dayjs.ConfigType, weeks: number): dayjs.Dayjs => {
  return dayJS(date).add(weeks, 'week');
};

/**
 * Calcular la hora de fin basada en la hora de inicio y duración en horas
 */
export const calculateEndTime = (startTime: string, durationHours: number = 1): string => {
  if (!startTime) return '';
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = dayJS().hour(hours).minute(minutes);
  const endDate = startDate.add(durationHours, 'hour');
  
  return endDate.format('HH:mm');
};

/**
 * Verificar si una hora está dentro del horario laboral (8:00 - 20:00)
 */
export const isWorkingHours = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  return hour >= 8 && hour < 20;
};

/**
 * Generar array de horas para el día (8:00 - 19:00)
 */
export const generateDayHours = (): string[] => {
  return Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
};

/**
 * Generar array de días para la semana
 */
export const generateWeekDays = (startDate: dayjs.ConfigType): dayjs.Dayjs[] => {
  const start = getWeekStart(startDate);
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
};

/**
 * Generar array de días para la semana como Date objects
 */
export const generateWeekDaysAsDate = (startDate: dayjs.ConfigType): Date[] => {
  const start = getWeekStart(startDate);
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').toDate());
};

/**
 * Obtener el estado de color para una cita basado en su status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'programada': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'confirmada': return 'bg-green-100 text-green-800 border-green-200';
    case 'en_proceso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completada': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
    case 'no_asistio': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Obtener la etiqueta traducida para un status
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'programada': return 'Programada';
    case 'confirmada': return 'Confirmada';
    case 'en_proceso': return 'En Proceso';
    case 'completada': return 'Completada';
    case 'cancelada': return 'Cancelada';
    case 'no_asistio': return 'No Asistió';
    default: return status;
  }
};