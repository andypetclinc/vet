import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Owner, Pet, Vaccination } from '../types';
import { db } from '../services/db';

interface AppContextType {
  owners: Owner[];
  pets: Pet[];
  loading: boolean;
  error: string | null;
  addOwner: (owner: Omit<Owner, 'id'>) => Promise<void>;
  addPet: (pet: Omit<Pet, 'vaccinations'>) => Promise<void>;
  addVaccination: (vaccination: Omit<Vaccination, 'id' | 'reminderSent'>) => Promise<void>;
  getUpcomingVaccinations: (daysAhead: number) => Vaccination[];
  getDueVaccinationsForPet: (petId: string) => Vaccination[];
  getVaccinationsForPet: (petId: string) => Vaccination[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sendNotification: (vaccination: Vaccination) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ownersData = await db.getOwners();
      const petsData = await db.getPets();
      setOwners(ownersData);
      setPets(petsData);
      setIsInitialized(true);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Function to refresh data from the database
  const refreshData = async () => {
    await loadData();
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
          updateVaccinationReminder(vaccination.petId, vaccination.id);
        }
      });
    };

    // Check for reminders initially and then every day
    checkForReminders();
    const interval = setInterval(checkForReminders, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isInitialized, pets]);

  const addOwner = async (ownerData: Omit<Owner, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const ownerId = await db.addOwner(ownerData);
      
      // Update state with the new owner including the ID from Firestore
      const newOwner: Owner = {
        ...ownerData,
        id: ownerId
      };
      
      setOwners(prevOwners => [...prevOwners, newOwner]);
    } catch (err: any) {
      console.error('Failed to add owner:', err);
      setError(err.message || 'Failed to add owner');
      alert(`Failed to add owner: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (petData: Omit<Pet, 'vaccinations'>) => {
    setLoading(true);
    setError(null);
    try {
      const petWithVaccinations: Omit<Pet, 'id'> = {
        ...petData,
        vaccinations: []
      };
      
      const petId = await db.addPet(petWithVaccinations);
      
      // Update state with the new pet including the ID from Firestore
      const newPet: Pet = {
        ...petWithVaccinations,
        id: petId
      };
      
      setPets(prevPets => [...prevPets, newPet]);
    } catch (err: any) {
      console.error('Failed to add pet:', err);
      setError(err.message || 'Failed to add pet');
      alert(`Failed to add pet: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addVaccination = async (vaccinationData: Omit<Vaccination, 'id' | 'reminderSent'>) => {
    setLoading(true);
    setError(null);
    try {
      const newVaccination: Vaccination = {
        ...vaccinationData,
        id: `vacc-${Date.now()}`,
        reminderSent: false
      };

      // Add to database
      const success = await db.addVaccination(vaccinationData.petId, newVaccination);
      
      if (success) {
        // Update state
        setPets(prevPets => 
          prevPets.map(pet => 
            pet.id === vaccinationData.petId 
              ? { ...pet, vaccinations: [...pet.vaccinations, newVaccination] }
              : pet
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to add vaccination:', err);
      setError(err.message || 'Failed to add vaccination');
      alert(`Failed to add vaccination: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateVaccinationReminder = async (petId: string, vaccinationId: string) => {
    try {
      // Find the pet
      const pet = pets.find(p => p.id === petId);
      if (!pet) return;
      
      // Find the vaccination
      const vaccination = pet.vaccinations.find(v => v.id === vaccinationId);
      if (!vaccination) return;
      
      // Update in database
      const success = await db.updateVaccination(petId, vaccinationId, { reminderSent: true });
      
      if (success) {
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
      }
    } catch (err: any) {
      console.error('Failed to update vaccination reminder:', err);
      setError(err.message || 'Failed to update vaccination reminder');
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
        loading,
        error,
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