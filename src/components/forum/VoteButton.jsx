import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeVotes, toggleVote, addActivity } from '../../data';

// Botão de "apoio" (voto positivo). Mostra a contagem e se a pessoa já apoiou.
// onCount (opcional) informa o componente-pai da contagem (para ordenar respostas).
// activity (opcional): { forUid, targetKind, targetId, targetTitle } para avisar o autor.
export function VoteButton({ postId, size = 'md', onCount, activity }) {
  const { t } = useTranslation();
  const { user, alias } = useAuth();
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const onCountRef = useRef(onCount);
  onCountRef.current = onCount;

  useEffect(() => {
    const unsub = subscribeVotes(postId, (n, ids) => {
      setCount(n);
      setVoted(ids.includes(`${postId}__${user.uid}`));
      if (onCountRef.current) onCountRef.current(n);
    });
    return unsub;
  }, [postId, user.uid]);

  const onClick = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const added = await toggleVote(postId, user.uid);
      if (added && activity) {
        addActivity(user.uid, alias, { forUid: activity.forUid, type: 'like', ...activity });
      }
    } finally {
      setBusy(false);
    }
  };

  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all ' + pad + ' ' +
        (voted ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-transparent')
      }
      title={voted ? t('forum.supported') : t('forum.support')}
    >
      <Icons.Heart className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {count > 0 ? count : ''} <span className={count > 0 ? 'sr-only' : ''}>{count === 0 ? t('forum.support') : ''}</span>
    </button>
  );
}
