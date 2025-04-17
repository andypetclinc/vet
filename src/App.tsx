import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import OwnerForm from './components/OwnerForm';
import PetForm from './components/PetForm';
import SearchBar from './components/SearchBar';
import PetList from './components/PetList';
import VaccinationDashboard from './components/VaccinationDashboard';
import AppContent from './components/AppContent';

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App; 