import { FirestoreError } from 'firebase/firestore';

/**
 * Get user-friendly error message from Firestore error
 * @param error The error object from Firestore
 * @returns A human-readable error message
 */
export const getFirestoreErrorMessage = (error: FirestoreError | Error | unknown): string => {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // Check if it's a Firestore error
  if ((error as FirestoreError).code) {
    const firestoreError = error as FirestoreError;
    
    switch (firestoreError.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action';
      case 'not-found':
        return 'The requested document was not found';
      case 'already-exists': 
        return 'This record already exists';
      case 'resource-exhausted':
        return 'Too many requests. Please try again later';
      case 'unavailable':
        return 'The service is temporarily unavailable. Please check your internet connection';
      case 'cancelled':
        return 'The operation was cancelled';
      default:
        return firestoreError.message || 'An error occurred with the database';
    }
  } 
  
  // Regular error objects
  if ((error as Error).message) {
    return (error as Error).message;
  }
  
  // If all else fails, convert to string
  return String(error);
};

/**
 * Shows an alert with a user-friendly error message
 * @param error The error object
 * @param action What action was being performed (e.g., "adding a pet")
 */
export const showErrorAlert = (error: unknown, action?: string): void => {
  const baseMessage = action ? `Error ${action}` : 'An error occurred';
  const errorMessage = getFirestoreErrorMessage(error);
  
  alert(`${baseMessage}: ${errorMessage}`);
}; 