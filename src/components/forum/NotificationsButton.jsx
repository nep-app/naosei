import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { Modal } from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { getMyNewReplies } from '../../data';
import { timeAgo } from '../../helpers';

const SEEN_KEY = 'nep_notif_seen';

// Sino de notificações: mostra ponto quando há respostas novas aos teus posts.
export function NotificationsButton({ onOpenPost }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const lastSeen = () => Number(localStorage.getItem(SEEN_KEY) || 0);

  // Ao montar, verifica se há respostas novas (para o ponto).
  useEffect(() => {
    if (!user) return;
    let active = true;
    getMyNewReplies(user.uid, lastSeen()).then((list) => {
      if (active) setHasNew(list.length > 0);
    }).catch(() => {});
    return () => { active = false; };
  }, [user]);

  const openPanel = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const list = await getMyNewReplies(user.uid, 0); // mostra as últimas, mesmo já vistas
      setItems(list.slice(0, 30));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
    // marca como visto agora
    localStorage.setItem(SEEN_KEY, String(Date.now()));
    setHasNew(false);
  };

  return (
    <>
      <button onClick={openPanel} className="relative p-2 rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" title={t('notif.title')}>
        <Icons.Bell className="w-5 h-5" />
        {hasNew && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border border-gray-900" />}
      </button>

      {open && (
        <Modal title={t('notif.title')} onClose={() => setOpen(false)}>
          {loading ? (
            <div className="text-gray-400 text-sm py-4 text-center">{t('common.loading')}</div>
          ) : items.length === 0 ? (
            <div className="text-gray-400 text-sm py-6 text-center">{t('notif.empty')}</div>
          ) : (
            <div className="space-y-2">
              {items.map(({ post, reply }) => (
                <button
                  key={reply.id}
                  onClick={() => { setOpen(false); onOpenPost(post); }}
                  className="w-full text-left bg-gray-900 border border-gray-700 rounded-xl p-3 hover:border-purple-600/50 transition-colors"
                >
                  <div className="text-xs text-gray-400 mb-1">
                    <span className="text-purple-300 font-medium">{reply.alias}</span> {t('notif.repliedTo')} “{post.title}”
                    <span className="text-gray-500 ml-1">· {timeAgo(reply.ts, t)}</span>
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-2">{reply.body}</p>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
