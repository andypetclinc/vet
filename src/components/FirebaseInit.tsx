import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, limit } from 'firebase/firestore';
import LoadingSpinner from './LoadingSpinner';

interface FirebaseInitProps {
  children: React.ReactNode;
}

const FirebaseInit: React.FC<FirebaseInitProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Firestore is already initialized in firebase.ts
    // We just need to verify the connection
    const verifyConnection = async () => {
      try {
        // Try to get a document to verify connection
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Firebase connection error:', err);
        setError(err.message || 'Failed to connect to Firebase');
        setIsLoading(false);
      }
    };

    verifyConnection();
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
