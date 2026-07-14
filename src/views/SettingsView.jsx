import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth } from '../contexts/AuthContext';

export function SettingsView() {
  const { t, i18n } = useTranslation();
  const { alias, isModerator, logout } = useAuth();

  const changeLang = (lang) => { i18n.changeLanguage(lang); localStorage.setItem('nep_lang', lang); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-5">{t('settings.title')}</h1>

      <div className="space-y-4">
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">{t('settings.aliasInForum')}</div>
          <div className="flex items-center gap-2">
            <div className="text-white font-medium break-all">{alias || '—'}</div>
            {isModerator && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 inline-flex items-center gap-1">
                <Icons.Shield className="w-3 h-3" /> {t('forum.moderatorBadge')}
              </span>
            )}
          </div>
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
