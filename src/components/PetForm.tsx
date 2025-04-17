import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PetType } from '../types';

const PetForm: React.FC = () => {
  const { addPet, owners } = useAppContext();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetType>('Dog');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [breed, setBreed] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter owners based on search term
  const filteredOwners = useMemo(() => {
    if (!ownerSearch) return owners;
    const searchTerm = ownerSearch.toLowerCase();
    return owners.filter(owner => 
      owner.name.toLowerCase().includes(searchTerm) ||
      owner.phone.toLowerCase().includes(searchTerm)
    );
  }, [owners, ownerSearch]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOwnerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.trim() && name.trim() && breed.trim() && ownerId && age && weight) {
      addPet({
        id,
        name,
        species,
        age: parseInt(age, 10),
        weight: parseFloat(weight),
        breed,
        ownerId
      });
      setId('');
      setName('');
      setSpecies('Dog');
      setAge('');
      setWeight('');
      setBreed('');
      setOwnerId('');
      setOwnerSearch('');
    }
  };

  const handleOwnerSelect = (ownerId: string, ownerName: string) => {
    setOwnerId(ownerId);
    setOwnerSearch(ownerName);
    setShowOwnerDropdown(false);
  };

  const toggleDropdown = () => {
    setShowOwnerDropdown(!showOwnerDropdown);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Pet</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petId">
            Pet ID
          </label>
          <input
            id="petId"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petName">
            Name
          </label>
          <input
            id="petName"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petSpecies">
            Species
          </label>
          <select
            id="petSpecies"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={species}
            onChange={(e) => setSpecies(e.target.value as PetType)}
            required
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petAge">
            Age
          </label>
          <input
            id="petAge"
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petWeight">
            Weight (kg)
          </label>
          <input
            id="petWeight"
            type="number"
            step="0.1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petBreed">
            Breed
          </label>
          <input
            id="petBreed"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            required
          />
        </div>
        <div className="mb-4 relative" ref={dropdownRef}>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petOwner">
            Owner
          </label>
          <div className="relative">
            <input
              id="petOwner"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              onClick={toggleDropdown}
              placeholder="Click to search owner by name or phone"
              required
            />
            {showOwnerDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredOwners.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500">No owners found</div>
                ) : (
                  filteredOwners.map((owner) => (
                    <div
                      key={owner.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleOwnerSelect(owner.id, owner.name)}
                    >
                      <div className="font-medium">{owner.name}</div>
                      <div className="text-sm text-gray-500">{owner.phone}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={owners.length === 0}
        >
          Add Pet
        </button>
        {owners.length === 0 && (
          <p className="text-red-500 text-sm mt-2">Please add an owner first</p>
        )}
      </form>
    </div>
  );
};

export default PetForm; 