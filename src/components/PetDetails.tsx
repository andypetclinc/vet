import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PetVaccinationHistory from './PetVaccinationHistory';
import { db } from '../services/db';

interface PetDetailsProps {
  petId: string;
  onClose: () => void;
}

const PetDetails: React.FC<PetDetailsProps> = ({ petId, onClose }) => {
  const { pets, owners, refreshData } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const pet = pets.find(p => p.id === petId);
  if (!pet) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-red-500">Pet not found</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Back
        </button>
      </div>
    );
  }
  
  const owner = owners.find(o => o.id === pet.ownerId);
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${pet.name}? This will also remove all vaccination records.`)) {
      setIsDeleting(true);
      try {
        // Await the Promise and check its result
        const success = await db.deletePet(petId);
        if (success) {
          await refreshData(); // Refresh context data after deletion
          onClose();
        } else {
          throw new Error('Failed to delete pet');
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pet Details</h2>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Back to List
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isDeleting ? 'Deleting...' : 'Delete Pet'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pet Information</h3>
            <div className="space-y-2">
              <p><span className="font-semibold">ID:</span> {pet.id}</p>
              <p><span className="font-semibold">Name:</span> {pet.name}</p>
              <p><span className="font-semibold">Type:</span> {pet.species}</p>
              <p><span className="font-semibold">Breed:</span> {pet.breed}</p>
              <p><span className="font-semibold">Age:</span> {pet.age} years</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Owner Information</h3>
            {owner ? (
              <div className="space-y-2">
                <p><span className="font-semibold">Name:</span> {owner.name}</p>
                <p><span className="font-semibold">Phone:</span> {owner.phone}</p>
                {owner.email && <p><span className="font-semibold">Email:</span> {owner.email}</p>}
              </div>
            ) : (
              <p className="text-red-500">Owner not found</p>
            )}
          </div>
        </div>
      </div>
      
      <PetVaccinationHistory petId={petId} />
    </div>
  );
};

export default PetDetails; 