import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [alias, setAlias] = useState(null); // alcunha do fórum
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Vai buscar a alcunha guardada (perfil público do fórum) — se existir.
        try {
          const snap = await getDoc(doc(db, 'naosei_profiles', u.uid));
          setAlias(snap.exists() ? snap.data().alias || null : null);
        } catch {
          setAlias(null);
        }
      } else {
        setAlias(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signupEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginGoogle = () => signInWithPopup(auth, googleProvider);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);

  // Guarda a alcunha escolhida no perfil público (naosei_profiles/{uid}).
  const saveAlias = async (newAlias) => {
    if (!user) return;
    const clean = String(newAlias).trim().slice(0, 24);
    await setDoc(doc(db, 'naosei_profiles', user.uid), { alias: clean }, { merge: true });
    setAlias(clean);
  };

  return (
    <AuthContext.Provider
      value={{ user, alias, loading, loginEmail, signupEmail, loginGoogle, resetPassword, logout, saveAlias }}
    >
      {children}
    </AuthContext.Provider>
  );
}
