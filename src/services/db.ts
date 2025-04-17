import { Owner, Pet, Vaccination } from '../types';

// Database keys
const OWNERS_KEY = 'vet_app_owners';
const PETS_KEY = 'vet_app_pets';
const INITIALIZED_KEY = 'vet_app_initialized';

// Type for a partial update
type PartialVaccination = Partial<Vaccination>;

/**
 * Database service for the application
 * Uses localStorage for persistence
 */
export const db = {
  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    try {
      return localStorage.getItem(INITIALIZED_KEY) === 'true';
    } catch (error) {
      console.error('Error checking initialization status:', error);
      return false;
    }
  },

  /**
   * Mark database as initialized
   */
  markAsInitialized(): void {
    try {
      localStorage.setItem(INITIALIZED_KEY, 'true');
    } catch (error) {
      console.error('Error marking as initialized:', error);
    }
  },

  /**
   * Load owners from localStorage
   */
  getOwners(): Owner[] {
    try {
      // Auto-initialize if not initialized
      if (!this.isInitialized()) {
        console.log('Database not initialized, initializing now...');
        this.initialize();
      }
      
      const ownersData = localStorage.getItem(OWNERS_KEY);
      console.log('Loaded owners data:', ownersData ? 'Data found' : 'No data');
      return ownersData ? JSON.parse(ownersData) : [];
    } catch (error) {
      console.error('Error getting owners:', error);
      return [];
    }
  },

  /**
   * Load pets from localStorage
   */
  getPets(): Pet[] {
    try {
      // Auto-initialize if not initialized
      if (!this.isInitialized()) {
        console.log('Database not initialized, initializing now...');
        this.initialize();
      }
      
      const petsData = localStorage.getItem(PETS_KEY);
      console.log('Loaded pets data:', petsData ? 'Data found' : 'No data');
      return petsData ? JSON.parse(petsData) : [];
    } catch (error) {
      console.error('Error getting pets:', error);
      return [];
    }
  },

  /**
   * Save owners to localStorage
   */
  saveOwners(owners: Owner[]): void {
    localStorage.setItem(OWNERS_KEY, JSON.stringify(owners));
  },

  /**
   * Save pets to localStorage
   */
  savePets(pets: Pet[]): void {
    localStorage.setItem(PETS_KEY, JSON.stringify(pets));
  },

  /**
   * Add a new owner
   */
  addOwner(owner: Owner): boolean {
    try {
      const owners = this.getOwners();
      owners.push(owner);
      this.saveOwners(owners);
      return true;
    } catch (error) {
      console.error('Error adding owner:', error);
      return false;
    }
  },

  /**
   * Add a new pet
   */
  addPet(pet: Pet): boolean {
    try {
      const pets = this.getPets();
      
      // Check if owner exists
      const owners = this.getOwners();
      if (!owners.some(owner => owner.id === pet.ownerId)) {
        console.error('Owner not found');
        return false;
      }
      
      pets.push(pet);
      this.savePets(pets);
      return true;
    } catch (error) {
      console.error('Error adding pet:', error);
      return false;
    }
  },

  /**
   * Get a specific owner by ID
   */
  getOwner(ownerId: string): Owner | undefined {
    const owners = this.getOwners();
    return owners.find(owner => owner.id === ownerId);
  },

  /**
   * Get a specific pet by ID
   */
  getPet(petId: string): Pet | undefined {
    const pets = this.getPets();
    return pets.find(pet => pet.id === petId);
  },

  /**
   * Update an owner
   */
  updateOwner(ownerId: string, updates: Partial<Owner>): boolean {
    try {
      const owners = this.getOwners();
      const index = owners.findIndex(owner => owner.id === ownerId);
      
      if (index === -1) {
        console.error('Owner not found');
        return false;
      }
      
      owners[index] = { ...owners[index], ...updates };
      this.saveOwners(owners);
      return true;
    } catch (error) {
      console.error('Error updating owner:', error);
      return false;
    }
  },

  /**
   * Update a pet
   */
  updatePet(petId: string, updates: Partial<Pet>): boolean {
    try {
      const pets = this.getPets();
      const index = pets.findIndex(pet => pet.id === petId);
      
      if (index === -1) {
        console.error('Pet not found');
        return false;
      }
      
      pets[index] = { ...pets[index], ...updates };
      this.savePets(pets);
      return true;
    } catch (error) {
      console.error('Error updating pet:', error);
      return false;
    }
  },

  /**
   * Delete an owner
   */
  deleteOwner(ownerId: string): boolean {
    try {
      const owners = this.getOwners();
      const filteredOwners = owners.filter(owner => owner.id !== ownerId);
      
      if (filteredOwners.length === owners.length) {
        console.error('Owner not found');
        return false;
      }
      
      this.saveOwners(filteredOwners);
      
      // Delete all pets belonging to this owner
      const pets = this.getPets();
      const filteredPets = pets.filter(pet => pet.ownerId !== ownerId);
      this.savePets(filteredPets);
      
      return true;
    } catch (error) {
      console.error('Error deleting owner:', error);
      return false;
    }
  },

  /**
   * Delete a pet
   */
  deletePet(petId: string): boolean {
    try {
      const pets = this.getPets();
      const filteredPets = pets.filter(pet => pet.id !== petId);
      
      if (filteredPets.length === pets.length) {
        console.error('Pet not found');
        return false;
      }
      
      this.savePets(filteredPets);
      return true;
    } catch (error) {
      console.error('Error deleting pet:', error);
      return false;
    }
  },

  /**
   * Add a vaccination to a pet
   */
  addVaccination(petId: string, vaccination: Vaccination): boolean {
    try {
      const pets = this.getPets();
      const petIndex = pets.findIndex(pet => pet.id === petId);
      
      if (petIndex === -1) {
        console.error('Pet not found');
        return false;
      }
      
      // Add vaccination to pet
      pets[petIndex].vaccinations = [...pets[petIndex].vaccinations, vaccination];
      this.savePets(pets);
      return true;
    } catch (error) {
      console.error('Error adding vaccination:', error);
      return false;
    }
  },

  /**
   * Update a vaccination
   */
  updateVaccination(petId: string, vaccinationId: string, updates: PartialVaccination): boolean {
    try {
      const pets = this.getPets();
      const petIndex = pets.findIndex(pet => pet.id === petId);
      
      if (petIndex === -1) {
        console.error('Pet not found');
        return false;
      }
      
      const vaccinationIndex = pets[petIndex].vaccinations.findIndex(
        v => v.id === vaccinationId
      );
      
      if (vaccinationIndex === -1) {
        console.error('Vaccination not found');
        return false;
      }
      
      // Update the vaccination
      pets[petIndex].vaccinations[vaccinationIndex] = {
        ...pets[petIndex].vaccinations[vaccinationIndex],
        ...updates
      };
      
      this.savePets(pets);
      return true;
    } catch (error) {
      console.error('Error updating vaccination:', error);
      return false;
    }
  },

  /**
   * Delete a vaccination
   */
  deleteVaccination(petId: string, vaccinationId: string): boolean {
    try {
      const pets = this.getPets();
      const petIndex = pets.findIndex(pet => pet.id === petId);
      
      if (petIndex === -1) {
        console.error('Pet not found');
        return false;
      }
      
      // Filter out the vaccination
      pets[petIndex].vaccinations = pets[petIndex].vaccinations.filter(
        v => v.id !== vaccinationId
      );
      
      this.savePets(pets);
      return true;
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      return false;
    }
  },

  /**
   * Clear all data - useful for testing
   */
  clearAll(): void {
    localStorage.removeItem(OWNERS_KEY);
    localStorage.removeItem(PETS_KEY);
  },

  /**
   * Initialize the database with sample data
   */
  initialize(): void {
    // Check if data already exists
    const owners = this.getOwners();
    const pets = this.getPets();
    
    if (owners.length > 0 || pets.length > 0) {
      this.markAsInitialized();
      console.log('Database already initialized');
      return;
    }
    
    // Sample owners
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
    
    // Save sample data
    this.saveOwners(sampleOwners);
    this.savePets(samplePets);
    
    // Mark as initialized
    this.markAsInitialized();
    
    console.log('Database initialized with sample data');
  }
}; 