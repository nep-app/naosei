import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeVotes, toggleVote } from '../../data';

// Botão de "apoio" (voto positivo). Mostra a contagem e se a pessoa já apoiou.
// onCount (opcional) informa o componente-pai da contagem (para ordenar respostas).
export function VoteButton({ postId, size = 'md', onCount }) {
  const { t } = useTranslation();
  const { user } = useAuth();
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
      await toggleVote(postId, user.uid);
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
