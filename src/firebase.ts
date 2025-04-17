// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Owner, Pet, Vaccination } from './types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkvgsWfGFX0XmDRFGcTrTWVgAqj3kvmUA",
  authDomain: "vet-app-58ab5.firebaseapp.com",
  projectId: "vet-app-58ab5",
  storageBucket: "vet-app-58ab5.firebasestorage.app",
  messagingSenderId: "18920633034",
  appId: "1:18920633034:web:e6a4de927c9767e991ba33",
  measurementId: "G-T94P0K0BT6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const ownersCollection = collection(db, 'owners');
const petsCollection = collection(db, 'pets');

// Helper functions for Firestore operations
export const fetchOwners = async (): Promise<Owner[]> => {
  try {
    const snapshot = await getDocs(ownersCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Owner[];
  } catch (error) {
    console.error('Error fetching owners:', error);
    return [];
  }
};

export const fetchPets = async (): Promise<Pet[]> => {
  try {
    const snapshot = await getDocs(petsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pet[];
  } catch (error) {
    console.error('Error fetching pets:', error);
    return [];
  }
};

export const addOwner = async (owner: Omit<Owner, 'id'>): Promise<Owner | null> => {
  try {
    const docRef = await addDoc(ownersCollection, owner);
    return { id: docRef.id, ...owner };
  } catch (error) {
    console.error('Error adding owner:', error);
    return null;
  }
};

export const addPet = async (pet: Omit<Pet, 'id' | 'vaccinations'>): Promise<Pet | null> => {
  try {
    const newPet = { ...pet, vaccinations: [] };
    const docRef = await addDoc(petsCollection, newPet);
    return { id: docRef.id, ...newPet };
  } catch (error) {
    console.error('Error adding pet:', error);
    return null;
  }
};

export const addVaccination = async (
  petId: string,
  vaccination: Omit<Vaccination, 'id' | 'reminderSent'>
): Promise<boolean> => {
  try {
    const pets = await fetchPets();
    const pet = pets.find(p => p.id === petId);
    
    if (!pet) {
      console.error('Pet not found');
      return false;
    }
    
    const newVaccination: Vaccination = {
      ...vaccination,
      id: `vacc-${Date.now()}`,
      petId, // Make sure petId is included
      reminderSent: false
    };
    
    const petRef = doc(db, 'pets', petId);
    await updateDoc(petRef, {
      vaccinations: [...pet.vaccinations, newVaccination]
    });
    
    return true;
  } catch (error) {
    console.error('Error adding vaccination:', error);
    return false;
  }
};

export const updateVaccinationReminder = async (
  petId: string,
  vaccinationId: string
): Promise<boolean> => {
  try {
    const pets = await fetchPets();
    const pet = pets.find(p => p.id === petId);
    
    if (!pet) {
      console.error('Pet not found');
      return false;
    }
    
    const vaccination = pet.vaccinations.find(v => v.id === vaccinationId);
    if (!vaccination) {
      console.error('Vaccination not found');
      return false;
    }
    
    const updatedVaccinations = pet.vaccinations.map(vacc => 
      vacc.id === vaccinationId 
        ? { ...vacc, reminderSent: true }
        : vacc
    );
    
    const petRef = doc(db, 'pets', petId);
    await updateDoc(petRef, {
      vaccinations: updatedVaccinations
    });
    
    return true;
  } catch (error) {
    console.error('Error updating vaccination reminder:', error);
    return false;
  }
};

// Initialize with sample data if needed
export const initializeSampleData = async () => {
  try {
    // Check if data already exists
    const owners = await fetchOwners();
    const pets = await fetchPets();
    
    if (owners.length > 0 || pets.length > 0) {
      console.log('Data already exists, skipping initialization');
      return;
    }
    
    console.log('Initializing sample data...');

    // Sample owners
    const sampleOwners = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-123-4567',
        address: '123 Main St, Anytown, USA'
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-987-6543',
        address: '456 Oak Ave, Somewhere, USA'
      }
    ];
    
    // Create sample owners
    const createdOwners: Owner[] = [];
    for (const owner of sampleOwners) {
      const newOwner = await addOwner(owner);
      if (newOwner) createdOwners.push(newOwner);
    }
    
    // Sample dates
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    
    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);
    
    const inTenDays = new Date(today);
    inTenDays.setDate(today.getDate() + 10);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    // Sample pets
    if (createdOwners.length >= 2) {
      const samplePets = [
        {
          ownerId: createdOwners[0].id,
          name: 'Max',
          species: 'Dog',
          breed: 'Golden Retriever',
          age: 5,
          weight: 70
        },
        {
          ownerId: createdOwners[1].id,
          name: 'Whiskers',
          species: 'Cat',
          breed: 'Siamese',
          age: 3,
          weight: 10
        },
        {
          ownerId: createdOwners[0].id,
          name: 'Buddy',
          species: 'Dog',
          breed: 'Labrador',
          age: 2,
          weight: 65
        }
      ];
      
      // Create sample pets
      for (const pet of samplePets) {
        const newPet = await addPet(pet);
        if (newPet) {
          // Add vaccinations to pets
          if (newPet.name === 'Max') {
            await addVaccination(newPet.id, {
              petId: newPet.id,
              type: 'Rabies',
              dateAdministered: lastMonth.toISOString().split('T')[0],
              nextDueDate: inTenDays.toISOString().split('T')[0],
              reminderInterval: '1 Year',
              notes: 'No adverse reactions'
            });
          } else if (newPet.name === 'Whiskers') {
            await addVaccination(newPet.id, {
              petId: newPet.id,
              type: 'Deworming',
              dateAdministered: threeDaysAgo.toISOString().split('T')[0],
              nextDueDate: inTwoDays.toISOString().split('T')[0],
              reminderInterval: '2 Weeks',
              notes: 'Mild reaction, monitor next time'
            });
          } else if (newPet.name === 'Buddy') {
            await addVaccination(newPet.id, {
              petId: newPet.id,
              type: 'Anti-fleas',
              dateAdministered: threeDaysAgo.toISOString().split('T')[0],
              nextDueDate: inTenDays.toISOString().split('T')[0],
              reminderInterval: '2 Months',
              notes: 'Used spot-on treatment'
            });
            
            await addVaccination(newPet.id, {
              petId: newPet.id,
              type: 'Viral vaccine',
              dateAdministered: lastMonth.toISOString().split('T')[0],
              nextDueDate: inTwoDays.toISOString().split('T')[0],
              reminderInterval: '20 Days',
              notes: 'Booster shot'
            });
          }
        }
      }
    }
    
    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

export { db }; 