import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth } from '../contexts/AuthContext';
import { subscribePosts, subscribeBookmarks, addBookmark, removeBookmark } from '../data';
import { FORUM_THEMES, THEME_EMOJI } from '../constants/themes';
import { PostCard } from '../components/forum/PostCard';
import { PostDetail } from '../components/forum/PostDetail';
import { NewPostModal } from '../components/forum/NewPostModal';
import { SafetyBar } from '../components/forum/SafetyBar';

export function ForumView({ showToast }) {
  const { t } = useTranslation();
  const { user, alias } = useAuth();
  const [theme, setTheme] = useState('all');
  const [posts, setPosts] = useState([]);
  const [openPost, setOpenPost] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    if (!alias) return;
    const unsub = subscribePosts(theme, setPosts);
    return unsub;
  }, [theme, alias]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeBookmarks(user.uid, setBookmarks);
    return unsub;
  }, [user]);

  const toggleBookmark = (postId) => {
    if (bookmarks.includes(postId)) removeBookmark(user.uid, postId);
    else addBookmark(user.uid, postId);
  };

  // Ordena (fixados primeiro), filtra por pesquisa e por "guardados".
  const visiblePosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = posts.slice();
    if (savedOnly) list = list.filter((p) => bookmarks.includes(p.id));
    if (q) list = list.filter((p) => (p.title + ' ' + p.body).toLowerCase().includes(q));
    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.ts || 0) - (a.ts || 0));
    return list;
  }, [posts, search, savedOnly, bookmarks]);

  if (!alias) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Icons.RefreshCw className="w-5 h-5 animate-spin mr-2" /> {t('common.loading')}
      </div>
    );
  }

  if (openPost) {
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

      {/* Pesquisa */}
      <div className="relative mb-3">
        <Icons.Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('forum.searchPlaceholder')}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Filtro de temas + Guardados */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-1 px-1">
        <button
          onClick={() => { setSavedOnly(false); setTheme('all'); }}
          className={'whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-all ' + (!savedOnly && theme === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
        >
          {t('forum.allThemes')}
        </button>
        <button
          onClick={() => setSavedOnly((v) => !v)}
          className={'whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-all inline-flex items-center gap-1 ' + (savedOnly ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
        >
          <Icons.Bookmark className="w-3.5 h-3.5" filled={savedOnly} /> {t('forum.savedFilter')}
        </button>
        {FORUM_THEMES.map((th) => (
          <button
            key={th}
            onClick={() => { setSavedOnly(false); setTheme(th); }}
            className={'whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-all ' + (!savedOnly && theme === th ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
          >
            {THEME_EMOJI[th]} {t(`themes.${th}`)}
          </button>
        ))}
      </div>

      {!savedOnly && theme !== 'all' && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5 mb-3 text-sm text-gray-300 flex items-center gap-2">
          <span>{THEME_EMOJI[theme]}</span>
          <span>{t(`themeDesc.${theme}`)}</span>
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <div className="bg-gray-800/60 border border-dashed border-gray-700 rounded-2xl p-6 text-center text-gray-400 text-sm">
          {savedOnly ? t('forum.noSaved') : t('forum.noPosts')}
        </div>
      ) : (
        <div className="space-y-3">
          {visiblePosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onOpen={setOpenPost}
              bookmarked={bookmarks.includes(p.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}

      {showNew && <NewPostModal onClose={() => setShowNew(false)} showToast={showToast} defaultTheme={theme} />}
    </div>
  );
}
