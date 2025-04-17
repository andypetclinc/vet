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
  connectFirestoreEmulator,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from 'firebase/firestore';

// Your web app's Firebase configuration
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

// ✅ Modern and correct Firestore init with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ 
    tabManager: persistentSingleTabManager({ forceOwnership: true }),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED 
  })
});

// ✅ Optional: Uncomment to use Firebase local emulator
if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('Using Firestore emulator');
}

// ✅ Enhanced error handling helper with specific handling for quota exceeded errors
export const handleFirestoreError = (error: FirestoreError): string => {
  console.error('Firestore error:', error);

  if (error.code === 'resource-exhausted') {
    console.error('Firebase quota exceeded:', {
      message: error.message,
      details: 'You have reached your Firestore usage quota. Consider upgrading to Blaze plan or implementing caching strategies.'
    });
  }
  
  switch (error.code) {
    case 'permission-denied':
      return 'Permission denied. You don\'t have access to perform this operation.';
    case 'not-found':
      return 'The requested document was not found.';
    case 'already-exists':
      return 'The document already exists.';
    case 'resource-exhausted':
      return 'Quota exceeded or rate limit reached. Please try again later or implement caching.';
    case 'unavailable':
      return 'The service is currently unavailable. This may be due to network issues or service outages.';
    case 'cancelled':
      return 'The operation was cancelled.';
    case 'invalid-argument':
      return 'Invalid argument provided.';
    case 'deadline-exceeded':
      return 'The operation took too long to complete.';
    case 'unknown':
      if (error.message.includes('QUOTA_BYTES')) {
        return 'Storage quota exceeded. Please reduce the size of your data or implement pagination.';
      } else if (error.message.includes('channel')) {
        return 'Connection issue with Firestore. Please check your network connection or try again later.';
      }
      return `Unknown error: ${error.message}`;
    default:
      return `An error occurred: ${error.message}`;
  }
};
