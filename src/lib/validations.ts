import * as yup from 'yup';

// Client validation schemas
export const clientSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  last_name: yup
    .string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  phone: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido'),
  email: yup
    .string()
    .email('Email inválido')
    .transform(value => value === '' ? null : value)
    .nullable()
    .optional(),
  birth_date: yup
    .date()
    .nullable()
    .optional(),
  notes: yup
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .nullable()
    .optional()
});

// Employee validation schemas
export const employeeSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  last_name: yup
    .string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  phone: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido'),
  email: yup
    .string()
    .email('Email inválido')
    .transform(value => value === '' ? null : value)
    .nullable()
    .optional(),
  active: yup
    .boolean()
    .default(true)
});

// Service validation schemas
export const serviceSchema = yup.object({
  name: yup
    .string()
    .required('El nombre del servicio es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: yup
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .nullable()
    .optional(),
  duration: yup
    .number()
    .required('La duración es requerida')
    .positive('La duración debe ser un número positivo')
    .integer('La duración debe ser un número entero'),
  price: yup
    .number()
    .required('El precio es requerido')
    .positive('El precio debe ser un número positivo'),
  category_id: yup
    .string()
    .required('La categoría es requerida'),
  active: yup
    .boolean()
    .default(true)
});

// Appointment validation schemas
export const appointmentSchema = yup.object({
  client_id: yup
    .string()
    .required('Debe seleccionar un cliente'),
  employee_id: yup
    .string()
    .required('Debe seleccionar un empleado'),
  date: yup
    .date()
    .required('La fecha es requerida')
    .min(new Date(), 'La fecha no puede ser en el pasado'),
  start_time: yup
    .string()
    .required('La hora de inicio es requerida')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  end_time: yup
    .string()
    .required('La hora de fin es requerida')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .test('end-time-after-start', 'La hora de fin debe ser posterior a la de inicio', function(value) {
      const { start_time } = this.parent;
      if (!start_time || !value) return true;
      return value > start_time;
    }),
  services: yup
    .array()
    .of(yup.object({
      service_id: yup.string().required(),
      price: yup.number().positive().required()
    }))
    .min(1, 'Debe seleccionar al menos un servicio'),
  notes: yup
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .nullable()
    .optional(),
  total_price: yup
    .number()
    .required('El precio total es requerido')
    .positive('El precio total debe ser positivo')
});

// Auth validation schemas
export const loginSchema = yup.object({
  username: yup
    .string()
    .required('El usuario es requerido')
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const registerSchema = yup.object({
  username: yup
    .string()
    .required('El usuario es requerido')
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario no puede exceder 50 caracteres'),
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: yup
    .string()
    .oneOf(['admin', 'employee', 'client'], 'Rol inválido')
    .required('El rol es requerido'),
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: yup
    .string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido')
});

export type ClientFormData = yup.InferType<typeof clientSchema>;
export type EmployeeFormData = yup.InferType<typeof employeeSchema>;
export type ServiceFormData = yup.InferType<typeof serviceSchema>;
export type AppointmentFormData = yup.InferType<typeof appointmentSchema>;
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;