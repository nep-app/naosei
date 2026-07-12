import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { useAuth } from '../../contexts/AuthContext';

// Primeira vez no fórum: escolher a alcunha antes de poder participar.
export function AliasGate() {
  const { t } = useTranslation();
  const { saveAlias } = useAuth();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await saveAlias(value.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Icons.Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('forum.chooseAliasTitle')}</h1>
        <p className="text-sm text-gray-400">{t('forum.chooseAliasText')}</p>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        maxLength={24}
        placeholder={t('forum.aliasPlaceholder')}
        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
      />
      <button
        onClick={submit}
        disabled={saving || !value.trim()}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
      >
        {t('forum.aliasSave')}
      </button>
    </div>
  );
}
