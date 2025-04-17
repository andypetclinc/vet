import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  DocumentData,
  FirestoreError 
} from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDo_V-kzFDQoJLhzcOgimxo_vYjAC1cFxo",
    authDomain: "vet-clinic-fd4db.firebaseapp.com",
    projectId: "vet-clinic-fd4db",
    storageBucket: "vet-clinic-fd4db.firebasestorage.app",
    messagingSenderId: "242204740158",
    appId: "1:242204740158:web:b833192e9435f0ac57df6f",
    measurementId: "G-FW9WBRJ69X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Error handling helper
export const handleFirestoreError = (error: FirestoreError): string => {
  console.error('Firestore error:', error);
  
  switch (error.code) {
    case 'permission-denied':
      return 'Permission denied. You don\'t have access to perform this operation.';
    case 'not-found':
      return 'The requested document was not found.';
    case 'already-exists':
      return 'The document already exists.';
    case 'resource-exhausted':
      return 'Quota exceeded or rate limit reached.';
    case 'cancelled':
      return 'The operation was cancelled.';
    case 'invalid-argument':
      return 'Invalid argument provided.';
    default:
      return `An error occurred: ${error.message}`;
  }
}; 