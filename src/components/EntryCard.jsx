import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { EMOTION_EN } from '../constants/emotions';
import { formatDateLabel } from '../helpers';

export function EntryCard({ entry, onDelete }) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const when = entry.ts ? formatDateLabel(entry.ts, i18n.language) : '';

  const isConsumption = entry.type === 'consumption';
  const emoLabel = (e) => (isEn ? EMOTION_EN[e] || e : e);

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (isConsumption ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300')}>
            {isConsumption ? <Icons.Activity className="w-5 h-5" /> : <Icons.Heart className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {isConsumption ? t('history.consumptionAt') : t('history.wellbeingAt')}
            </div>
            <div className="text-xs text-gray-400">{when}{isConsumption && entry.time ? ` · ${entry.time}` : ''}</div>
          </div>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(entry)} className="text-gray-500 hover:text-red-400 p-1">
            <Icons.Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-200 space-y-1.5">
        {isConsumption ? (
          <>
            {entry.dose != null && <div><span className="text-gray-400">{t('consumption.doseLabel')}: </span>{entry.dose} mg</div>}
            {entry.note && <div className="text-gray-300">{entry.note}</div>}
          </>
        ) : (
          <>
            <div className="flex gap-4">
              <span><span className="text-gray-400">{t('history.mood')}: </span>{entry.mood}/5</span>
              <span><span className="text-gray-400">{t('history.energy')}: </span>{entry.energy}/5</span>
            </div>
            {entry.emotions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {entry.emotions.map((e) => (
                  <span key={e} className="px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-200">{emoLabel(e)}</span>
                ))}
              </div>
            )}
            {entry.note && <div className="text-gray-300 pt-1">{entry.note}</div>}
          </>
        )}
      </div>
    </div>
  );
}
