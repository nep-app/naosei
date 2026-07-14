import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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

  // Criar conta: alcunha (nome no fórum) + palavra-passe + EMAIL OPCIONAL.
  // Se der um email: a conta usa esse email real (permite recuperar a senha) e a
  //   pessoa entra com o email. O email fica privado, nunca aparece no fórum.
  // Se não der email: a conta usa um identificador técnico feito da alcunha e a
  //   pessoa entra com a alcunha (sem recuperação de senha).
  const signupAlias = async (aliasInput, password, email) => {
    const cleanAlias = String(aliasInput).trim().slice(0, 24);
    const realEmail = email && String(email).includes('@') ? String(email).trim() : null;
    const loginEmail = realEmail || aliasToHandle(cleanAlias);
    const cred = await createUserWithEmailAndPassword(auth, loginEmail, password);
    await setDoc(
      doc(db, 'naosei_profiles', cred.user.uid),
      { alias: cleanAlias, hasEmail: !!realEmail },
      { merge: true }
    );
    setAlias(cleanAlias);
    return cred;
  };

  // Entrar: aceita alcunha OU email (quem criou conta com email entra com o email).
  const loginAlias = (identifier, password) => {
    const id = String(identifier).trim();
    const loginEmail = id.includes('@') ? id : aliasToHandle(id);
    return signInWithEmailAndPassword(auth, loginEmail, password);
  };

  // Recuperar senha: só funciona para quem criou a conta com email.
  const resetPassword = (email) => sendPasswordResetEmail(auth, String(email).trim());

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, alias, isModerator, loading, signupAlias, loginAlias, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
