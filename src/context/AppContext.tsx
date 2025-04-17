import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Owner, Pet, Vaccination } from '../types';
import { firebaseService } from '../firebase';

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

  // Load data from Firebase
  const loadData = async () => {
    console.log('Loading data from Firebase...');
    try {
      // Initialize Firebase with sample data if empty
      await firebaseService.initializeIfEmpty();
      
      // Get owners
      const ownersData = await firebaseService.getOwners();
      console.log('Owners loaded:', ownersData.length);
      
      // Get pets
      const petsData = await firebaseService.getPets();
      console.log('Pets loaded:', petsData.length);
      
      // Update state
      setOwners(ownersData);
      setPets(petsData);
      setIsLoading(false);
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  // Load data on component mount - only once
  useEffect(() => {
    console.log('AppProvider mounted, loading data...');
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          updateVaccinationReminder(vaccination.id, vaccination.petId);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const addOwner = async (ownerData: Omit<Owner, 'id'>) => {
    try {
      const newOwner = await firebaseService.addOwner(ownerData);
      if (newOwner) {
        setOwners(prevOwners => [...prevOwners, newOwner]);
      }
    } catch (error) {
      console.error('Error adding owner:', error);
    }
  };

  const addPet = async (petData: Omit<Pet, 'vaccinations'>) => {
    // Check if pet ID already exists
    if (pets.some(pet => pet.id === petData.id)) {
      alert('A pet with this ID already exists. Please use a unique ID.');
      return;
    }
    
    try {
      const newPet = await firebaseService.addPet(petData);
      if (newPet) {
        setPets(prevPets => [...prevPets, newPet]);
      }
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  const addVaccination = async (vaccinationData: Omit<Vaccination, 'id' | 'reminderSent'>) => {
    const newVaccination: Vaccination = {
      ...vaccinationData,
      id: `vacc-${Date.now()}`,
      reminderSent: false
    };

    try {
      // Find the pet
      const pet = pets.find(p => p.id === vaccinationData.petId);
      if (!pet) return;
      
      // Update pet with new vaccination
      const updatedVaccinations = [...pet.vaccinations, newVaccination];
      const success = await firebaseService.updatePet(pet.id, { 
        vaccinations: updatedVaccinations 
      });
      
      if (success) {
        // Update state
        setPets(prevPets => 
          prevPets.map(pet => 
            pet.id === vaccinationData.petId 
              ? { ...pet, vaccinations: updatedVaccinations }
              : pet
          )
        );
      }
    } catch (error) {
      console.error('Error adding vaccination:', error);
    }
  };

  const updateVaccinationReminder = async (vaccinationId: string, petId: string) => {
    // Find the pet
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    // Find the vaccination
    const vaccinationIndex = pet.vaccinations.findIndex(v => v.id === vaccinationId);
    if (vaccinationIndex === -1) return;
    
    // Update vaccination
    const updatedVaccinations = [...pet.vaccinations];
    updatedVaccinations[vaccinationIndex] = {
      ...updatedVaccinations[vaccinationIndex],
      reminderSent: true
    };
    
    try {
      // Update in Firebase
      const success = await firebaseService.updatePet(petId, { 
        vaccinations: updatedVaccinations 
      });
      
      if (success) {
        // Update state
        setPets(prevPets => 
          prevPets.map(pet => ({
            ...pet,
            vaccinations: pet.id === petId ? updatedVaccinations : pet.vaccinations
          }))
        );
      }
    } catch (error) {
      console.error('Error updating vaccination reminder:', error);
    }
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