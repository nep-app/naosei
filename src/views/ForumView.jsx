import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth } from '../contexts/AuthContext';
import { subscribePosts } from '../data';
import { FORUM_THEMES, THEME_EMOJI } from '../constants/themes';
import { PostCard } from '../components/forum/PostCard';
import { PostDetail } from '../components/forum/PostDetail';
import { NewPostModal } from '../components/forum/NewPostModal';
import { SafetyBar } from '../components/forum/SafetyBar';

export function ForumView({ showToast }) {
  const { t } = useTranslation();
  const { alias } = useAuth();
  const [theme, setTheme] = useState('all');
  const [posts, setPosts] = useState([]);
  const [openPost, setOpenPost] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!alias) return;
    const unsub = subscribePosts(theme, setPosts);
    return unsub;
  }, [theme, alias]);

  // Enquanto a alcunha carrega (logo após entrar).
  if (!alias) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Icons.RefreshCw className="w-5 h-5 animate-spin mr-2" /> {t('common.loading')}
      </div>
    );
  }

  // A ver uma publicação em detalhe.
  if (openPost) {
    // mantém dados atualizados a partir da lista, se existir
    const fresh = posts.find((p) => p.id === openPost.id) || openPost;
    return <PostDetail post={fresh} onBack={() => setOpenPost(null)} showToast={showToast} />;
  }

  return (
    <div>
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{t('forum.title')}</h1>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            <Icons.Plus className="w-4 h-4" /> {t('forum.newPost')}
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-1">{t('forum.subtitle')}</p>
      </header>

      <SafetyBar />

      {/* Filtro de temas */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-1 px-1">
        <button
          onClick={() => setTheme('all')}
          className={'whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-all ' + (theme === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
        >
          {t('forum.allThemes')}
        </button>
        {FORUM_THEMES.map((th) => (
          <button
            key={th}
            onClick={() => setTheme(th)}
            className={'whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-all ' + (theme === th ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
          >
            {THEME_EMOJI[th]} {t(`themes.${th}`)}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-gray-800/60 border border-dashed border-gray-700 rounded-2xl p-6 text-center text-gray-400 text-sm">
          {t('forum.noPosts')}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => <PostCard key={p.id} post={p} onOpen={setOpenPost} />)}
        </div>
      )}

      {showNew && <NewPostModal onClose={() => setShowNew(false)} showToast={showToast} defaultTheme={theme} />}
    </div>
  );
}
