import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Owner, Pet, Vaccination, VACCINATION_CONFIGS } from '../types';
import * as api from '../services/api';

interface AppContextType {
  owners: Owner[];
  pets: Pet[];
  addOwner: (owner: Omit<Owner, 'id'>) => Promise<void>;
  addPet: (pet: Omit<Pet, 'vaccinations'>) => Promise<void>;
  addVaccination: (vaccination: Omit<Vaccination, 'id' | 'reminderSent'>) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  getUpcomingVaccinations: (daysAhead: number) => Vaccination[];
  getDueVaccinationsForPet: (petId: string) => Vaccination[];
  getVaccinationsForPet: (petId: string) => Vaccination[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sendNotification: (vaccination: Vaccination) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [ownersData, petsData, vaccinationsData] = await Promise.all([
          api.fetchOwners(),
          api.fetchPets(),
          api.fetchVaccinations()
        ]);
        
        setOwners(ownersData);
        setPets(petsData);
        setVaccinations(vaccinationsData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Check for vaccinations that need reminders
  useEffect(() => {
    const checkForReminders = async () => {
      const today = new Date();
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);

      let remindersToSend: Vaccination[] = [];

      vaccinations.forEach(vaccination => {
        const dueDate = new Date(vaccination.nextDueDate);
        if (!vaccination.reminderSent && 
            dueDate <= threeDaysFromNow && 
            dueDate >= today) {
          remindersToSend.push(vaccination);
        }
      });

      // Send reminders
      for (const vaccination of remindersToSend) {
        try {
          const success = await sendNotification(vaccination);
          if (success) {
            // Mark reminder as sent
            await updateVaccinationReminder(vaccination.id);
          }
        } catch (err) {
          console.error('Failed to send notification:', err);
        }
      }
    };

    // Check for reminders only if we have vaccinations
    if (vaccinations.length > 0 && !loading) {
      checkForReminders();
      // Set up interval for daily checks
      const interval = setInterval(checkForReminders, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [vaccinations, loading]);

  const addOwner = async (ownerData: Omit<Owner, 'id'>) => {
    try {
      setLoading(true);
      const newOwner = await api.createOwner(ownerData);
      setOwners(prevOwners => [...prevOwners, newOwner]);
    } catch (err) {
      setError('Failed to add owner');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (petData: Omit<Pet, 'vaccinations'>) => {
    try {
      // Check if pet ID already exists
      if (pets.some(pet => pet.id === petData.id)) {
        alert('A pet with this ID already exists. Please use a unique ID.');
        return;
      }
      
      setLoading(true);
      const newPet = await api.createPet(petData);
      setPets(prevPets => [...prevPets, newPet]);
    } catch (err) {
      setError('Failed to add pet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (petId: string) => {
    try {
      setLoading(true);
      await api.deletePet(petId);
      
      // Remove pet from state
      setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
      
      // Remove related vaccinations
      setVaccinations(prevVaccinations => 
        prevVaccinations.filter(vaccination => vaccination.petId !== petId)
      );
    } catch (err) {
      setError('Failed to delete pet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addVaccination = async (vaccinationData: Omit<Vaccination, 'id' | 'reminderSent'>) => {
    try {
      setLoading(true);
      const newVaccination = await api.createVaccination(vaccinationData);
      setVaccinations(prevVaccinations => [...prevVaccinations, newVaccination]);
    } catch (err) {
      setError('Failed to add vaccination');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateVaccinationReminder = async (vaccinationId: string) => {
    try {
      const vaccination = vaccinations.find(v => v.id === vaccinationId);
      if (!vaccination) return;

      const updatedVaccination = {
        ...vaccination,
        reminderSent: true
      };

      const result = await api.updateVaccination(updatedVaccination);
      
      setVaccinations(prevVaccinations => 
        prevVaccinations.map(vacc => 
          vacc.id === vaccinationId ? result : vacc
        )
      );
    } catch (err) {
      console.error('Failed to update vaccination reminder:', err);
    }
  };

  const getUpcomingVaccinations = useCallback((daysAhead: number = 7) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysAhead);

    return vaccinations.filter(vaccination => {
      const dueDate = new Date(vaccination.nextDueDate);
      return dueDate >= today && dueDate <= futureDate;
    });
  }, [vaccinations]);

  const getDueVaccinationsForPet = useCallback((petId: string) => {
    const today = new Date();
    
    return vaccinations.filter(vaccination => {
      const dueDate = new Date(vaccination.nextDueDate);
      return vaccination.petId === petId && dueDate <= today;
    });
  }, [vaccinations]);

  const getVaccinationsForPet = useCallback((petId: string) => {
    return vaccinations.filter(vaccination => vaccination.petId === petId);
  }, [vaccinations]);

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
        deletePet,
        getUpcomingVaccinations,
        getDueVaccinationsForPet,
        getVaccinationsForPet,
        searchTerm,
        setSearchTerm,
        sendNotification,
        loading,
        error
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