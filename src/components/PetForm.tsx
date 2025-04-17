import React, { useState } from 'react';
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
    }
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
            placeholder="Enter a unique pet ID"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petName">
            Pet Name
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petType">
            Pet Species
          </label>
          <select
            id="petType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={species}
            onChange={(e) => setSpecies(e.target.value as PetType)}
            required
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petAge">
            Age
          </label>
          <input
            id="petAge"
            type="number"
            min="0"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petWeight">
            Weight (lbs)
          </label>
          <input
            id="petWeight"
            type="number"
            min="0"
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petOwner">
            Owner
          </label>
          <select
            id="petOwner"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
          >
            <option value="">Select Owner</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
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