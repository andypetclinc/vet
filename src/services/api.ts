import { Owner, Pet, Vaccination } from '../types';

const API_URL = 'http://localhost:3001';

// Owner API calls
export const fetchOwners = async (): Promise<Owner[]> => {
  const response = await fetch(`${API_URL}/owners`);
  if (!response.ok) {
    throw new Error('Failed to fetch owners');
  }
  return response.json();
};

export const createOwner = async (owner: Omit<Owner, 'id'>): Promise<Owner> => {
  const response = await fetch(`${API_URL}/owners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...owner,
      id: `owner-${Date.now()}`,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create owner');
  }
  
  return response.json();
};

// Pet API calls
export const fetchPets = async (): Promise<Pet[]> => {
  const response = await fetch(`${API_URL}/pets`);
  if (!response.ok) {
    throw new Error('Failed to fetch pets');
  }
  return response.json();
};

export const createPet = async (pet: Omit<Pet, 'vaccinations'>): Promise<Pet> => {
  const response = await fetch(`${API_URL}/pets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...pet,
      vaccinations: []
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create pet');
  }
  
  return response.json();
};

export const updatePet = async (pet: Pet): Promise<Pet> => {
  const response = await fetch(`${API_URL}/pets/${pet.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pet),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update pet');
  }
  
  return response.json();
};

export const deletePet = async (petId: string): Promise<void> => {
  // First, fetch all vaccinations to find those related to this pet
  const vaccinationsResponse = await fetch(`${API_URL}/vaccinations`);
  if (!vaccinationsResponse.ok) {
    throw new Error('Failed to fetch vaccinations');
  }
  
  const vaccinations = await vaccinationsResponse.json();
  const relatedVaccinations = vaccinations.filter((v: any) => v.petId === petId);
  
  // Delete all related vaccinations
  for (const vaccination of relatedVaccinations) {
    const deleteVaccinationResponse = await fetch(`${API_URL}/vaccinations/${vaccination.id}`, {
      method: 'DELETE',
    });
    
    if (!deleteVaccinationResponse.ok) {
      throw new Error(`Failed to delete vaccination ${vaccination.id}`);
    }
  }
  
  // Now delete the pet
  const response = await fetch(`${API_URL}/pets/${petId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete pet');
  }
};

// Vaccination API calls
export const fetchVaccinations = async (): Promise<Vaccination[]> => {
  const response = await fetch(`${API_URL}/vaccinations`);
  if (!response.ok) {
    throw new Error('Failed to fetch vaccinations');
  }
  return response.json();
};

export const createVaccination = async (vaccination: Omit<Vaccination, 'id' | 'reminderSent'>): Promise<Vaccination> => {
  const response = await fetch(`${API_URL}/vaccinations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...vaccination,
      id: `vacc-${Date.now()}`,
      reminderSent: false
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create vaccination');
  }
  
  return response.json();
};

export const updateVaccination = async (vaccination: Vaccination): Promise<Vaccination> => {
  const response = await fetch(`${API_URL}/vaccinations/${vaccination.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vaccination),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update vaccination');
  }
  
  return response.json();
}; 