import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Entrada só com ALCUNHA + palavra-passe (sem email, sem Google).
// Truque: o Firebase precisa de um "email" interno, por isso transformamos a
// alcunha num identificador técnico (alcunha normalizada + domínio fixo). A pessoa
// NUNCA escreve nem vê um email — só a alcunha. Esse identificador nunca aparece
// no fórum.
const HANDLE_DOMAIN = 'users.nepforum.app';

export function aliasToHandle(alias) {
  const norm = String(alias)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${norm}@${HANDLE_DOMAIN}`;
}

export function aliasIsValid(alias) {
  const norm = String(alias).trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return norm.length >= 2;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [alias, setAlias] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'naosei_profiles', u.uid));
          setAlias(snap.exists() ? snap.data().alias || null : null);
        } catch {
          setAlias(null);
        }
        // É moderador se existir naosei_moderators/{uid} (criado na consola Firebase).
        try {
          const mod = await getDoc(doc(db, 'naosei_moderators', u.uid));
          setIsModerator(mod.exists());
        } catch {
          setIsModerator(false);
        }
      } else {
        setAlias(null);
        setIsModerator(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Criar conta: alcunha (nome no fórum) + palavra-passe.
  const signupAlias = async (aliasInput, password) => {
    const cleanAlias = String(aliasInput).trim().slice(0, 24);
    const cred = await createUserWithEmailAndPassword(auth, aliasToHandle(cleanAlias), password);
    await setDoc(doc(db, 'naosei_profiles', cred.user.uid), { alias: cleanAlias }, { merge: true });
    setAlias(cleanAlias);
    return cred;
  };

  // Entrar: mesma alcunha + palavra-passe.
  const loginAlias = (aliasInput, password) =>
    signInWithEmailAndPassword(auth, aliasToHandle(aliasInput), password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, alias, isModerator, loading, signupAlias, loginAlias, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
