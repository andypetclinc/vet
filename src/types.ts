// Vaccination types
export type VaccinationType = 'Anti-fleas' | 'Deworming' | 'Viral vaccine' | 'Rabies';

// Pet type
export type PetType = 'Dog' | 'Cat';

// Interval interface for vaccination reminders
export interface ReminderInterval {
  id: string;
  label: string;
  days: number;
}

// Vaccination config interface
export interface VaccinationConfig {
  name: VaccinationType;
  reminderIntervals: ReminderInterval[];
}

// Vaccination configurations
export const VACCINATION_CONFIGS: VaccinationConfig[] = [
  {
    name: 'Anti-fleas',
    reminderIntervals: [
      { id: 'antifleas-2m', label: '2 Months', days: 60 },
      { id: 'antifleas-3m', label: '3 Months', days: 90 }
    ]
  },
  {
    name: 'Deworming',
    reminderIntervals: [
      { id: 'deworming-2w', label: '2 Weeks', days: 14 },
      { id: 'deworming-2m', label: '2 Months', days: 60 }
    ]
  },
  {
    name: 'Viral vaccine',
    reminderIntervals: [
      { id: 'viral-20d', label: '20 Days', days: 20 },
      { id: 'viral-1y', label: '1 Year', days: 365 }
    ]
  },
  {
    name: 'Rabies',
    reminderIntervals: [
      { id: 'rabies-20d', label: '20 Days', days: 20 },
      { id: 'rabies-1y', label: '1 Year', days: 365 }
    ]
  }
];

// Owner interface
export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Pet interface
export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  vaccinations: Vaccination[];
}

// Vaccination interface
export interface Vaccination {
  id: string;
  petId: string;
  type: VaccinationType;
  dateAdministered: string;  // ISO date string: YYYY-MM-DD
  nextDueDate: string;       // ISO date string: YYYY-MM-DD
  reminderInterval: string;  // Human readable interval like "1 year", "3 months"
  notes?: string;
  reminderSent: boolean;
}

// Notification interface for vaccination reminders
export interface VaccinationReminder {
  petId: string;
  petName: string;
  ownerName: string;
  ownerEmail: string;
  vaccinationType: VaccinationType;
  dueDate: string;
} 