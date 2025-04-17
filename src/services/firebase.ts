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
  FirestoreError,
  connectFirestoreEmulator
} from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA8t7TsYz4wN86JuWq7k1GCaTpM1ixgI8I",
  authDomain: "vet-clinic-demo.firebaseapp.com",
  projectId: "vet-clinic-demo",
  storageBucket: "vet-clinic-demo.appspot.com",
  messagingSenderId: "901234567890",
  appId: "1:901234567890:web:0a1b2c3d4e5f6a7b8c9d0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Uncomment to use Firebase local emulator if needed
// if (window.location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   console.log('Using Firestore emulator');
// }

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