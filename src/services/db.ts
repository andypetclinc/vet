import { Owner, Pet, Vaccination } from '../types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
  writeBatch,
  limit,
  orderBy
} from 'firebase/firestore';
import { db as firestore, handleFirestoreError } from './firebase';

// Collection references
const OWNERS_COLLECTION = 'owners';
const PETS_COLLECTION = 'pets';

// Type for a partial update
type PartialVaccination = Partial<Vaccination>;

// Cache last read results to prevent excessive reads
let ownersCache: Owner[] | null = null;
let petsCache: Pet[] | null = null;
let lastOwnersRead = 0;
let lastPetsRead = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

// Helper to convert Firestore data to our types
const convertOwner = (docId: string, data: DocumentData): Owner => {
  return {
    id: docId,
    ...data as Omit<Owner, 'id'>
  };
};

const convertPet = (docId: string, data: DocumentData): Pet => {
  return {
    id: docId,
    ...data as Omit<Pet, 'id'>,
    // Ensure vaccinations is always an array
    vaccinations: data.vaccinations || []
  };
};

/**
 * Database service for the application
 * Uses Firestore for persistence
 */
export const db = {
  /**
   * Load owners from Firestore with caching
   */
  async getOwners(): Promise<Owner[]> {
    // Check cache first
    const now = Date.now();
    if (ownersCache && now - lastOwnersRead < CACHE_TTL) {
      return ownersCache;
    }

    try {
      const ownersCollection = collection(firestore, OWNERS_COLLECTION);
      const ownersSnapshot = await getDocs(ownersCollection);
      
      const owners = ownersSnapshot.docs.map(doc => 
        convertOwner(doc.id, doc.data())
      );
      
      // Update cache
      ownersCache = owners;
      lastOwnersRead = now;
      
      return owners;
    } catch (error: any) {
      console.error('Error getting owners:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Load pets from Firestore with caching
   */
  async getPets(): Promise<Pet[]> {
    // Check cache first
    const now = Date.now();
    if (petsCache && now - lastPetsRead < CACHE_TTL) {
      return petsCache;
    }

    try {
      const petsCollection = collection(firestore, PETS_COLLECTION);
      const petsSnapshot = await getDocs(petsCollection);
      
      const pets = petsSnapshot.docs.map(doc => 
        convertPet(doc.id, doc.data())
      );
      
      // Update cache
      petsCache = pets;
      lastPetsRead = now;
      
      return pets;
    } catch (error: any) {
      console.error('Error getting pets:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Add a new owner
   */
  async addOwner(owner: Omit<Owner, 'id'>): Promise<string> {
    try {
      const ownersCollection = collection(firestore, OWNERS_COLLECTION);
      
      // If owner has an ID, use it, otherwise let Firestore generate one
      if ('id' in owner && owner.id) {
        const ownerRef = doc(firestore, OWNERS_COLLECTION, owner.id as string);
        await setDoc(ownerRef, owner);
        
        // Invalidate cache
        ownersCache = null;
        
        return owner.id as string;
      } else {
        const docRef = await addDoc(ownersCollection, owner);
        
        // Invalidate cache
        ownersCache = null;
        
        return docRef.id;
      }
    } catch (error: any) {
      console.error('Error adding owner:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Add a new pet
   */
  async addPet(pet: Omit<Pet, 'id'>): Promise<string> {
    try {
      // Check if owner exists - using specific doc lookup instead of loading all owners
      const ownerRef = doc(firestore, OWNERS_COLLECTION, pet.ownerId);
      const ownerDoc = await getDoc(ownerRef);
      
      if (!ownerDoc.exists()) {
        console.error('Owner not found');
        throw new Error('Owner not found');
      }
      
      const petsCollection = collection(firestore, PETS_COLLECTION);
      
      // If pet has an ID, use it, otherwise let Firestore generate one
      if ('id' in pet && pet.id) {
        const petRef = doc(firestore, PETS_COLLECTION, pet.id as string);
        await setDoc(petRef, pet);
        
        // Invalidate cache
        petsCache = null;
        
        return pet.id as string;
      } else {
        const docRef = await addDoc(petsCollection, pet);
        
        // Invalidate cache
        petsCache = null;
        
        return docRef.id;
      }
    } catch (error: any) {
      console.error('Error adding pet:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Get a specific owner by ID
   */
  async getOwner(ownerId: string): Promise<Owner | undefined> {
    try {
      // Check cache first
      if (ownersCache) {
        const cachedOwner = ownersCache.find(owner => owner.id === ownerId);
        if (cachedOwner) return cachedOwner;
      }
      
      const ownerRef = doc(firestore, OWNERS_COLLECTION, ownerId);
      const ownerDoc = await getDoc(ownerRef);
      
      if (!ownerDoc.exists()) {
        return undefined;
      }
      
      return convertOwner(ownerDoc.id, ownerDoc.data());
    } catch (error: any) {
      console.error('Error getting owner:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Get a specific pet by ID
   */
  async getPet(petId: string): Promise<Pet | undefined> {
    try {
      // Check cache first
      if (petsCache) {
        const cachedPet = petsCache.find(pet => pet.id === petId);
        if (cachedPet) return cachedPet;
      }
      
      const petRef = doc(firestore, PETS_COLLECTION, petId);
      const petDoc = await getDoc(petRef);
      
      if (!petDoc.exists()) {
        return undefined;
      }
      
      return convertPet(petDoc.id, petDoc.data());
    } catch (error: any) {
      console.error('Error getting pet:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Update an owner
   */
  async updateOwner(ownerId: string, updates: Partial<Owner>): Promise<boolean> {
    try {
      const ownerRef = doc(firestore, OWNERS_COLLECTION, ownerId);
      const ownerDoc = await getDoc(ownerRef);
      
      if (!ownerDoc.exists()) {
        console.error('Owner not found');
        return false;
      }
      
      await updateDoc(ownerRef, updates);
      
      // Invalidate cache
      ownersCache = null;
      
      return true;
    } catch (error: any) {
      console.error('Error updating owner:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Update a pet
   */
  async updatePet(petId: string, updates: Partial<Pet>): Promise<boolean> {
    try {
      const petRef = doc(firestore, PETS_COLLECTION, petId);
      const petDoc = await getDoc(petRef);
      
      if (!petDoc.exists()) {
        console.error('Pet not found');
        return false;
      }
      
      await updateDoc(petRef, updates);
      
      // Invalidate cache
      petsCache = null;
      
      return true;
    } catch (error: any) {
      console.error('Error updating pet:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Delete an owner
   */
  async deleteOwner(ownerId: string): Promise<boolean> {
    try {
      // First check if owner exists
      const ownerRef = doc(firestore, OWNERS_COLLECTION, ownerId);
      const ownerDoc = await getDoc(ownerRef);
      
      if (!ownerDoc.exists()) {
        console.error('Owner not found');
        return false;
      }
      
      // Find all pets belonging to this owner (limited to reasonable batch size)
      const petsCollection = collection(firestore, PETS_COLLECTION);
      const petsQuery = query(
        petsCollection, 
        where('ownerId', '==', ownerId),
        limit(500) // Avoid loading too many pets at once
      );
      const petsSnapshot = await getDocs(petsQuery);
      
      // Use a batch to delete the owner and all their pets
      const batch = writeBatch(firestore);
      
      // Add owner to batch deletion
      batch.delete(ownerRef);
      
      // Add all pets to batch deletion
      petsSnapshot.docs.forEach(petDoc => {
        const petRef = doc(firestore, PETS_COLLECTION, petDoc.id);
        batch.delete(petRef);
      });
      
      // Commit batch
      await batch.commit();
      
      // Invalidate caches
      ownersCache = null;
      petsCache = null;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting owner:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Delete a pet
   */
  async deletePet(petId: string): Promise<boolean> {
    try {
      // First check if pet exists
      const petRef = doc(firestore, PETS_COLLECTION, petId);
      const petDoc = await getDoc(petRef);
      
      if (!petDoc.exists()) {
        console.error('Pet not found');
        return false;
      }
      
      // Delete the pet
      await deleteDoc(petRef);
      
      // Invalidate cache
      petsCache = null;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Add a vaccination to a pet
   */
  async addVaccination(petId: string, vaccination: Vaccination): Promise<boolean> {
    try {
      // First get the pet
      const petRef = doc(firestore, PETS_COLLECTION, petId);
      const petDoc = await getDoc(petRef);
      
      if (!petDoc.exists()) {
        console.error('Pet not found');
        return false;
      }
      
      const petData = petDoc.data();
      const vaccinations = petData.vaccinations || [];
      
      // Add the new vaccination
      await updateDoc(petRef, {
        vaccinations: [...vaccinations, vaccination]
      });
      
      // Invalidate cache
      petsCache = null;
      
      return true;
    } catch (error: any) {
      console.error('Error adding vaccination:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Update a vaccination
   */
  async updateVaccination(petId: string, vaccinationId: string, updates: PartialVaccination): Promise<boolean> {
    try {
      // First get the pet
      const petRef = doc(firestore, PETS_COLLECTION, petId);
      const petDoc = await getDoc(petRef);
      
      if (!petDoc.exists()) {
        console.error('Pet not found');
        return false;
      }
      
      const petData = petDoc.data();
      const vaccinations = petData.vaccinations || [];
      
      // Find the vaccination
      const vaccinationIndex = vaccinations.findIndex(
        (v: Vaccination) => v.id === vaccinationId
      );
      
      if (vaccinationIndex === -1) {
        console.error('Vaccination not found');
        return false;
      }
      
      // Update the vaccination
      vaccinations[vaccinationIndex] = {
        ...vaccinations[vaccinationIndex],
        ...updates
      };
      
      // Update the pet with the modified vaccinations array
      await updateDoc(petRef, { vaccinations });
      
      // Invalidate cache
      petsCache = null;
      
      return true;
    } catch (error: any) {
      console.error('Error updating vaccination:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Delete a vaccination
   */
  async deleteVaccination(petId: string, vaccinationId: string): Promise<boolean> {
    try {
      // First get the pet
      const petRef = doc(firestore, PETS_COLLECTION, petId);
      const petDoc = await getDoc(petRef);
      
      if (!petDoc.exists()) {
        console.error('Pet not found');
        return false;
      }
      
      const petData = petDoc.data();
      const vaccinations = petData.vaccinations || [];
      
      // Filter out the vaccination
      const updatedVaccinations = vaccinations.filter(
        (v: Vaccination) => v.id !== vaccinationId
      );
      
      // Update the pet with the modified vaccinations array
      await updateDoc(petRef, { vaccinations: updatedVaccinations });
      
      // Invalidate cache
      petsCache = null;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting vaccination:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Clear all data - useful for testing
   */
  async clearAll(): Promise<void> {
    try {
      // Get all owners with a limit to avoid excessive reads
      const ownersCollection = collection(firestore, OWNERS_COLLECTION);
      const ownersQuery = query(ownersCollection, limit(500));
      const ownersSnapshot = await getDocs(ownersQuery);
      
      // Process in smaller batches to avoid quota issues
      const batch1 = writeBatch(firestore);
      let count = 0;
      
      // Delete owners in batches
      for (const ownerDoc of ownersSnapshot.docs) {
        batch1.delete(doc(firestore, OWNERS_COLLECTION, ownerDoc.id));
        count++;
        
        // Commit after reasonable batch size
        if (count >= 400) {
          await batch1.commit();
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch1.commit();
      }
      
      // Get all pets with a limit
      const petsCollection = collection(firestore, PETS_COLLECTION);
      const petsQuery = query(petsCollection, limit(500));
      const petsSnapshot = await getDocs(petsQuery);
      
      // Process pets in batches
      const batch2 = writeBatch(firestore);
      count = 0;
      
      for (const petDoc of petsSnapshot.docs) {
        batch2.delete(doc(firestore, PETS_COLLECTION, petDoc.id));
        count++;
        
        if (count >= 400) {
          await batch2.commit();
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch2.commit();
      }
      
      // Invalidate caches
      ownersCache = null;
      petsCache = null;
    } catch (error: any) {
      console.error('Error clearing data:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  /**
   * Initialize the database with sample data
   */
  async initialize(): Promise<void> {
    try {
      // First check if data already exists - use limit to reduce reads
      const ownersCollection = collection(firestore, OWNERS_COLLECTION);
      const ownersQuery = query(ownersCollection, limit(1));
      const ownersSnapshot = await getDocs(ownersQuery);
      
      const petsCollection = collection(firestore, PETS_COLLECTION);
      const petsQuery = query(petsCollection, limit(1));
      const petsSnapshot = await getDocs(petsQuery);
      
      if (ownersSnapshot.docs.length > 0 || petsSnapshot.docs.length > 0) {
        console.log('Database already initialized');
        return;
      }
      
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
      
      // Use batch write for creating owners
      const batch = writeBatch(firestore);
      const ownerIds = [];
      
      for (let i = 0; i < sampleOwners.length; i++) {
        const owner = sampleOwners[i];
        const ownerId = `owner-${Date.now()}-${i}`;
        const ownerRef = doc(firestore, OWNERS_COLLECTION, ownerId);
        
        batch.set(ownerRef, owner);
        ownerIds.push(ownerId);
      }
      
      await batch.commit();
      
      // Sample pets
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);
      
      const inTwoDays = new Date(today);
      inTwoDays.setDate(today.getDate() + 2);
      
      const inTenDays = new Date(today);
      inTenDays.setDate(today.getDate() + 10);
      
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      
      // Create pets with generated owner IDs and proper vaccination types
      const samplePets = [
        {
          ownerId: ownerIds[0],
          name: 'Max',
          species: 'Dog',
          breed: 'Golden Retriever',
          age: 5,
          weight: 70,
          vaccinations: [
            {
              id: `vacc-${Date.now()}-1`,
              petId: 'will-be-updated-later',
              type: 'Rabies' as const,
              dateAdministered: lastMonth.toISOString().split('T')[0],
              nextDueDate: inTenDays.toISOString().split('T')[0],
              reminderInterval: '1 Year',
              notes: 'No adverse reactions',
              reminderSent: false
            }
          ]
        },
        {
          ownerId: ownerIds[1],
          name: 'Whiskers',
          species: 'Cat',
          breed: 'Siamese',
          age: 3,
          weight: 10,
          vaccinations: [
            {
              id: `vacc-${Date.now()}-2`,
              petId: 'will-be-updated-later',
              type: 'Deworming' as const,
              dateAdministered: threeDaysAgo.toISOString().split('T')[0],
              nextDueDate: inTwoDays.toISOString().split('T')[0],
              reminderInterval: '2 Weeks',
              notes: 'Mild reaction, monitor next time',
              reminderSent: false
            }
          ]
        },
        {
          ownerId: ownerIds[0],
          name: 'Buddy',
          species: 'Dog',
          breed: 'Labrador',
          age: 2,
          weight: 65,
          vaccinations: [
            {
              id: `vacc-${Date.now()}-3`,
              petId: 'will-be-updated-later',
              type: 'Anti-fleas' as const,
              dateAdministered: threeDaysAgo.toISOString().split('T')[0],
              nextDueDate: inTenDays.toISOString().split('T')[0],
              reminderInterval: '2 Months',
              notes: 'Used spot-on treatment',
              reminderSent: false
            },
            {
              id: `vacc-${Date.now()}-4`,
              petId: 'will-be-updated-later',
              type: 'Viral vaccine' as const,
              dateAdministered: lastMonth.toISOString().split('T')[0],
              nextDueDate: inTwoDays.toISOString().split('T')[0],
              reminderInterval: '20 Days',
              notes: 'Booster shot',
              reminderSent: false
            }
          ]
        }
      ];
      
      // Add pets in a separate batch to avoid exceeding batch limits
      const batchPets = writeBatch(firestore);
      const petIds = [];
      
      for (let i = 0; i < samplePets.length; i++) {
        const pet = samplePets[i];
        const petId = `pet-${Date.now()}-${i}`;
        const petRef = doc(firestore, PETS_COLLECTION, petId);
        
        // Update vaccinations with correct petId
        const updatedVaccinations = pet.vaccinations.map(vacc => ({
          ...vacc,
          petId
        }));
        
        batchPets.set(petRef, {
          ...pet,
          vaccinations: updatedVaccinations
        });
        
        petIds.push(petId);
      }
      
      await batchPets.commit();
      
      // Invalidate caches
      ownersCache = null;
      petsCache = null;
      
      console.log('Database initialized with sample data');
    } catch (error: any) {
      console.error('Error initializing database:', error);
      throw new Error(handleFirestoreError(error));
    }
  },

  // Method to force clear the cache
  clearCache(): void {
    ownersCache = null;
    petsCache = null;
    lastOwnersRead = 0;
    lastPetsRead = 0;
  }
}; 