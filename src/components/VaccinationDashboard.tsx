import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Vaccination } from '../types';

const VaccinationDashboard: React.FC = () => {
  const { getUpcomingVaccinations, pets, owners } = useAppContext();
  const [filterPetId, setFilterPetId] = useState('');
  const [filterDays, setFilterDays] = useState(7);

  // Get upcoming vaccinations
  const upcomingVaccinations = useMemo(() => {
    return getUpcomingVaccinations(filterDays);
  }, [getUpcomingVaccinations, filterDays]);

  // Filter by pet if filter is set
  const filteredVaccinations = useMemo(() => {
    if (!filterPetId) return upcomingVaccinations;
    return upcomingVaccinations.filter(vaccination => vaccination.petId === filterPetId);
  }, [upcomingVaccinations, filterPetId]);

  // Get pet details
  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  };

  // Get owner details for a pet
  const getOwnerName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return 'Unknown Owner';
    
    const owner = owners.find(o => o.id === pet.ownerId);
    return owner ? owner.name : 'Unknown Owner';
  };

  // Get owner contact
  const getOwnerContact = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return 'N/A';
    
    const owner = owners.find(o => o.id === pet.ownerId);
    return owner ? owner.phone : 'N/A';
  };

  // Generate WhatsApp message for vaccination reminder
  const generateWhatsAppMessage = (vaccination: Vaccination) => {
    const pet = pets.find(p => p.id === vaccination.petId);
    if (!pet) return '';
    
    const owner = owners.find(o => o.id === pet.ownerId);
    if (!owner) return '';
    
    const dueDate = formatDate(vaccination.nextDueDate);
    
    // Create message template
    const message = encodeURIComponent(
      `Hello ${owner.name}, this is a reminder that ${pet.name}'s ${vaccination.type} vaccination is due on ${dueDate}. Please contact our clinic to schedule an appointment.\n\nRegards,\nAndy Pet Clinic`
    );
    
    // Format phone number for WhatsApp
    // Remove any non-digit characters and ensure it starts with country code
    let phone = owner.phone.replace(/\D/g, '');
    if (!phone.startsWith('2')) {
      phone = '2' + phone;
    }
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }
    
    return `https://wa.me/${phone.replace('+', '')}?text=${message}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days until vaccination is due
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Status badge based on days remaining
  const getStatusBadge = (dueDate: string) => {
    const daysRemaining = getDaysRemaining(dueDate);
    
    if (daysRemaining < 0) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Overdue
        </span>
      );
    } else if (daysRemaining <= 3) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Due Soon
        </span>
      );
    } else {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Upcoming
        </span>
      );
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Vaccinations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filterDays">
            Timeframe
          </label>
          <select
            id="filterDays"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={filterDays}
            onChange={(e) => setFilterDays(parseInt(e.target.value, 10))}
          >
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filterPet">
            Filter by Pet Name
          </label>
          <select
            id="filterPet"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={filterPetId}
            onChange={(e) => setFilterPetId(e.target.value)}
          >
            <option value="">All Pets</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} (ID: {pet.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchPetId">
            Search by Pet ID
          </label>
          <input
            id="searchPetId"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter pet ID"
            value={filterPetId}
            onChange={(e) => setFilterPetId(e.target.value)}
          />
        </div>
      </div>
      
      {filteredVaccinations.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">No upcoming vaccinations in this timeframe.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaccination
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVaccinations
                .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
                .map((vaccination) => (
                  <tr key={vaccination.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vaccination.nextDueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getPetName(vaccination.petId)}</div>
                      <div className="text-xs text-gray-500">ID: {vaccination.petId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getOwnerName(vaccination.petId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 mr-2">{getOwnerContact(vaccination.petId)}</div>
                        <a 
                          href={generateWhatsAppMessage(vaccination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                          title="Send WhatsApp reminder"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vaccination.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(vaccination.nextDueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getDaysRemaining(vaccination.nextDueDate)}</div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VaccinationDashboard; 