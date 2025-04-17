import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Owner, Pet, Vaccination } from '../types';
import { db } from '../services/db';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data
  const loadData = () => {
    setOwners(db.getOwners());
    setPets(db.getPets());
    setIsInitialized(true);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Function to refresh data from the database
  const refreshData = () => {
    loadData();
  };

  // Check for vaccinations that need reminders
  useEffect(() => {
    if (!isInitialized) return;

    const checkForReminders = () => {
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
      remindersToSend.forEach(async (vaccination) => {
        const success = await sendNotification(vaccination);
        if (success) {
          // Mark reminder as sent
          updateVaccinationReminder(vaccination.id, vaccination.petId);
        }
      });
    };

    // Check for reminders initially and then every day
    checkForReminders();
    const interval = setInterval(checkForReminders, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isInitialized, pets]);

  const addOwner = (ownerData: Omit<Owner, 'id'>) => {
    const newOwner: Owner = {
      ...ownerData,
      id: `owner-${Date.now()}`
    };
    
    // Add to database
    if (db.addOwner(newOwner)) {
      // Update state
      setOwners([...owners, newOwner]);
    }
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
    
    // Add to database
    if (db.addPet(newPet)) {
      // Update state
      setPets([...pets, newPet]);
    }
  };

  const addVaccination = (vaccinationData: Omit<Vaccination, 'id' | 'reminderSent'>) => {
    const newVaccination: Vaccination = {
      ...vaccinationData,
      id: `vacc-${Date.now()}`,
      reminderSent: false
    };

    // Add to database
    if (db.addVaccination(vaccinationData.petId, newVaccination)) {
      // Update state
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === vaccinationData.petId 
            ? { ...pet, vaccinations: [...pet.vaccinations, newVaccination] }
            : pet
        )
      );
    }
  };

  const updateVaccinationReminder = (vaccinationId: string, petId: string) => {
    // Find the pet
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    // Find the vaccination
    const vaccination = pet.vaccinations.find(v => v.id === vaccinationId);
    if (!vaccination) return;
    
    // Update in database
    db.updateVaccination(petId, vaccinationId, { reminderSent: true });
    
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
        refreshData
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