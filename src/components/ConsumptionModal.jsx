import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { addEntry } from '../data';
import { currentTimeHHMM } from '../helpers';

export function ConsumptionModal({ onClose, showToast }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dose, setDose] = useState('');
  const [time, setTime] = useState(currentTimeHHMM());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await addEntry(user.uid, {
        type: 'consumption',
        dose: dose ? parseFloat(dose) : null,
        time,
        note: note.trim(),
      });
      showToast(t('consumption.saved'), 'success');
      onClose();
    } catch (e) {
      showToast(t('common.error'), 'error');
      setSaving(false);
    }
  };

  return (
    <Modal title={t('consumption.title')} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('consumption.doseLabel')}</label>
          <input
            type="number"
            inputMode="decimal"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder={t('consumption.dosePlaceholder')}
            className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('consumption.timeLabel')}</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('consumption.noteLabel')}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('consumption.notePlaceholder')}
            rows={3}
            className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-200 font-medium hover:bg-gray-600 transition-colors">
            {t('consumption.cancel')}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-60"
          >
            {t('consumption.save')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
