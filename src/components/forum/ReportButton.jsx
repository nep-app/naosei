import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { reportContent } from '../../data';

// Botão discreto para sinalizar uma mensagem aos moderadores.
export function ReportButton({ postId, replyId = null, kind }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [done, setDone] = useState(false);

  const onClick = async () => {
    if (done) return;
    if (!window.confirm(t('forum.reportConfirm'))) return;
    try {
      await reportContent(user.uid, { postId, replyId, kind });
      setDone(true);
    } catch {
      /* silencioso */
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={done}
      className={'text-xs inline-flex items-center gap-1 ' + (done ? 'text-green-400' : 'text-gray-500 hover:text-gray-300')}
      title={t('forum.report')}
    >
      <Icons.AlertTriangle className="w-3.5 h-3.5" />
      {done ? t('forum.reported') : t('forum.report')}
    </button>
  );
}
