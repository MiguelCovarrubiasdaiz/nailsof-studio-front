export interface Client {
  id: string;
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: Date;
  notes?: string;
  registeredAt: Date;
  lastVisit?: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category_id: string;
  category?: Category;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  serviceCount?: number;
  created_at: string;
  updated_at: string;
}

// Deprecated - Use Category interface instead
export enum ServiceCategory {
  HANDS = 'manos',
  FEET = 'pies',
  MAKEUP = 'maquillaje',
  EYEBROWS = 'cejas',
  EYELASHES = 'pestanas',
  FACIAL = 'facial',
  OTHER = 'otro'
}

export interface Employee {
  id: string;
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  active: boolean;
  schedules: EmployeeSchedule[];
}

export interface EmployeeSchedule {
  day: WeekDay;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export enum WeekDay {
  MONDAY = 'lunes',
  TUESDAY = 'martes',
  WEDNESDAY = 'miercoles',
  THURSDAY = 'jueves',
  FRIDAY = 'viernes',
  SATURDAY = 'sabado',
  SUNDAY = 'domingo'
}

export interface Appointment {
  id: string;
  clientId: string;
  client?: Client;
  employeeId: string;
  employee?: Employee;
  services: AppointmentService[];
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  totalPrice: number;
  createdAt: Date;
  reminderSent: boolean;
}

export interface AppointmentService {
  serviceId: string;
  service?: Service;
  price: number;
}

export enum AppointmentStatus {
  SCHEDULED = 'programada',
  CONFIRMED = 'confirmada',
  IN_PROGRESS = 'en_proceso',
  COMPLETED = 'completada',
  CANCELLED = 'cancelada',
  NO_SHOW = 'no_asistio'
}

export interface AppointmentHistory extends Appointment {
  observations?: string;
  satisfaction?: number; // 1-5 stars
}

export interface DaySummary {
  date: Date;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  newClients: number;
}