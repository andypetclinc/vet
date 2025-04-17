import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Owner, Pet, Vaccination } from '../types';

// Sample data for local usage
const sampleOwners: Owner[] = [
  {
    id: 'owner-1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown, USA'
  },
  {
    id: 'owner-2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-987-6543',
    address: '456 Oak Ave, Somewhere, USA'
  }
];

// Create sample dates for vaccinations
const today = new Date();
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);

const inTwoDays = new Date(today);
inTwoDays.setDate(today.getDate() + 2);

const inTenDays = new Date(today);
inTenDays.setDate(today.getDate() + 10);

const lastMonth = new Date(today);
lastMonth.setMonth(today.getMonth() - 1);

const samplePets: Pet[] = [
  {
    id: 'pet-1',
    ownerId: 'owner-1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 5,
    weight: 70,
    vaccinations: [
      {
        id: 'vacc-1',
        petId: 'pet-1',
        type: 'Rabies',
        dateAdministered: lastMonth.toISOString().split('T')[0],
        nextDueDate: inTenDays.toISOString().split('T')[0],
        reminderInterval: '1 Year',
        notes: 'No adverse reactions',
        reminderSent: false
      }
    ]
  },
  {
    id: 'pet-2',
    ownerId: 'owner-2',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Siamese',
    age: 3,
    weight: 10,
    vaccinations: [
      {
        id: 'vacc-2',
        petId: 'pet-2',
        type: 'Deworming',
        dateAdministered: threeDaysAgo.toISOString().split('T')[0],
        nextDueDate: inTwoDays.toISOString().split('T')[0],
        reminderInterval: '2 Weeks',
        notes: 'Mild reaction, monitor next time',
        reminderSent: false
      }
    ]
  },
  {
    id: 'pet-3',
    ownerId: 'owner-1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Labrador',
    age: 2,
    weight: 65,
    vaccinations: [
      {
        id: 'vacc-3',
        petId: 'pet-3',
        type: 'Anti-fleas',
        dateAdministered: threeDaysAgo.toISOString().split('T')[0],
        nextDueDate: inTenDays.toISOString().split('T')[0],
        reminderInterval: '2 Months',
        notes: 'Used spot-on treatment',
        reminderSent: false
      },
      {
        id: 'vacc-4',
        petId: 'pet-3',
        type: 'Viral vaccine',
        dateAdministered: lastMonth.toISOString().split('T')[0],
        nextDueDate: inTwoDays.toISOString().split('T')[0],
        reminderInterval: '20 Days',
        notes: 'Booster shot',
        reminderSent: false
      }
    ]
  }
];

interface AppContextType {
  owners: Owner[];
  pets: Pet[];
  addOwner: (owner: Omit<Owner, 'id'>) => void;
  addPet: (pet: Omit<Pet, 'vaccinations'>) => void;
  addVaccination: (vaccination: Omit<Vaccination, 'id' | 'reminderSent'>) => void;
  getUpcomingVaccinations: (daysAhead: number) => Vaccination[];
  getDueVaccinationsForPet: (petId: string) => Vaccination[];
  getVaccinationsForPet: (petId: string) => Vaccination[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sendNotification: (vaccination: Vaccination) => Promise<boolean>;
  refreshData: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load sample data with a small delay to simulate fetching
  const loadData = () => {
    console.log('Loading sample data...');
    
    // Use a timeout to simulate network delay and prevent UI flashing
    setTimeout(() => {
      try {
        setOwners(sampleOwners);
        setPets(samplePets);
        setIsLoading(false);
        console.log('Sample data loaded successfully');
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    }, 1000); // 1 second delay to simulate loading
  };

  // Load data on component mount - only once
  useEffect(() => {
    console.log('AppProvider mounted, loading data...');
    loadData();
  }, []);

  // Function to refresh data
  const refreshData = () => {
    console.log('Refreshing data...');
    setIsLoading(true);
    loadData();
  };

  // Check for vaccinations that need reminders
  useEffect(() => {
    if (isLoading) {
      console.log('Skipping reminder check until data is loaded');
      return;
    }

    console.log('Setting up vaccination reminders check');
    const checkForReminders = () => {
      console.log('Checking for vaccinations needing reminders...');
      const today = new Date();
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);

      let remindersToSend: Vaccination[] = [];

      pets.forEach(pet => {
        const dueVaccinations = pet.vaccinations.filter(vaccination => {
          const dueDate = new Date(vaccination.nextDueDate);
          return !vaccination.reminderSent && 
                 dueDate <= threeDaysFromNow && 
                 dueDate >= today;
        });

        if (dueVaccinations.length > 0) {
          remindersToSend = [...remindersToSend, ...dueVaccinations];
        }
      });

      // Send reminders
      if (remindersToSend.length > 0) {
        console.log(`Found ${remindersToSend.length} vaccinations needing reminders`);
      }
      
      remindersToSend.forEach(async (vaccination) => {
        const success = await sendNotification(vaccination);
        if (success) {
          // Mark reminder as sent
          updateVaccinationReminder(vaccination.petId, vaccination.id);
        }
      });
    };

    // Check for reminders initially and then every day
    console.log('Running initial reminder check');
    checkForReminders();
    
    console.log('Setting up daily reminder check');
    const interval = setInterval(checkForReminders, 24 * 60 * 60 * 1000);

    return () => {
      console.log('Cleaning up reminder interval');
      clearInterval(interval);
    };
  }, [isLoading]);

  const addOwner = (ownerData: Omit<Owner, 'id'>) => {
    const newOwner: Owner = {
      ...ownerData,
      id: `owner-${Date.now()}`
    };
    
    setOwners(prevOwners => [...prevOwners, newOwner]);
  };

  const addPet = (petData: Omit<Pet, 'vaccinations'>) => {
    // Check if pet ID already exists
    if (pets.some(pet => pet.id === petData.id)) {
      alert('A pet with this ID already exists. Please use a unique ID.');
      return;
    }
    
    const newPet: Pet = {
      ...petData,
      vaccinations: []
    };
    
    setPets(prevPets => [...prevPets, newPet]);
  };

  const addVaccination = (vaccinationData: Omit<Vaccination, 'id' | 'reminderSent'>) => {
    const newVaccination: Vaccination = {
      ...vaccinationData,
      id: `vacc-${Date.now()}`,
      reminderSent: false
    };

    setPets(prevPets => 
      prevPets.map(pet => 
        pet.id === vaccinationData.petId 
          ? { ...pet, vaccinations: [...pet.vaccinations, newVaccination] }
          : pet
      )
    );
  };

  const updateVaccinationReminder = (petId: string, vaccinationId: string) => {
    // Find the pet
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    // Find the vaccination
    const vaccination = pet.vaccinations.find(v => v.id === vaccinationId);
    if (!vaccination) return;
    
    // Update state
    setPets(prevPets => 
      prevPets.map(pet => ({
        ...pet,
        vaccinations: pet.vaccinations.map(vacc => 
          vacc.id === vaccinationId 
            ? { ...vacc, reminderSent: true }
            : vacc
        )
      }))
    );
  };

  const getUpcomingVaccinations = (daysAhead: number = 7) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysAhead);

    const upcomingVaccinations: Vaccination[] = [];

    pets.forEach(pet => {
      pet.vaccinations.forEach(vaccination => {
        const dueDate = new Date(vaccination.nextDueDate);
        if (dueDate >= today && dueDate <= futureDate) {
          upcomingVaccinations.push(vaccination);
        }
      });
    });

    return upcomingVaccinations;
  };

  const getDueVaccinationsForPet = (petId: string) => {
    const today = new Date();
    const pet = pets.find(p => p.id === petId);
    
    if (!pet) return [];
    
    return pet.vaccinations.filter(vaccination => {
      const dueDate = new Date(vaccination.nextDueDate);
      return dueDate <= today;
    });
  };

  const getVaccinationsForPet = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.vaccinations : [];
  };

  // Mock function to simulate sending email/SMS notifications
  const sendNotification = async (vaccination: Vaccination): Promise<boolean> => {
    // Find the pet
    const pet = pets.find(p => p.id === vaccination.petId);
    if (!pet) return false;
    
    // Find the owner
    const owner = owners.find(o => o.id === pet.ownerId);
    if (!owner) return false;

    console.log(`[NOTIFICATION] Sending reminder to ${owner.name} for ${pet.name}'s ${vaccination.type} vaccination due on ${new Date(vaccination.nextDueDate).toLocaleDateString()}`);
    
    // In a real implementation, this would connect to an email/SMS service
    // For this implementation, we'll just simulate success
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        owners,
        pets,
        addOwner,
        addPet,
        addVaccination,
        getUpcomingVaccinations,
        getDueVaccinationsForPet,
        getVaccinationsForPet,
        searchTerm,
        setSearchTerm,
        sendNotification,
        refreshData,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 