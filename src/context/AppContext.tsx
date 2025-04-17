import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Owner, Pet, Vaccination } from '../types';
import { db, handleFirestoreError } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, setDoc, query, limit, startAfter, orderBy, serverTimestamp } from 'firebase/firestore';

interface AppContextType {
  owners: Owner[];
  pets: Pet[];
  loading: boolean;
  error: string | null;
  addOwner: (owner: Omit<Owner, 'id' | 'createdAt'>) => Promise<void>;
  addPet: (pet: Omit<Pet, 'vaccinations'>) => Promise<void>;
  addVaccination: (vaccination: Omit<Vaccination, 'id' | 'reminderSent'>) => Promise<void>;
  getUpcomingVaccinations: (daysAhead: number) => Vaccination[];
  getDueVaccinationsForPet: (petId: string) => Vaccination[];
  getVaccinationsForPet: (petId: string) => Vaccination[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sendNotification: (vaccination: Vaccination) => Promise<boolean>;
  refreshData: () => Promise<void>;
  loadMore: (type: 'owners' | 'pets') => Promise<void>;
  hasMore: { owners: boolean; pets: boolean };
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 10; // Number of items per page

type LoadType = 'owners' | 'pets' | 'all';

// Add cache interface
interface CacheData<T> {
  data: T[];
  timestamp: number;
}

// Initialize cache
const ownersCache = new Map<string, CacheData<Owner>>();

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState({ owners: true, pets: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cache refs
  const lastLoadTime = useRef<{ owners: number; pets: number }>({ owners: 0, pets: 0 });
  const cachedData = useRef<{ owners: Owner[]; pets: Pet[] }>({ owners: [], pets: [] });
  const lastDoc = useRef<{ owners: any; pets: any }>({ owners: null, pets: null });

  // Load initial data with pagination
  const loadData = useCallback(async (type: LoadType = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const now = Date.now();
      
      // Check cache first for initial load
      if (type === 'all' && 
          now - lastLoadTime.current.owners < CACHE_TTL && 
          now - lastLoadTime.current.pets < CACHE_TTL) {
        setOwners(cachedData.current.owners);
        setPets(cachedData.current.pets);
        setIsInitialized(true);
        setLoading(false);
        return;
      }

      if (type === 'owners' || type === 'all') {
        const ownersQuery = query(
          collection(db, 'owners'),
          orderBy('name'),
          limit(PAGE_SIZE),
          ...(lastDoc.current.owners ? [startAfter(lastDoc.current.owners)] : [])
        );

        const ownersSnapshot = await getDocs(ownersQuery);
        const newOwners = ownersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Owner[];

        lastDoc.current.owners = ownersSnapshot.docs[ownersSnapshot.docs.length - 1];
        setHasMore(prev => ({ ...prev, owners: ownersSnapshot.docs.length === PAGE_SIZE }));

        if (type === 'all') {
          cachedData.current.owners = newOwners;
          lastLoadTime.current.owners = now;
          setOwners(newOwners);
        } else {
          setOwners(prev => [...prev, ...newOwners]);
        }
      }

      if (type === 'pets' || type === 'all') {
        const petsQuery = query(
          collection(db, 'pets'),
          orderBy('name'),
          limit(PAGE_SIZE),
          ...(lastDoc.current.pets ? [startAfter(lastDoc.current.pets)] : [])
        );

        const petsSnapshot = await getDocs(petsQuery);
        const newPets = petsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          vaccinations: doc.data().vaccinations || []
        })) as Pet[];

        lastDoc.current.pets = petsSnapshot.docs[petsSnapshot.docs.length - 1];
        setHasMore(prev => ({ ...prev, pets: petsSnapshot.docs.length === PAGE_SIZE }));

        if (type === 'all') {
          cachedData.current.pets = newPets;
          lastLoadTime.current.pets = now;
          setPets(newPets);
        } else {
          setPets(prev => [...prev, ...newPets]);
        }
      }

      setIsInitialized(true);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(handleFirestoreError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more data
  const loadMore = useCallback(async (type: 'owners' | 'pets') => {
    if (!hasMore[type] || loading) return;
    await loadData(type);
  }, [hasMore, loading, loadData]);

  // Function to refresh data from the database
  const refreshData = async () => {
    // Reset pagination
    lastDoc.current = { owners: null, pets: null };
    lastLoadTime.current = { owners: 0, pets: 0 };
    setHasMore({ owners: true, pets: true });
    await loadData('all');
  };

  // Load data on component mount
  useEffect(() => {
    loadData('all');
  }, [loadData]);

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

  const addOwner = async (ownerData: Omit<Owner, 'id' | 'createdAt'>): Promise<void> => {
    try {
      // Create a new document reference
      const ownerRef = doc(collection(db, 'owners'));
      
      // Create the owner object with ID and timestamp
      const owner = {
        id: ownerRef.id,
        ...ownerData,
        createdAt: serverTimestamp()
      };

      // Add to Firestore
      await setDoc(ownerRef, owner);

      // Update local state
      setOwners(prev => [...prev, owner]);

      // Update cache
      const cacheKey = 'owners';
      const cachedData = ownersCache.get(cacheKey);
      if (cachedData) {
        ownersCache.set(cacheKey, {
          ...cachedData,
          data: [...cachedData.data, owner]
        });
      }
    } catch (error) {
      console.error('Error adding owner:', error);
      throw new Error('Failed to add owner. Please try again.');
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
      
      const petsCollection = collection(db, 'pets');
      const docRef = doc(petsCollection, petData.id);
      await setDoc(docRef, petWithVaccinations);
      
      // Update state with the new pet using the ID from petData
      const newPet: Pet = {
        ...petWithVaccinations,
        id: petData.id
      };
      
      setPets(prevPets => [...prevPets, newPet]);
    } catch (err: any) {
      console.error('Failed to add pet:', err);
      setError(handleFirestoreError(err));
      alert(`Failed to add pet: ${handleFirestoreError(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const addVaccination = async (vaccinationData: Omit<Vaccination, 'id' | 'reminderSent'>) => {
    setLoading(true);
    setError(null);
    try {
      // Create a new vaccination object with proper handling of optional fields
      const newVaccination: Vaccination = {
        ...vaccinationData,
        id: `vacc-${Date.now()}`,
        reminderSent: false,
        notes: vaccinationData.notes || null,
        selectedInterval: vaccinationData.selectedInterval || ''
      };

      // Update pet document with new vaccination
      const petRef = doc(db, 'pets', vaccinationData.petId);
      const pet = pets.find(p => p.id === vaccinationData.petId);
      if (!pet) throw new Error('Pet not found');

      const updatedVaccinations = [...(pet.vaccinations || []), newVaccination];
      await updateDoc(petRef, { vaccinations: updatedVaccinations });
      
      // Update state
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === vaccinationData.petId 
            ? { ...pet, vaccinations: updatedVaccinations }
            : pet
        )
      );
    } catch (err: any) {
      console.error('Failed to add vaccination:', err);
      const errorMessage = err.message || handleFirestoreError(err);
      setError(errorMessage);
      alert(`Failed to add vaccination: ${errorMessage}`);
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
      const petRef = doc(db, 'pets', petId);
      const updatedVaccinations = pet.vaccinations.map(vacc => 
        vacc.id === vaccinationId ? { ...vacc, reminderSent: true } : vacc
      );
      
      await updateDoc(petRef, { vaccinations: updatedVaccinations });
      
      // Update state
      setPets(prevPets => 
        prevPets.map(pet => ({
          ...pet,
          vaccinations: pet.id === petId ? updatedVaccinations : pet.vaccinations
        }))
      );
    } catch (err: any) {
      console.error('Failed to update vaccination reminder:', err);
      setError(handleFirestoreError(err));
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
        refreshData,
        loadMore,
        hasMore
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