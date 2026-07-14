import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeReplies, addReply, deletePost, deleteReply } from '../../data';
import { THEME_EMOJI } from '../../constants/themes';
import { timeAgo } from '../../helpers';
import { VoteButton } from './VoteButton';
import { ReportButton } from './ReportButton';

export function PostDetail({ post, onBack, showToast }) {
  const { t } = useTranslation();
  const { user, alias, isModerator } = useAuth();
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsub = subscribeReplies(post.id, setReplies);
    return unsub;
  }, [post.id]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await addReply(post.id, user.uid, alias, text);
      setText('');
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setSending(false);
    }
  };

  const removePost = async () => {
    if (!window.confirm(t('history.deleteConfirm'))) return;
    try {
      await deletePost(post.id);
      onBack();
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  const removeReply = async (replyId) => {
    if (!window.confirm(t('history.deleteConfirm'))) return;
    try {
      await deleteReply(post.id, replyId);
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  const isOwner = post.authorUid === user.uid;

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm mb-4">
        <Icons.ChevronLeft className="w-4 h-4" /> {t('forum.title')}
      </button>

      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700/50">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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
        <h2 className="text-xl font-bold text-white">{post.title}</h2>
        <p className="text-gray-200 mt-2 whitespace-pre-wrap">{post.body}</p>
        <div className="flex items-center gap-3 mt-4">
          <VoteButton postId={post.id} />
          {!isOwner && <ReportButton postId={post.id} kind="post" />}
          <span className="text-xs text-gray-500 ml-auto">— {post.alias}</span>
          {(isOwner || isModerator) && (
            <button onClick={removePost} title={isModerator && !isOwner ? t('forum.modDelete') : t('common.delete')} className="text-gray-500 hover:text-red-400 p-1">
              <Icons.Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6 mb-3">
        {post.isQuestion ? t('forum.answer') : t('forum.reply')} · {replies.length}
      </h3>

      {replies.length === 0 ? (
        <div className="bg-gray-800/60 border border-dashed border-gray-700 rounded-2xl p-5 text-center text-gray-400 text-sm mb-4">
          {t('forum.noReplies')}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {replies.map((r) => (
            <div key={r.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-purple-300">{r.alias}</span>
                <span className="text-xs text-gray-500">{timeAgo(r.ts, t)}</span>
              </div>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{r.body}</p>
              <div className="mt-2 flex justify-end items-center gap-3">
                {r.authorUid !== user.uid && (
                  <ReportButton postId={post.id} replyId={r.id} kind="reply" />
                )}
                {(r.authorUid === user.uid || isModerator) && (
                  <button onClick={() => removeReply(r.id)} className="text-xs text-gray-500 hover:text-red-400 inline-flex items-center gap-1">
                    <Icons.Trash2 className="w-3.5 h-3.5" /> {t('common.delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 sticky bottom-24">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder={t('forum.replyPlaceholder')}
          className="flex-1 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="px-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          <Icons.Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
