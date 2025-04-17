import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { VACCINATION_CONFIGS, VaccinationType, VaccinationConfig } from '../types';

interface VaccinationFormProps {
  petId: string;
  onClose: () => void;
}

const VaccinationForm: React.FC<VaccinationFormProps> = ({ petId, onClose }) => {
  const { addVaccination, pets } = useAppContext();
  const [type, setType] = useState<VaccinationType>('Anti-fleas');
  const [dateAdministered, setDateAdministered] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedInterval, setSelectedInterval] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [availableIntervals, setAvailableIntervals] = useState(VACCINATION_CONFIGS[0].reminderIntervals);

  // Initialize intervals when component mounts
  useEffect(() => {
    const config = VACCINATION_CONFIGS.find(config => config.name === type);
    if (config) {
      setAvailableIntervals(config.reminderIntervals);
      setSelectedInterval(config.reminderIntervals[0].id);
    }
  }, []);

  // Update intervals when vaccination type changes
  useEffect(() => {
    const config = VACCINATION_CONFIGS.find(config => config.name === type);
    if (config) {
      setAvailableIntervals(config.reminderIntervals);
      setSelectedInterval(config.reminderIntervals[0].id);
    }
  }, [type]);

  // Calculate next due date when date or interval changes
  useEffect(() => {
    if (dateAdministered && selectedInterval) {
      const interval = availableIntervals.find(i => i.id === selectedInterval);
      if (interval) {
        const date = new Date(dateAdministered);
        date.setDate(date.getDate() + interval.days);
        setNextDueDate(date.toISOString().split('T')[0]);
      }
    }
  }, [dateAdministered, selectedInterval, availableIntervals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInterval) {
      alert('Please select a reminder interval');
      return;
    }

    if (!nextDueDate) {
      alert('Error calculating next due date');
      return;
    }

    const interval = availableIntervals.find(i => i.id === selectedInterval);
    if (!interval) {
      alert('Invalid interval selected');
      return;
    }

    // Create vaccination data with the correct interval format
    const vaccinationData = {
      petId,
      type,
      dateAdministered,
      nextDueDate,
      notes: notes || undefined,
      reminderInterval: interval.label,
      selectedInterval: interval.id
    };

    try {
      await addVaccination(vaccinationData);
      // Close the form after successful submission
      onClose();
    } catch (error) {
      console.error('Failed to add vaccination:', error);
    }

    // Reset form
    setType('Anti-fleas');
    setDateAdministered(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  // Find the pet name for display
  const pet = pets.find(p => p.id === petId);
  const petName = pet ? pet.name : 'Unknown Pet';

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Add Vaccination for {petName}</h2>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Back to Dashboard
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vaccinationType">
            Vaccination Type
          </label>
          <select
            id="vaccinationType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={type}
            onChange={(e) => setType(e.target.value as VaccinationType)}
            required
          >
            {VACCINATION_CONFIGS.map((config: VaccinationConfig) => (
              <option key={config.name} value={config.name}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateAdministered">
            Date Administered
          </label>
          <input
            id="dateAdministered"
            type="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={dateAdministered}
            onChange={(e) => setDateAdministered(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reminderInterval">
            Reminder Interval
          </label>
          <select
            id="reminderInterval"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedInterval}
            onChange={(e) => setSelectedInterval(e.target.value)}
            required
          >
            {availableIntervals.map((interval) => (
              <option key={interval.id} value={interval.id}>
                {interval.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nextDueDate">
            Next Due Date
          </label>
          <input
            id="nextDueDate"
            type="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
            value={nextDueDate}
            readOnly
          />
          <p className="text-sm text-gray-500 mt-1">
            Calculated based on the selected interval
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Record Vaccination
          </button>
        </div>
      </form>
    </div>
  );
};

export default VaccinationForm; 