import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import PetDetails from './PetDetails';
import { Pet } from '../types';

const PetList: React.FC = () => {
  const { pets, owners, searchTerm } = useAppContext();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const filteredPets = useMemo(() => {
    if (!searchTerm) return pets;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return pets.filter(pet => 
      pet.name.toLowerCase().includes(lowercasedTerm) ||
      pet.id.toLowerCase().includes(lowercasedTerm)
    );
  }, [pets, searchTerm]);

  // Function to get owner name by ID
  const getOwnerName = (ownerId: string) => {
    const owner = owners.find(owner => owner.id === ownerId);
    return owner ? owner.name : 'Unknown Owner';
  };

  // Function to handle viewing pet details
  const handleViewDetails = (petId: string) => {
    setSelectedPetId(petId);
  };

  // Count vaccinations due soon (within 7 days)
  const getDueVaccinationsCount = (pet: Pet) => {
    if (!pet.vaccinations) return 0;
    
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    
    return pet.vaccinations.filter(vacc => {
      const dueDate = new Date(vacc.nextDueDate);
      return dueDate >= today && dueDate <= sevenDaysLater;
    }).length;
  };

  // Count overdue vaccinations
  const getOverdueVaccinationsCount = (pet: Pet) => {
    if (!pet.vaccinations) return 0;
    
    const today = new Date();
    
    return pet.vaccinations.filter(vacc => {
      const dueDate = new Date(vacc.nextDueDate);
      return dueDate < today;
    }).length;
  };

  // If a pet is selected, show its details
  if (selectedPetId) {
    return <PetDetails petId={selectedPetId} onClose={() => setSelectedPetId(null)} />;
  }

  if (pets.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-500 text-center">No pets added yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Pet List</h2>
      {filteredPets.length === 0 ? (
        <p className="text-gray-500 text-center">No pets match your search</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pet ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Breed
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vaccinations
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPets.map((pet) => {
              const overdueCount = getOverdueVaccinationsCount(pet);
              const dueCount = getDueVaccinationsCount(pet);
              
              return (
                <tr key={pet.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pet.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pet.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pet.species}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pet.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pet.breed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getOwnerName(pet.ownerId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {overdueCount > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                        {overdueCount} overdue
                      </span>
                    )}
                    {dueCount > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                        {dueCount} due soon
                      </span>
                    )}
                    {overdueCount === 0 && dueCount === 0 && (
                      pet.vaccinations && pet.vaccinations.length > 0 ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                          Up to date
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded">
                          No records
                        </span>
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewDetails(pet.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PetList; 