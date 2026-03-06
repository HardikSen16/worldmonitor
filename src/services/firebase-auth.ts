import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';

interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
}

let firebaseApp: FirebaseApp | null = null;

function getConfigValue(key: string): string {
  const value = (import.meta as { env?: Record<string, unknown> }).env?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getFirebaseConfig(): FirebaseClientConfig {
  return {
    apiKey: getConfigValue('VITE_FIREBASE_API_KEY'),
    authDomain: getConfigValue('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getConfigValue('VITE_FIREBASE_PROJECT_ID'),
    appId: getConfigValue('VITE_FIREBASE_APP_ID'),
    messagingSenderId: getConfigValue('VITE_FIREBASE_MESSAGING_SENDER_ID') || undefined,
    storageBucket: getConfigValue('VITE_FIREBASE_STORAGE_BUCKET') || undefined,
  };
}

export function isFirebaseAuthConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseAuthConfigured()) {
    throw new Error('Firebase auth is not configured.');
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  }

  return firebaseApp;
}

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const currentUser = getFirebaseAuth().currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(forceRefresh);
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return result.user;
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  const user = result.user;
  if (displayName?.trim()) {
    await updateProfile(user, { displayName: displayName.trim() });
  }
  return user;
}
