import {Appointment, AppointmentStatus, Client, Employee, Service, Category, WeekDay} from "@/types";

// Mock categories to match the new structure
export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Uñas', description: 'Servicios de manicure y pedicure', active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-2', name: 'Maquillaje', description: 'Servicios de maquillaje', active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Cejas y Pestañas', description: 'Servicios de cejas y pestañas', active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Manicure Clásico',
    description: 'Limado, cutícula, esmaltado básico',
    duration: 45,
    price: 250,
    category_id: 'cat-1',
    category: mockCategories[0],
    active: true
  },
  {
    id: '2',
    name: 'Manicure Semipermanente',
    description: 'Manicure con gel UV que dura hasta 3 semanas',
    duration: 60,
    price: 350,
    category_id: 'cat-1',
    category: mockCategories[0],
    active: true
  },
  {
    id: '3',
    name: 'Pedicure Spa',
    description: 'Exfoliación, hidratación, masaje y esmaltado',
    duration: 75,
    price: 400,
    category_id: 'cat-1',
    category: mockCategories[0],
    active: true
  },
  {
    id: '4',
    name: 'Maquillaje Social',
    description: 'Maquillaje para eventos y ocasiones especiales',
    duration: 90,
    price: 800,
    category_id: 'cat-2',
    category: mockCategories[1],
    active: true
  },
  {
    id: '5',
    name: 'Diseño de Cejas',
    description: 'Depilación y diseño con pinza y cera',
    duration: 30,
    price: 180,
    category_id: 'cat-3',
    category: mockCategories[2],
    active: true
  },
  {
    id: '6',
    name: 'Extensiones de Pestañas',
    description: 'Aplicación de pestañas pelo a pelo',
    duration: 120,
    price: 1200,
    category_id: 'cat-3',
    category: mockCategories[2],
    active: true
  }
];

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'María',
    lastName: 'González',
    phone: '55-1234-5678',
    email: 'maria@salon.com',
    specialties: ['Manicure', 'Pedicure'],
    active: true,
    schedules: [
      { day: WeekDay.MONDAY, startTime: '09:00', endTime: '18:00' },
      { day: WeekDay.TUESDAY, startTime: '09:00', endTime: '18:00' },
      { day: WeekDay.WEDNESDAY, startTime: '09:00', endTime: '18:00' },
      { day: WeekDay.THURSDAY, startTime: '09:00', endTime: '18:00' },
      { day: WeekDay.FRIDAY, startTime: '09:00', endTime: '18:00' },
      { day: WeekDay.SATURDAY, startTime: '10:00', endTime: '16:00' }
    ]
  },
  {
    id: '2',
    name: 'Ana',
    lastName: 'Martínez',
    phone: '55-2345-6789',
    email: 'ana@salon.com',
    specialties: ['Maquillaje', 'Cejas'],
    active: true,
    schedules: [
      { day: WeekDay.TUESDAY, startTime: '10:00', endTime: '19:00' },
      { day: WeekDay.WEDNESDAY, startTime: '10:00', endTime: '19:00' },
      { day: WeekDay.THURSDAY, startTime: '10:00', endTime: '19:00' },
      { day: WeekDay.FRIDAY, startTime: '10:00', endTime: '19:00' },
      { day: WeekDay.SATURDAY, startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    id: '3',
    name: 'Carmen',
    lastName: 'López',
    phone: '55-3456-7890',
    specialties: ['Pestañas', 'Cejas'],
    active: true,
    schedules: [
      { day: WeekDay.MONDAY, startTime: '11:00', endTime: '20:00' },
      { day: WeekDay.WEDNESDAY, startTime: '11:00', endTime: '20:00' },
      { day: WeekDay.FRIDAY, startTime: '11:00', endTime: '20:00' },
      { day: WeekDay.SATURDAY, startTime: '09:00', endTime: '17:00' }
    ]
  }
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sofía',
    lastName: 'Hernández',
    phone: '55-9876-5432',
    email: 'sofia@email.com',
    birthDate: new Date('1992-05-15'),
    registeredAt: new Date('2024-01-15'),
    lastVisit: new Date('2024-06-20')
  },
  {
    id: '2',
    name: 'Valentina',
    lastName: 'Rodríguez',
    phone: '55-8765-4321',
    email: 'vale@email.com',
    registeredAt: new Date('2024-02-10'),
    lastVisit: new Date('2024-06-25')
  },
  {
    id: '3',
    name: 'Isabella',
    lastName: 'García',
    phone: '55-7654-3210',
    registeredAt: new Date('2024-03-05'),
    notes: 'Alérgica a ciertos esmaltes'
  },
  {
    id: '4',
    name: 'Camila',
    lastName: 'Morales',
    phone: '55-6543-2109',
    email: 'camila@email.com',
    registeredAt: new Date('2024-04-12')
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    employeeId: '1',
    services: [{ serviceId: '2', price: 350 }],
    date: new Date('2024-06-28'),
    startTime: '10:00',
    endTime: '11:00',
    status: AppointmentStatus.SCHEDULED,
    totalPrice: 350,
    createdAt: new Date('2024-06-25'),
    reminderSent: false
  },
  {
    id: '2',
    clientId: '2',
    employeeId: '2',
    services: [{ serviceId: '4', price: 800 }],
    date: new Date('2024-06-28'),
    startTime: '14:00',
    endTime: '15:30',
    status: AppointmentStatus.CONFIRMED,
    totalPrice: 800,
    createdAt: new Date('2024-06-26'),
    reminderSent: true
  },
  {
    id: '3',
    clientId: '3',
    employeeId: '1',
    services: [
      { serviceId: '1', price: 250 },
      { serviceId: '3', price: 400 }
    ],
    date: new Date('2024-06-29'),
    startTime: '11:00',
    endTime: '13:00',
    status: AppointmentStatus.SCHEDULED,
    totalPrice: 650,
    createdAt: new Date('2024-06-27'),
    reminderSent: false
  }
];