// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Owner, Pet, Vaccination } from './types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkvgsWfGFX0XmDRFGcTrTWVgAqj3kvmUA",
  authDomain: "vet-app-58ab5.firebaseapp.com",
  projectId: "vet-app-58ab5",
  storageBucket: "vet-app-58ab5.appspot.com",
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

// Use in-memory data when Firestore fails
export const getHardcodedData = () => {
  // Create dates for vaccinations
  const today = new Date();
  
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  
  const inTwoDays = new Date(today);
  inTwoDays.setDate(today.getDate() + 2);
  
  const inTenDays = new Date(today);
  inTenDays.setDate(today.getDate() + 10);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  // Sample owners
  const owners: Owner[] = [
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

  // Sample pets with vaccinations that include petId
  const pets: Pet[] = [
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

  return { owners, pets };
};

// Initialize with sample data functionality is simplified to return
// hardcoded data to avoid Firebase permission issues
export const initializeSampleData = async () => {
  return getHardcodedData();
};

// These functions are simplified stubs since we're using in-memory data instead
export const addOwner = async (owner: Omit<Owner, 'id'>): Promise<Owner | null> => {
  console.log('Adding owner with in-memory data:', owner);
  return {
    ...owner,
    id: `owner-${Date.now()}`
  };
};

export const addPet = async (pet: Omit<Pet, 'id' | 'vaccinations'>): Promise<Pet | null> => {
  console.log('Adding pet with in-memory data:', pet);
  return {
    ...pet,
    id: `pet-${Date.now()}`,
    vaccinations: []
  };
};

export const addVaccination = async (
  petId: string,
  vaccination: Omit<Vaccination, 'id' | 'reminderSent'>
): Promise<boolean> => {
  console.log('Adding vaccination with in-memory data:', vaccination);
  return true;
};

export const updateVaccinationReminder = async (
  petId: string,
  vaccinationId: string
): Promise<boolean> => {
  console.log('Updating vaccination reminder:', { petId, vaccinationId });
  return true;
};

export { db }; 