import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { addEntry } from '../data';
import { EMOTIONS_LIST, EMOTION_EN } from '../constants/emotions';

export function WellbeingModal({ onClose, showToast }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [emotions, setEmotions] = useState([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const isEn = i18n.language === 'en';
  const label = (emo) => (isEn ? EMOTION_EN[emo] || emo : emo);

  const toggleEmotion = (emo) => {
    setEmotions((cur) => (cur.includes(emo) ? cur.filter((x) => x !== emo) : [...cur, emo]));
  };

  const save = async () => {
    setSaving(true);
    try {
      await addEntry(user.uid, {
        type: 'wellbeing',
        mood: Number(mood),
        energy: Number(energy),
        emotions,
        note: note.trim(),
      });
      showToast(t('wellbeing.saved'), 'success');
      onClose();
    } catch (e) {
      showToast(t('common.error'), 'error');
      setSaving(false);
    }
  };

  return (
    <Modal title={t('wellbeing.title')} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('wellbeing.moodLabel', { value: mood })}</label>
          <input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('wellbeing.energyLabel', { value: energy })}</label>
          <input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(e.target.value)} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('wellbeing.emotionsLabel')}</label>
          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
            {EMOTIONS_LIST.map((emo) => {
              const active = emotions.includes(emo);
              return (
                <button
                  key={emo}
                  onClick={() => toggleEmotion(emo)}
                  className={
                    'px-3 py-1.5 rounded-full text-sm transition-all ' +
                    (active
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600')
                  }
                >
                  {label(emo)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('wellbeing.noteLabel')}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('wellbeing.notePlaceholder')}
            rows={3}
            className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-200 font-medium hover:bg-gray-600 transition-colors">
            {t('wellbeing.cancel')}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-60"
          >
            {t('wellbeing.save')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
