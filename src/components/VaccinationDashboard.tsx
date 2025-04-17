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
    return owner ? owner.phoneNumber : 'N/A';
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Overdue
        </span>
      );
    } else if (daysRemaining <= 3) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Due Soon
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Upcoming
        </span>
      );
    }
  };

  // Function to open WhatsApp with a template message
  const openWhatsApp = (vaccination: any, petId: string, phoneNumber: string) => {
    const petName = getPetName(petId);
    const ownerName = getOwnerName(petId);
    const formattedDate = formatDate(vaccination.nextDueDate);
    
    // Create template message in English
    const message = encodeURIComponent(
      `Hello ${ownerName}, this is a reminder that ${petName}'s ${vaccination.type} vaccination is due on ${formattedDate}. Please contact our clinic to schedule an appointment.\n\nRegards,\nAndy Pet Clinic`
    );
    
    // Format phone number - remove any non-numeric characters
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Add Egypt country code (+2) if not already present
    if (!formattedNumber.startsWith('2')) {
      formattedNumber = '2' + formattedNumber;
    }
    
    // Open WhatsApp link
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Upcoming Vaccinations
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage upcoming pet vaccinations
        </p>
      </div>
      
      <div className="p-5 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filterDays">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Timeframe
              </div>
            </label>
            <select
              id="filterDays"
              className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filterDays}
              onChange={(e) => setFilterDays(parseInt(e.target.value, 10))}
            >
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
            </select>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filterPet">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by Pet
              </div>
            </label>
            <select
              id="filterPet"
              className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
        </div>
      </div>
      
      {filteredVaccinations.length === 0 ? (
        <div className="text-center py-12 px-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-500">No upcoming vaccinations in this timeframe.</p>
          <p className="mt-1 text-xs text-gray-400">Try adjusting your filters or adding new vaccinations.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-gray-200">
            {/* Desktop view */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
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
                    <tr key={vaccination.id} className="hover:bg-gray-50 transition-colors">
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
                          <button 
                            onClick={() => openWhatsApp(vaccination, vaccination.petId, getOwnerContact(vaccination.petId))}
                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-full hover:bg-green-50"
                            title="Send WhatsApp reminder"
                            aria-label="Send WhatsApp reminder"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M11.999 1.998c-5.462 0-9.924 4.461-9.924 9.923 0 5.462 4.462 9.924 9.924 9.924s9.924-4.462 9.924-9.924c0-5.462-4.462-9.923-9.924-9.923zm0 18.154c-4.54 0-8.231-3.69-8.231-8.231s3.691-8.23 8.231-8.23 8.231 3.69 8.231 8.23-3.691 8.231-8.231 8.231z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vaccination.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(vaccination.nextDueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{getDaysRemaining(vaccination.nextDueDate)}</div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Mobile view - cards instead of table */}
            <div className="md:hidden">
              {filteredVaccinations
                .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
                .map((vaccination) => (
                  <div key={vaccination.id} className="bg-white p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-md font-medium text-gray-900">{getPetName(vaccination.petId)}</div>
                        <div className="text-xs text-gray-500">ID: {vaccination.petId}</div>
                      </div>
                      <div>
                        {getStatusBadge(vaccination.nextDueDate)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-gray-500 block">Vaccination</span>
                        <span className="font-medium">{vaccination.type}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Owner</span>
                        <span className="font-medium">{getOwnerName(vaccination.petId)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Due Date</span>
                        <span className="font-medium">{formatDate(vaccination.nextDueDate)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Days Left</span>
                        <span className="font-medium">{getDaysRemaining(vaccination.nextDueDate)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-xs text-gray-500 block">Contact</span>
                        <span className="font-medium">{getOwnerContact(vaccination.petId)}</span>
                      </div>
                      <button 
                        onClick={() => openWhatsApp(vaccination, vaccination.petId, getOwnerContact(vaccination.petId))}
                        className="flex items-center justify-center px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        aria-label="Send WhatsApp reminder"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccinationDashboard; 