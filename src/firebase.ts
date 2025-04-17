import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Owner, Pet, Vaccination } from './types';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { db, ownersCollection, petsCollection };

// Helper functions for Firebase operations
export const firebaseService = {
  // Get all owners
  getOwners: async (): Promise<Owner[]> => {
    try {
      const ownersSnapshot = await getDocs(ownersCollection);
      return ownersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Owner[];
    } catch (error) {
      console.error("Error getting owners:", error);
      return [];
    }
  },

  // Get all pets
  getPets: async (): Promise<Pet[]> => {
    try {
      const petsSnapshot = await getDocs(petsCollection);
      return petsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          vaccinations: data.vaccinations || []
        } as Pet;
      });
    } catch (error) {
      console.error("Error getting pets:", error);
      return [];
    }
  },

  // Add a new owner
  addOwner: async (owner: Omit<Owner, 'id'>): Promise<Owner | null> => {
    try {
      const docRef = await addDoc(ownersCollection, owner);
      return { ...owner, id: docRef.id };
    } catch (error) {
      console.error("Error adding owner:", error);
      return null;
    }
  },

  // Add a new pet
  addPet: async (pet: Omit<Pet, 'vaccinations'>): Promise<Pet | null> => {
    try {
      const docRef = await addDoc(petsCollection, {
        ...pet,
        vaccinations: []
      });
      return { ...pet, id: docRef.id, vaccinations: [] };
    } catch (error) {
      console.error("Error adding pet:", error);
      return null;
    }
  },

  // Update a pet (used for adding vaccinations)
  updatePet: async (petId: string, petData: Partial<Pet>): Promise<boolean> => {
    try {
      const petRef = doc(db, 'pets', petId);
      await updateDoc(petRef, petData);
      return true;
    } catch (error) {
      console.error("Error updating pet:", error);
      return false;
    }
  },

  // Initialize with sample data if the collections are empty
  initializeIfEmpty: async (): Promise<boolean> => {
    try {
      // Check if owners collection is empty
      const ownersSnapshot = await getDocs(ownersCollection);
      const petsSnapshot = await getDocs(petsCollection);
      
      if (ownersSnapshot.empty && petsSnapshot.empty) {
        console.log("Initializing Firebase with sample data");
        
        // Sample owners
        const sampleOwners: Omit<Owner, 'id'>[] = [
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
        
        // Add owners
        const ownerRefs: Owner[] = [];
        for (const owner of sampleOwners) {
          const docRef = await addDoc(ownersCollection, owner);
          ownerRefs.push({ ...owner, id: docRef.id });
        }
        
        // Sample pets with dates
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        
        const inTwoDays = new Date(today);
        inTwoDays.setDate(today.getDate() + 2);
        
        const inTenDays = new Date(today);
        inTenDays.setDate(today.getDate() + 10);
        
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        
        // Sample pets with vaccinations
        interface TempVaccination {
          id: string;
          type: string;
          dateAdministered: string;
          nextDueDate: string;
          reminderInterval: string;
          notes: string;
          reminderSent: boolean;
        }

        type PetWithTempVaccinations = Omit<Pet, 'id' | 'vaccinations'> & { 
          vaccinations: TempVaccination[] 
        };
        
        const samplePets: PetWithTempVaccinations[] = [
          {
            ownerId: ownerRefs[0].id,
            name: 'Max',
            species: 'Dog',
            breed: 'Golden Retriever',
            age: 5,
            weight: 70,
            vaccinations: [
              {
                id: 'vacc-1',
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
            ownerId: ownerRefs[1].id,
            name: 'Whiskers',
            species: 'Cat',
            breed: 'Siamese',
            age: 3,
            weight: 10,
            vaccinations: [
              {
                id: 'vacc-2',
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
            ownerId: ownerRefs[0].id,
            name: 'Buddy',
            species: 'Dog',
            breed: 'Labrador',
            age: 2,
            weight: 65,
            vaccinations: [
              {
                id: 'vacc-3',
                type: 'Anti-fleas',
                dateAdministered: threeDaysAgo.toISOString().split('T')[0],
                nextDueDate: inTenDays.toISOString().split('T')[0],
                reminderInterval: '2 Months',
                notes: 'Used spot-on treatment',
                reminderSent: false
              },
              {
                id: 'vacc-4',
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
        
        // Add pets and update vaccination petIds
        for (let i = 0; i < samplePets.length; i++) {
          const pet = samplePets[i];
          const vaccinations = [...pet.vaccinations];
          
          // Create pet without vaccinations first
          const petWithoutVaccinations = { ...pet };
          delete (petWithoutVaccinations as any).vaccinations;
          
          // Add pet to Firestore
          const docRef = await addDoc(petsCollection, {
            ...petWithoutVaccinations,
            vaccinations: []
          });
          
          // Update vaccination petIds with the actual pet id
          const updatedVaccinations = vaccinations.map(vacc => ({
            ...vacc,
            petId: docRef.id
          }));
          
          // Update pet with vaccinations
          await updateDoc(doc(db, 'pets', docRef.id), {
            vaccinations: updatedVaccinations
          });
        }
        
        console.log("Sample data initialization complete");
        return true;
      }
      
      console.log("Firebase already has data, skipping initialization");
      return false;
    } catch (error) {
      console.error("Error initializing data:", error);
      return false;
    }
  }
}; 