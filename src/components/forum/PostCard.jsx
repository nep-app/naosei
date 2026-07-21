import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { subscribeReplies } from '../../data';
import { THEME_EMOJI } from '../../constants/themes';
import { timeAgo } from '../../helpers';
import { VoteButton } from './VoteButton';

export function PostCard({ post, onOpen, bookmarked, onToggleBookmark, onOpenProfile }) {
  const { t } = useTranslation();
  const [replyCount, setReplyCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeReplies(post.id, (r) => setReplyCount(r.length));
    return unsub;
  }, [post.id]);

  return (
    <div
      onClick={() => onOpen(post)}
      className={
        'w-full text-left bg-gray-800 rounded-2xl p-4 border hover:border-purple-600/50 transition-all cursor-pointer ' +
        (post.pinned ? 'border-purple-600/50' : 'border-gray-700/50')
      }
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {post.pinned && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 inline-flex items-center gap-1">
            <Icons.Pin className="w-3 h-3" filled /> {t('forum.pinned')}
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
          {THEME_EMOJI[post.theme]} {t(`themes.${post.theme}`)}
        </span>
        {post.isQuestion && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 inline-flex items-center gap-1">
            <Icons.HelpCircle className="w-3 h-3" /> {t('forum.question')}
          </span>
        )}
        <span className="text-xs text-gray-500 ml-auto">{timeAgo(post.ts, t)}</span>
      </div>

      <h3 className="text-white font-semibold leading-snug">{post.title}</h3>
      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{post.body}</p>

      <div className="flex items-center gap-3 mt-3">
        <VoteButton postId={post.id} size="sm" />
        <span className="text-xs text-gray-400 inline-flex items-center gap-1">
          <Icons.MessageSquare className="w-3.5 h-3.5" />
          {replyCount}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(post.id); }}
          className={'p-1 rounded-md transition-colors ' + (bookmarked ? 'text-purple-300' : 'text-gray-500 hover:text-gray-300')}
          title={bookmarked ? t('forum.unsave') : t('forum.save')}
        >
          <Icons.Bookmark className="w-4 h-4" filled={bookmarked} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenProfile && onOpenProfile(post.authorUid, post.alias); }}
          className="text-xs text-gray-500 ml-auto hover:text-purple-300"
        >
          — {post.alias}
        </button>
      </div>
    </div>
  );
}
