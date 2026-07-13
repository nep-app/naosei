// ===== CAMADA DE DADOS (Firestore) =====
// Duas zonas, com regras de segurança diferentes (ver firestore.rules):
//  - Pessoal (privado do dono):  naosei_users/{uid}/entries/*
//  - Fórum (partilhado, anónimo): naosei_forum_posts/*, replies, naosei_forum_votes/*

import {
  collection, doc, addDoc, deleteDoc, setDoc, getDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------- PESSOAL (privado) ----------

export function subscribeEntries(uid, cb) {
  const q = query(
    collection(db, 'naosei_users', uid, 'entries'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function addEntry(uid, data) {
  return addDoc(collection(db, 'naosei_users', uid, 'entries'), {
    ...data,
    createdAt: serverTimestamp(),
    ts: Date.now(),
  });
}

export function deleteEntry(uid, id) {
  return deleteDoc(doc(db, 'naosei_users', uid, 'entries', id));
}

// ---------- FÓRUM (partilhado, anónimo) ----------

export function subscribePosts(theme, cb) {
  const col = collection(db, 'naosei_forum_posts');
  const q = theme && theme !== 'all'
    ? query(col, where('theme', '==', theme), orderBy('createdAt', 'desc'))
    : query(col, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function addPost(uid, alias, { theme, title, body, isQuestion }) {
  return addDoc(collection(db, 'naosei_forum_posts'), {
    authorUid: uid,
    alias,
    theme,
    title: title.trim().slice(0, 140),
    body: body.trim().slice(0, 5000),
    isQuestion: !!isQuestion,
    createdAt: serverTimestamp(),
    ts: Date.now(),
  });
}

export function deletePost(id) {
  return deleteDoc(doc(db, 'naosei_forum_posts', id));
}

export function subscribeReplies(postId, cb) {
  const q = query(
    collection(db, 'naosei_forum_posts', postId, 'replies'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function addReply(postId, uid, alias, body) {
  return addDoc(collection(db, 'naosei_forum_posts', postId, 'replies'), {
    authorUid: uid,
    alias,
    body: body.trim().slice(0, 3000),
    createdAt: serverTimestamp(),
    ts: Date.now(),
  });
}

// Votos: um documento por (post, utilizador). Só existe o voto positivo.
// ID = `${postId}__${uid}` garante 1 voto por pessoa por publicação.
export function subscribeVotes(postId, cb) {
  const q = query(collection(db, 'naosei_forum_votes'), where('postId', '==', postId));
  return onSnapshot(q, (snap) => cb(snap.size, snap.docs.map((d) => d.id)));
}

// Denúncias: qualquer pessoa autenticada pode sinalizar uma mensagem.
// Só os moderadores leem/gerem (ver firestore.rules).
export function reportContent(uid, { postId, replyId = null, kind }) {
  return addDoc(collection(db, 'naosei_forum_reports'), {
    reporterUid: uid,
    postId,
    replyId,
    kind, // 'post' | 'reply'
    createdAt: serverTimestamp(),
    ts: Date.now(),
    status: 'open',
  });
}

export async function toggleVote(postId, uid) {
  const ref = doc(db, 'naosei_forum_votes', `${postId}__${uid}`);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { postId, uid, createdAt: serverTimestamp() });
  return true;
}
