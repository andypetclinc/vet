import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Pet } from '../types';
import PetVaccinationHistory from './PetVaccinationHistory';

interface PetDetailsProps {
  petId: string;
  onClose: () => void;
}

const PetDetails: React.FC<PetDetailsProps> = ({ petId, onClose }) => {
  const { pets, owners, deletePet } = useAppContext();
  const pet = pets.find(p => p.id === petId);
  const owner = owners.find(o => o.id === pet?.ownerId);

  if (!pet) return null;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${pet.name}? This action cannot be undone.`)) {
      try {
        await deletePet(petId);
        onClose();
      } catch (error) {
        console.error('Failed to delete pet:', error);
        alert('Failed to delete pet. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-4xl w-full my-4 sm:my-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">{pet.name}</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={handleDelete}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Pet
            </button>
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Pet Information</h3>
            <div className="space-y-2">
              <p><strong>Species:</strong> {pet.species}</p>
              <p><strong>Breed:</strong> {pet.breed}</p>
              <p><strong>Age:</strong> {pet.age}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Owner Information</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {owner?.name || 'Unknown'}</p>
              <p><strong>Phone:</strong> {owner?.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {owner?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        <PetVaccinationHistory petId={petId} />
      </div>
    </div>
  );
};

export default PetDetails; 