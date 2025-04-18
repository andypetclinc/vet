export interface Owner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
}

export type PetType = 'Cat' | 'Dog';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  age: number;
  breed: string;
  ownerId: string;
  vaccinations: Vaccination[];
}

export type VaccinationType = 'Anti-fleas' | 'Deworming' | 'Viral vaccine' | 'Rabies';

export type ReminderInterval = 
  | '2-week' 
  | '20-day' 
  | '2-month' 
  | '3-month' 
  | '1-year';

export interface ReminderIntervalOption {
  id: string;
  label: string;
  days: number;
}

export interface VaccinationTypeConfig {
  name: VaccinationType;
  reminderIntervals: ReminderIntervalOption[];
}

export interface Vaccination {
  id: string;
  petId: string;
  type: VaccinationType;
  dateAdministered: string;
  nextDueDate: string;
  notes?: string | null;
  reminderSent: boolean;
  selectedInterval: string;
}

export const VACCINATION_CONFIGS: VaccinationTypeConfig[] = [
  {
    name: 'Anti-fleas',
    reminderIntervals: [
      { id: 'anti-fleas-2m', label: '2 months', days: 60 },
      { id: 'anti-fleas-3m', label: '3 months', days: 90 }
    ]
  },
  {
    name: 'Deworming',
    reminderIntervals: [
      { id: 'deworming-2w', label: '2 weeks', days: 14 },
      { id: 'deworming-2m', label: '2 months', days: 60 }
    ]
  },
  {
    name: 'Viral vaccine',
    reminderIntervals: [
      { id: 'viral-20d', label: '20 days', days: 20 },
      { id: 'viral-1y', label: '1 year', days: 365 }
    ]
  },
  {
    name: 'Rabies',
    reminderIntervals: [
      { id: 'rabies-20d', label: '20 days', days: 20 },
      { id: 'rabies-1y', label: '1 year', days: 365 }
    ]
  }
]; 