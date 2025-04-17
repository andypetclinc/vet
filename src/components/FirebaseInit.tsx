import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import LoadingSpinner from './LoadingSpinner';

interface FirebaseInitProps {
  children: React.ReactNode;
}

/**
 * Component that initializes Firebase when the app starts
 * It runs the database initialization and handles loading/error states
 */
const FirebaseInit: React.FC<FirebaseInitProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Initialize the database with sample data if needed
        await db.initialize();
        setIsInitialized(true);
      } catch (err: any) {
        console.error('Failed to initialize Firebase:', err);
        setError(err.message || 'Failed to initialize Firebase');
      } finally {
        setIsLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Initializing app..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold text-lg mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">
            Please check your Firebase configuration and try again.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FirebaseInit; 