import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import VaccinationForm from './VaccinationForm';

interface PetVaccinationHistoryProps {
  petId: string;
}

const PetVaccinationHistory: React.FC<PetVaccinationHistoryProps> = ({ petId }) => {
  const { getVaccinationsForPet, pets } = useAppContext();
  const [showForm, setShowForm] = useState(true);
  
  const pet = pets.find(p => p.id === petId);
  if (!pet) {
    return <div>Pet not found</div>;
  }
  
  const vaccinations = getVaccinationsForPet(petId);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Status label based on days until due
  const getStatusLabel = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (daysUntilDue < 0) {
      return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Overdue</span>;
    } else if (daysUntilDue <= 3) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Due Soon</span>;
    } else if (daysUntilDue <= 30) {
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Upcoming</span>;
    } else {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Current</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            Vaccination Records for {pet.name}
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add New Vaccination
            </button>
          )}
        </div>
        
        {vaccinations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No vaccination records found for this pet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200">
              {/* Mobile view */}
              <div className="sm:hidden space-y-4">
                {vaccinations
                  .sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime())
                  .map((vaccination) => (
                    <div key={vaccination.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Type:</div>
                        <div>{vaccination.type}</div>
                        
                        <div className="font-medium">Administered:</div>
                        <div>{formatDate(vaccination.dateAdministered)}</div>
                        
                        <div className="font-medium">Next Due:</div>
                        <div>{formatDate(vaccination.nextDueDate)}</div>
                        
                        <div className="font-medium">Status:</div>
                        <div>{getStatusLabel(vaccination.nextDueDate)}</div>
                        
                        <div className="font-medium col-span-2">Notes:</div>
                        <div className="col-span-2">{vaccination.notes || '-'}</div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Desktop view */}
              <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaccination Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Administered
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccinations
                    .sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime())
                    .map((vaccination) => (
                      <tr key={vaccination.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vaccination.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(vaccination.dateAdministered)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(vaccination.nextDueDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusLabel(vaccination.nextDueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vaccination.notes || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {showForm && (
        <VaccinationForm 
          petId={petId} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
};

export default PetVaccinationHistory; 