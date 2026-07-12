import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth } from '../contexts/AuthContext';

export function SettingsView({ showToast }) {
  const { t, i18n } = useTranslation();
  const { user, alias, logout, saveAlias } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(alias || '');

  const changeLang = (lang) => { i18n.changeLanguage(lang); localStorage.setItem('nep_lang', lang); };

  const commitAlias = async () => {
    if (!draft.trim()) return;
    await saveAlias(draft.trim());
    setEditing(false);
    showToast('OK', 'success');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-5">{t('settings.title')}</h1>

      <div className="space-y-4">
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">{t('settings.signedInAs')}</div>
          <div className="text-white font-medium break-all">{user?.email || '—'}</div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-2">{t('settings.aliasInForum')}</div>
          {editing ? (
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={24}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button onClick={commitAlias} className="px-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium">
                <Icons.Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-white font-medium">{alias || '—'}</div>
              <button onClick={() => { setDraft(alias || ''); setEditing(true); }} className="text-purple-400 text-sm hover:text-purple-300">
                {t('forum.aliasChange')}
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-2">{t('settings.language')}</div>
          <div className="flex gap-2">
            <button onClick={() => changeLang('pt')} className={'px-4 py-2 rounded-lg text-sm font-medium ' + (i18n.language === 'pt' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300')}>Português</button>
            <button onClick={() => changeLang('en')} className={'px-4 py-2 rounded-lg text-sm font-medium ' + (i18n.language === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300')}>English</button>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-700/50 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Icons.Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-purple-200 mb-1">{t('settings.privacyTitle')}</div>
              <p className="text-xs text-purple-300">{t('settings.privacyText')}</p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl bg-gray-800 border border-gray-700 text-red-300 font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <Icons.LogOut className="w-5 h-5" /> {t('settings.signOut')}
        </button>

        <p className="text-xs text-gray-500 text-center pt-2">{t('settings.copyright')}</p>
      </div>
    </div>
  );
}
