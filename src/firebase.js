// ===== CONFIGURAÇÃO FIREBASE =====
// Projeto Firebase PRÓPRIO do fórum "naosei" (naosei-7faff), separado da NEP App.
// Assim o fórum público fica completamente isolado dos dados privados da app.
// Estas chaves são públicas (normal em apps de navegador). A proteção real vem das
// Firestore Security Rules (ficheiro firestore.rules).

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDtMZv3zvXE14Mu3HxCKxH7naZ5v3V4TY4",
  authDomain: "naosei-7faff.firebaseapp.com",
  projectId: "naosei-7faff",
  storageBucket: "naosei-7faff.firebasestorage.app",
  messagingSenderId: "587858880147",
  appId: "1:587858880147:web:a39e7eab067e1e4c5ccf66",
  measurementId: "G-313520MNPT"
};

export function getFirebaseApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

export const auth = getAuth(getFirebaseApp());
export const db = getFirestore(getFirebaseApp());
export const googleProvider = new GoogleAuthProvider();
