import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import OwnerForm from './components/OwnerForm';
import PetForm from './components/PetForm';
import SearchBar from './components/SearchBar';
import PetList from './components/PetList';
import VaccinationDashboard from './components/VaccinationDashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'vaccinations'>('management');

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6">
        <div className="relative max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
              Veterinary Clinic Management
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Manage pet owners, pets, and vaccination schedules with ease
            </p>
          </header>

          {/* Tab navigation - enhanced with shadow and animations */}
          <div className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('management')}
                className={`flex-1 py-4 px-6 text-center transition-all duration-200 ease-in-out ${
                  activeTab === 'management'
                    ? 'bg-white text-blue-600 font-medium border-b-2 border-blue-500'
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Pet Management
                </div>
              </button>
              <button
                onClick={() => setActiveTab('vaccinations')}
                className={`flex-1 py-4 px-6 text-center transition-all duration-200 ease-in-out ${
                  activeTab === 'vaccinations'
                    ? 'bg-white text-blue-600 font-medium border-b-2 border-blue-500'
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Vaccination Dashboard
                </div>
              </button>
            </nav>
          </div>
          
          <div className="transition-opacity duration-300 ease-in-out">
            {activeTab === 'management' ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <OwnerForm />
                  <PetForm />
                </div>
                
                <SearchBar />
                <PetList />
              </>
            ) : (
              <VaccinationDashboard />
            )}
          </div>
          
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Andy Pet Clinic. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </AppProvider>
  );
};

export default App; 