import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { getTopProfiles } from '../../data';

// "Em destaque": as 3 pessoas com mais apoios recebidos. SEM mostrar números,
// e a ordem entre elas troca aleatoriamente (não é um ranking rígido).
export function LeaderboardCard({ onOpenProfile }) {
  const { t } = useTranslation();
  const [top, setTop] = useState([]);

  useEffect(() => {
    let active = true;
    getTopProfiles(3).then((list) => {
      if (!active) return;
      // baralha a ordem
      const arr = [...list];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setTop(arr);
    });
    return () => { active = false; };
  }, []);

  if (top.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-700/40 rounded-2xl p-4 mb-4">
      <div className="text-sm font-semibold text-white">{t('leaderboard.title')}</div>
      <p className="text-xs text-gray-400 mb-3">{t('leaderboard.subtitle')}</p>
      <div className="flex flex-wrap gap-2">
        {top.map((p) => (
          <button
            key={p.uid}
            onClick={() => onOpenProfile && onOpenProfile(p.uid, p.alias)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/70 border border-gray-700 hover:border-purple-500/50 transition-all"
          >
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {(p.alias || '?').slice(0, 1).toUpperCase()}
            </span>
            <span className="text-sm text-gray-100">{p.alias}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
