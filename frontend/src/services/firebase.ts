import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence 
} from 'firebase/auth';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase config
const isFirebaseConfigValid = Object.values(firebaseConfig).every(
  val => val && typeof val === 'string' && val.length > 0
);

if (!isFirebaseConfigValid) {
  console.error('❌ Firebase configuration is incomplete!');
  console.error('Please create frontend/.env.local with Firebase credentials.');
  console.error('See FIREBASE_SETUP.md for instructions.');
}

// Initialize Firebase
let app;
let authInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  authInitialized = true;
} catch (err) {
  console.error('Failed to initialize Firebase:', err);
}

// Initialize Auth with local persistence
export let auth: any = null;

if (authInitialized && app) {
  auth = getAuth(app);
  
  // Set persistence to LOCAL so user stays logged in after reload
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.warn('Failed to set auth persistence:', err);
  });
}

/**
 * Register a new user with Firebase
 */
export async function registerWithFirebase(email: string, password: string): Promise<User> {
  if (!auth || !authInitialized) {
    throw new Error('Firebase is not initialized. Please check your configuration.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Login existing user with Firebase
 */
export async function loginWithFirebase(email: string, password: string): Promise<User> {
  if (!auth || !authInitialized) {
    throw new Error('Firebase is not initialized. Please check your configuration.');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (!auth || !authInitialized) {
    throw new Error('Firebase is not initialized.');
  }
  await firebaseSignOut(auth);
}

/**
 * Get current user's ID token for API requests
 */
export async function getIdToken(): Promise<string> {
  if (!auth || !authInitialized) {
    throw new Error('Firebase is not initialized.');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  return await user.getIdToken();
}

export default app;
