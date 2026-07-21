// ===== CAMADA DE DADOS (Firestore) =====
// Duas zonas, com regras de segurança diferentes (ver firestore.rules):
//  - Pessoal (privado do dono):  naosei_users/{uid}/entries/*
//  - Fórum (partilhado, anónimo): naosei_forum_posts/*, replies, naosei_forum_votes/*

import {
  collection, doc, addDoc, deleteDoc, setDoc, getDoc, getDocs, updateDoc,
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

// ---------- PERFIL (alcunha + bio + "o que te traz aqui") ----------
export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'naosei_profiles', uid));
  return snap.exists() ? snap.data() : null;
}
export function saveProfile(uid, { alias, bio, reason, doc: docList, roa }) {
  return setDoc(
    doc(db, 'naosei_profiles', uid),
    {
      alias,
      bio: (bio || '').slice(0, 300),
      reason: reason || '',
      doc: Array.isArray(docList) ? docList.slice(0, 20) : [],
      roa: Array.isArray(roa) ? roa.slice(0, 20) : [],
    },
    { merge: true }
  );
}

// ---------- NOTIFICAÇÕES: novas respostas aos meus posts ----------
// Busca (uma vez) as respostas a publicações minhas mais recentes que `sinceTs`,
// feitas por outra pessoa. Devolve [{ post, reply }] mais recentes primeiro.
export async function getMyNewReplies(uid, sinceTs) {
  const postsSnap = await getDocs(
    query(collection(db, 'naosei_forum_posts'), where('authorUid', '==', uid))
  );
  const out = [];
  for (const pdoc of postsSnap.docs) {
    const post = { id: pdoc.id, ...pdoc.data() };
    const repSnap = await getDocs(collection(db, 'naosei_forum_posts', post.id, 'replies'));
    repSnap.forEach((rdoc) => {
      const reply = { id: rdoc.id, ...rdoc.data() };
      if ((reply.ts || 0) > (sinceTs || 0) && reply.authorUid !== uid) {
        out.push({ post, reply });
      }
    });
  }
  out.sort((a, b) => (b.reply.ts || 0) - (a.reply.ts || 0));
  return out;
}

// ---------- MENSAGENS PRIVADAS (DMs) ----------
// Conversa entre 2 pessoas. ID determinístico = uids ordenados juntos.
export function convIdFor(a, b) {
  return [a, b].sort().join('__');
}

export async function startConversation(me, meAlias, other, otherAlias) {
  const id = convIdFor(me, other);
  const ref = doc(db, 'naosei_dms', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [me, other],
      aliases: { [me]: meAlias, [other]: otherAlias },
      lastMessage: '',
      lastTs: Date.now(),
      lastSender: '',
    });
  }
  return id;
}

export function subscribeConversations(uid, cb) {
  const q = query(collection(db, 'naosei_dms'), where('participants', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
    cb(list);
  });
}

export function subscribeMessages(convId, cb) {
  const q = query(collection(db, 'naosei_dms', convId, 'messages'), orderBy('ts', 'asc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function sendMessage(convId, senderUid, senderAlias, body) {
  const text = body.trim().slice(0, 3000);
  await addDoc(collection(db, 'naosei_dms', convId, 'messages'), {
    senderUid, senderAlias, body: text, ts: Date.now(), createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'naosei_dms', convId), {
    lastMessage: text, lastTs: Date.now(), lastSender: senderUid,
  });
}

// Bloqueios (privado do dono). Bloquear alguém impede-o de te escrever (regras).
export function subscribeBlocks(uid, cb) {
  return onSnapshot(collection(db, 'naosei_users', uid, 'blocks'), (snap) => cb(snap.docs.map((d) => d.id)));
}
export function blockUser(uid, otherUid) {
  return setDoc(doc(db, 'naosei_users', uid, 'blocks', otherUid), { ts: Date.now() });
}
export function unblockUser(uid, otherUid) {
  return deleteDoc(doc(db, 'naosei_users', uid, 'blocks', otherUid));
}

// Denunciar uma pessoa/conversa (partilha a última mensagem para os moderadores verem).
export function reportUser(reporterUid, { reportedUid, convId, sample }) {
  return addDoc(collection(db, 'naosei_forum_reports'), {
    kind: 'dm', reporterUid, reportedUid, convId,
    sample: (sample || '').slice(0, 500),
    createdAt: serverTimestamp(), ts: Date.now(), status: 'open',
  });
}

// ---------- DENÚNCIAS (moderadores) ----------
export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'naosei_forum_posts', postId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getReply(postId, replyId) {
  const snap = await getDoc(doc(db, 'naosei_forum_posts', postId, 'replies', replyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export function subscribeReports(cb) {
  const q = query(collection(db, 'naosei_forum_reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
export function resolveReport(reportId) {
  return deleteDoc(doc(db, 'naosei_forum_reports', reportId));
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

// Editar a própria publicação (título/corpo).
export function updatePost(id, { title, body }) {
  return updateDoc(doc(db, 'naosei_forum_posts', id), {
    title: title.trim().slice(0, 140),
    body: body.trim().slice(0, 5000),
    editedAt: Date.now(),
  });
}

// Fixar/desafixar (moderadores).
export function setPostPinned(id, pinned) {
  return updateDoc(doc(db, 'naosei_forum_posts', id), { pinned: !!pinned });
}

// ---------- Guardados (favoritos) — privado do dono ----------
export function subscribeBookmarks(uid, cb) {
  return onSnapshot(collection(db, 'naosei_users', uid, 'bookmarks'), (snap) => {
    cb(snap.docs.map((d) => d.id));
  });
}
export function addBookmark(uid, postId) {
  return setDoc(doc(db, 'naosei_users', uid, 'bookmarks', postId), { ts: Date.now() });
}
export function removeBookmark(uid, postId) {
  return deleteDoc(doc(db, 'naosei_users', uid, 'bookmarks', postId));
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

export function deleteReply(postId, replyId) {
  return deleteDoc(doc(db, 'naosei_forum_posts', postId, 'replies', replyId));
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
