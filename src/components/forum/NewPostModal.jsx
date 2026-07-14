import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { addPost } from '../../data';
import { FORUM_THEMES, THEME_EMOJI, MOD_ONLY_THEMES } from '../../constants/themes';

export function NewPostModal({ onClose, showToast, defaultTheme }) {
  const { t } = useTranslation();
  const { user, alias, isModerator } = useAuth();
  // Canais que a pessoa pode usar para publicar (Avisos só para moderadores).
  const allowedThemes = FORUM_THEMES.filter((th) => isModerator || !MOD_ONLY_THEMES.includes(th));
  const initialTheme = defaultTheme && allowedThemes.includes(defaultTheme) ? defaultTheme : 'geral';
  const [theme, setTheme] = useState(initialTheme);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await addPost(user.uid, alias, { theme, title, body, isQuestion });
      showToast(t('forum.published'), 'success');
      onClose();
    } catch {
      showToast(t('common.error'), 'error');
      setSaving(false);
    }
  };

  return (
    <Modal title={t('forum.newPostTitle')} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('forum.postThemeLabel')}</label>
          <div className="flex flex-wrap gap-2">
            {allowedThemes.map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className={
                  'px-3 py-1.5 rounded-full text-sm transition-all ' +
                  (theme === th ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')
                }
              >
                {THEME_EMOJI[th]} {t(`themes.${th}`)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{t(`themeDesc.${theme}`)}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('forum.postTitleLabel')}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder={t('forum.postTitlePlaceholder')}
            className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('forum.postBodyLabel')}</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={5000}
            placeholder={t('forum.postBodyPlaceholder')}
            className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={isQuestion} onChange={(e) => setIsQuestion(e.target.checked)} className="w-4 h-4 accent-purple-500" />
          {t('forum.postIsQuestion')}
        </label>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-200 font-medium hover:bg-gray-600 transition-colors">
            {t('forum.cancel')}
          </button>
          <button
            onClick={submit}
            disabled={saving || !title.trim() || !body.trim()}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
          >
            {t('forum.publish')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
