import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { subscribeEntries, deleteEntry } from '../data';
import { EntryCard } from '../components/EntryCard';

export function HistoryView({ showToast }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEntries(user.uid, setEntries);
    return unsub;
  }, [user]);

  const handleDelete = async (entry) => {
    if (!window.confirm(t('history.deleteConfirm'))) return;
    try {
      await deleteEntry(user.uid, entry.id);
      showToast(t('consumption.deleted'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-5">{t('history.title')}</h1>
      {entries.length === 0 ? (
        <div className="bg-gray-800/60 border border-dashed border-gray-700 rounded-2xl p-6 text-center text-gray-400 text-sm">
          {t('history.empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => <EntryCard key={e.id} entry={e} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
