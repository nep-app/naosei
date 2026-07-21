import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { Modal } from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeActivity } from '../../data';
import { timeAgo } from '../../helpers';

const SEEN_KEY = 'nep_notif_seen';

// Sino de avisos: respostas, apoios e guardados no teu conteúdo.
export function NotificationsButton({ onOpenPost }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeActivity(user.uid, (list) => setItems(list.slice(0, 40)));
    return unsub;
  }, [user]);

  const lastSeen = Number(localStorage.getItem(SEEN_KEY) || 0);
  const hasNew = items.some((i) => (i.ts || 0) > lastSeen);

  const openPanel = () => {
    setOpen(true);
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  };

  const lineFor = (a) => {
    const what = a.targetKind === 'reply' ? t('notif.whatReply') : t('notif.whatPost');
    if (a.type === 'reply') return t('notif.reply', { alias: a.actorAlias || '—', title: a.targetTitle });
    if (a.type === 'like') return t('notif.like', { alias: a.actorAlias || '—', what });
    return t('notif.save', { title: a.targetTitle }); // save → anónimo
  };

  const iconFor = (type) =>
    type === 'reply' ? Icons.MessageSquare : type === 'save' ? Icons.Bookmark : Icons.Heart;

  return (
    <>
      <button onClick={openPanel} className="relative p-2 rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors" title={t('notif.title')}>
        <Icons.Bell className="w-5 h-5" />
        {hasNew && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border border-gray-900" />}
      </button>

      {open && (
        <Modal title={t('notif.title')} onClose={() => setOpen(false)}>
          {items.length === 0 ? (
            <div className="text-gray-400 text-sm py-6 text-center">{t('notif.empty')}</div>
          ) : (
            <div className="space-y-2">
              {items.map((a) => {
                const Icon = iconFor(a.type);
                return (
                  <div
                    key={a.id}
                    className="w-full text-left bg-gray-900 border border-gray-700 rounded-xl p-3 flex items-start gap-2"
                  >
                    <Icon className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" filled />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200">{lineFor(a)}</p>
                      <span className="text-xs text-gray-500">{timeAgo(a.ts, t)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
