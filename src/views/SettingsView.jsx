import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, saveProfile } from '../data';
import { ReportsPanel } from '../components/forum/ReportsPanel';
import { DOC_OPTIONS, ROA_OPTIONS } from '../constants/profileOptions';

const REASONS = ['apoio', 'partilhar', 'duvidas', 'ajudar', 'ler'];

export function SettingsView({ showToast }) {
  const { t, i18n } = useTranslation();
  const { user, alias, isModerator, logout } = useAuth();

  const [bio, setBio] = useState('');
  const [reasonsSel, setReasonsSel] = useState([]);
  const [docSel, setDocSel] = useState([]);
  const [docOther, setDocOther] = useState('');
  const [roaSel, setRoaSel] = useState([]);
  const [roaOther, setRoaOther] = useState('');
  const [saving, setSaving] = useState(false);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => {
      if (p) {
        setBio(p.bio || '');
        setReasonsSel(p.reasons || (p.reason ? [p.reason] : []));
        setDocSel(p.doc || []); setDocOther(p.docOther || '');
        setRoaSel(p.roa || []); setRoaOther(p.roaOther || '');
      }
    });
  }, [user]);

  const toggle = (list, setList, key) =>
    setList(list.includes(key) ? list.filter((x) => x !== key) : [...list, key]);

  const changeLang = (lang) => { i18n.changeLanguage(lang); localStorage.setItem('nep_lang', lang); };

  const saveMyProfile = async () => {
    setSaving(true);
    try {
      await saveProfile(user.uid, { alias, bio, reasons: reasonsSel, doc: docSel, docOther, roa: roaSel, roaOther });
      showToast(t('profile.saved'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

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

        {/* Perfil: bio + o que te traz aqui */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 space-y-3">
          <div className="text-sm font-semibold text-white">{t('profile.title')}</div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('profile.bioLabel')}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              rows={2}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('profile.reasonLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => toggle(reasonsSel, setReasonsSel, r)}
                  className={'px-3 py-1.5 rounded-full text-sm transition-all ' + (reasonsSel.includes(r) ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
                >
                  {t(`reasons.${r}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('doc.label')}</label>
            <div className="flex flex-wrap gap-2">
              {DOC_OPTIONS.map((k) => (
                <button
                  key={k}
                  onClick={() => toggle(docSel, setDocSel, k)}
                  className={'px-3 py-1.5 rounded-full text-sm transition-all ' + (docSel.includes(k) ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
                >
                  {t(`doc.${k}`)}
                </button>
              ))}
            </div>
            {docSel.includes('outra') && (
              <input
                value={docOther}
                onChange={(e) => setDocOther(e.target.value.slice(0, 40))}
                placeholder={t('otherPlaceholder')}
                className="w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('roa.label')}</label>
            <div className="flex flex-wrap gap-2">
              {ROA_OPTIONS.map((k) => (
                <button
                  key={k}
                  onClick={() => toggle(roaSel, setRoaSel, k)}
                  className={'px-3 py-1.5 rounded-full text-sm transition-all ' + (roaSel.includes(k) ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
                >
                  {t(`roa.${k}`)}
                </button>
              ))}
            </div>
            {roaSel.includes('outra') && (
              <input
                value={roaOther}
                onChange={(e) => setRoaOther(e.target.value.slice(0, 40))}
                placeholder={t('otherPlaceholder')}
                className="w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          </div>
          <button
            onClick={saveMyProfile}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-60"
          >
            {t('profile.save')}
          </button>
        </div>

        {/* Painel de denúncias (moderadores) */}
        {isModerator && (
          <button
            onClick={() => setShowReports(true)}
            className="w-full py-3 rounded-2xl bg-gray-800 border border-gray-700 text-purple-300 font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Icons.AlertTriangle className="w-5 h-5" /> {t('reports.button')}
          </button>
        )}

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

      {showReports && <ReportsPanel onClose={() => setShowReports(false)} showToast={showToast} />}
    </div>
  );
}
