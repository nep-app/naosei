import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth } from '../contexts/AuthContext';
import {
  startConversation, subscribeConversations, subscribeMessages, sendMessage,
  subscribeBlocks, blockUser, unblockUser, reportUser,
} from '../data';
import { timeAgo, formatDateLabel } from '../helpers';

function other(conv, uid) {
  const oid = (conv.participants || []).find((p) => p !== uid) || uid;
  return { uid: oid, alias: (conv.aliases && conv.aliases[oid]) || '—' };
}

export function MessagesView({ dmTarget, onConsumeDmTarget, showToast }) {
  const { t, i18n } = useTranslation();
  const { user, alias } = useAuth();
  const [convs, setConvs] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [openWith, setOpenWith] = useState(null); // {uid, alias}
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const u1 = subscribeConversations(user.uid, setConvs);
    const u2 = subscribeBlocks(user.uid, setBlocks);
    return () => { u1(); u2(); };
  }, [user]);

  // Abrir/iniciar conversa a partir do perfil (botão "Enviar mensagem").
  useEffect(() => {
    if (!dmTarget || !user || !alias) return;
    const target = dmTarget;
    (async () => {
      try {
        const id = await startConversation(user.uid, alias, target.uid, target.alias);
        setOpenId(id);
        setOpenWith({ uid: target.uid, alias: target.alias });
      } catch {
        showToast(t('common.error'), 'error');
      } finally {
        onConsumeDmTarget();
      }
    })();
  }, [dmTarget, user, alias]);

  useEffect(() => {
    if (!openId) { setMessages([]); return; }
    const unsub = subscribeMessages(openId, setMessages);
    return unsub;
  }, [openId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openConv = (conv) => {
    setOpenId(conv.id);
    setOpenWith(other(conv, user.uid));
  };

  const send = async () => {
    if (!text.trim() || !openId) return;
    const body = text; setText('');
    try {
      await sendMessage(openId, user.uid, alias, body);
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  const isBlocked = openWith && blocks.includes(openWith.uid);

  const toggleBlock = async () => {
    if (!openWith) return;
    if (isBlocked) { await unblockUser(user.uid, openWith.uid); return; }
    if (!window.confirm(t('dm.blockConfirm'))) return;
    await blockUser(user.uid, openWith.uid);
  };

  const report = async () => {
    if (!openWith) return;
    if (!window.confirm(t('dm.reportConfirm'))) return;
    const last = messages.filter((m) => m.senderUid === openWith.uid).slice(-1)[0];
    await reportUser(user.uid, { reportedUid: openWith.uid, convId: openId, sample: last?.body || '' });
    showToast(t('dm.reported'), 'success');
  };

  // ----- Vista de uma conversa -----
  if (openId && openWith) {
    return (
      <div className="flex flex-col" style={{ minHeight: '70vh' }}>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => { setOpenId(null); setOpenWith(null); }} className="text-purple-400 hover:text-purple-300 p-1">
            <Icons.ChevronLeft className="w-5 h-5" />
          </button>
          <div className="font-bold text-white">{openWith.alias}</div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={report} className="text-xs text-gray-400 hover:text-gray-200 inline-flex items-center gap-1 px-2 py-1">
              <Icons.AlertTriangle className="w-3.5 h-3.5" /> {t('dm.report')}
            </button>
            <button onClick={toggleBlock} className={'text-xs inline-flex items-center gap-1 px-2 py-1 ' + (isBlocked ? 'text-purple-300' : 'text-gray-400 hover:text-red-300')}>
              {isBlocked ? t('dm.unblock') : t('dm.block')}
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pb-2">
          {messages.map((m) => {
            const mine = m.senderUid === user.uid;
            return (
              <div key={m.id} className={'flex ' + (mine ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[80%] rounded-2xl px-3 py-2 text-sm ' + (mine ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-800 text-gray-100 border border-gray-700')}>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <div className={'text-[10px] mt-1 ' + (mine ? 'text-white/70' : 'text-gray-500')}>{formatDateLabel(m.ts, i18n.language)}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {isBlocked ? (
          <div className="text-center text-xs text-gray-400 bg-gray-800 rounded-xl py-3 mt-2">{t('dm.blockedNote')}</div>
        ) : (
          <div className="flex gap-2 mt-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={1}
              placeholder={t('dm.placeholder')}
              className="flex-1 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button onClick={send} disabled={!text.trim()} className="px-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium disabled:opacity-50">
              <Icons.Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ----- Lista de conversas -----
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">{t('dm.title')}</h1>
      <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-3 mb-4 text-xs text-amber-200 flex items-start gap-2">
        <Icons.AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{t('dm.safety')}</span>
      </div>

      {convs.length === 0 ? (
        <div className="bg-gray-800/60 border border-dashed border-gray-700 rounded-2xl p-6 text-center text-gray-400 text-sm">
          {t('dm.empty')}
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((c) => {
            const o = other(c, user.uid);
            return (
              <button key={c.id} onClick={() => openConv(c)} className="w-full text-left bg-gray-800 rounded-2xl p-4 border border-gray-700/50 hover:border-purple-600/50 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {(o.alias || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{o.alias}</span>
                      {blocks.includes(o.uid) && <span className="text-[10px] text-gray-500">({t('dm.block')})</span>}
                      <span className="text-xs text-gray-500 ml-auto">{timeAgo(c.lastTs, t)}</span>
                    </div>
                    <div className="text-sm text-gray-400 truncate">{c.lastMessage || '—'}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
