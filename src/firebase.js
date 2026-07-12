// ===== CONFIGURAÇÃO FIREBASE =====
// Mesmo projeto Firebase da NEP App, para que a CONTA seja a mesma nos dois sítios.
// Estas chaves são públicas (normal em apps de navegador). A proteção real vem das
// Firestore Security Rules (ficheiro firestore.rules) — cada pessoa só vê os seus dados.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDH8-OZZQPHzWOnkcABi0tWbeFpxSrnc0w",
  authDomain: "harm-reduction-d4f7d.firebaseapp.com",
  projectId: "harm-reduction-d4f7d",
  storageBucket: "harm-reduction-d4f7d.firebasestorage.app",
  messagingSenderId: "732077932839",
  appId: "1:732077932839:web:894f098ab346d79e462902"
};

export function getFirebaseApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

export const auth = getAuth(getFirebaseApp());
export const db = getFirestore(getFirebaseApp());
export const googleProvider = new GoogleAuthProvider();
