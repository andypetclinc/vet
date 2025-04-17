import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Pet } from '../types';
import PetVaccinationHistory from './PetVaccinationHistory';

interface PetDetailsProps {
  petId: string;
  onClose: () => void;
}

const PetDetails: React.FC<PetDetailsProps> = ({ petId, onClose }) => {
  const { pets, owners } = useAppContext();
  const pet = pets.find(p => p.id === petId);
  const owner = owners.find(o => o.id === pet?.ownerId);

  if (!pet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">{pet.name}</h2>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Pet Information</h3>
            <p><strong>Species:</strong> {pet.species}</p>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Owner Information</h3>
            <p><strong>Name:</strong> {owner?.name || 'Unknown'}</p>
            <p><strong>Phone:</strong> {owner?.phone || 'N/A'}</p>
            <p><strong>Email:</strong> {owner?.email || 'N/A'}</p>
          </div>
        </div>

        <PetVaccinationHistory petId={petId} />
      </div>
    </div>
  );
};

export default PetDetails; 