import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { Modal } from '../Modal';
import { getProfile } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

// Cartão de perfil (público, anónimo) que aparece ao tocar numa alcunha.
export function ProfileCard({ uid, alias, onClose, onStartDM }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isSelf = user && user.uid === uid;

  useEffect(() => {
    let active = true;
    getProfile(uid).then((p) => { if (active) { setProfile(p); setLoading(false); } });
    return () => { active = false; };
  }, [uid]);

  return (
    <Modal title={t('profile.viewTitle')} onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
          {(alias || '?').slice(0, 1).toUpperCase()}
        </div>
        <div className="text-lg font-bold text-white">{alias}</div>
      </div>
      {!isSelf && onStartDM && (
        <button
          onClick={() => { onClose(); onStartDM(uid, alias); }}
          className="w-full mb-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all inline-flex items-center justify-center gap-2"
        >
          <Icons.Send className="w-4 h-4" /> {t('dm.send')}
        </button>
      )}
      {loading ? (
        <div className="text-gray-400 text-sm">{t('common.loading')}</div>
      ) : (
        <div className="space-y-3">
          {profile?.reason && (
            <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
              <Icons.Heart className="w-3.5 h-3.5" /> {t(`reasons.${profile.reason}`)}
            </div>
          )}
          <p className="text-sm text-gray-200">
            {profile?.bio ? profile.bio : <span className="text-gray-500 italic">{t('profile.noBio')}</span>}
          </p>
          {profile?.doc?.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">{t('doc.label')}</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.doc.map((k) => (
                  <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">{t(`doc.${k}`, k)}</span>
                ))}
              </div>
            </div>
          )}
          {profile?.roa?.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">{t('roa.label')}</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.roa.map((k) => (
                  <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">{t(`roa.${k}`, k)}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
