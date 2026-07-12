import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth } from '../contexts/AuthContext';
import { subscribeEntries } from '../data';
import { ConsumptionModal } from '../components/ConsumptionModal';
import { WellbeingModal } from '../components/WellbeingModal';
import { EntryCard } from '../components/EntryCard';

export function HomeView({ showToast }) {
  const { t } = useTranslation();
  const { user, alias } = useAuth();
  const [entries, setEntries] = useState([]);
  const [showConsumption, setShowConsumption] = useState(false);
  const [showWellbeing, setShowWellbeing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEntries(user.uid, setEntries);
    return unsub;
  }, [user]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayEntries = entries.filter((e) => (e.ts || 0) >= startOfToday.getTime());

  const name = alias || (user?.email ? user.email.split('@')[0] : '');

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {t('home.greeting')}{name ? `, ${name}` : ''} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
          <Icons.Shield className="w-4 h-4 text-purple-400" /> {t('home.private')}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowConsumption(true)}
          className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-4 text-left text-white hover:from-purple-600 hover:to-blue-600 transition-all"
        >
          <Icons.Plus className="w-6 h-6 mb-2" />
          <div className="font-semibold">{t('home.logConsumption')}</div>
        </button>
        <button
          onClick={() => setShowWellbeing(true)}
          className="bg-gray-800 border border-gray-700 rounded-2xl p-4 text-left text-white hover:bg-gray-700 transition-all"
        >
          <Icons.Heart className="w-6 h-6 mb-2 text-blue-300" />
          <div className="font-semibold">{t('home.logWellbeing')}</div>
        </button>
      </div>

      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('home.todayTitle')}</h2>
      {todayEntries.length === 0 ? (
        <div className="bg-gray-800/60 border border-dashed border-gray-700 rounded-2xl p-6 text-center text-gray-400 text-sm">
          {t('home.noEntries')}
        </div>
      ) : (
        <div className="space-y-3">
          {todayEntries.map((e) => <EntryCard key={e.id} entry={e} />)}
        </div>
      )}

      {showConsumption && <ConsumptionModal onClose={() => setShowConsumption(false)} showToast={showToast} />}
      {showWellbeing && <WellbeingModal onClose={() => setShowWellbeing(false)} showToast={showToast} />}
    </div>
  );
}
