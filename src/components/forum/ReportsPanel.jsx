import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { Modal } from '../Modal';
import { subscribeReports, resolveReport, getPost, getReply, deletePost, deleteReply } from '../../data';
import { timeAgo } from '../../helpers';

// Painel de denúncias (só moderadores). Lista cada denúncia com o conteúdo
// visado e ações: apagar o conteúdo ou descartar a denúncia.
export function ReportsPanel({ onClose, showToast }) {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [targets, setTargets] = useState({}); // reportId -> {text, alias} | null

  useEffect(() => {
    const unsub = subscribeReports(setReports);
    return unsub;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const next = {};
      for (const r of reports) {
        if (r.kind === 'dm') { next[r.id] = { text: r.sample || '', alias: null, dm: true }; continue; }
        try {
          const item = r.kind === 'reply' ? await getReply(r.postId, r.replyId) : await getPost(r.postId);
          next[r.id] = item ? { text: item.title ? `${item.title} — ${item.body}` : item.body, alias: item.alias } : null;
        } catch {
          next[r.id] = null;
        }
      }
      if (active) setTargets(next);
    })();
    return () => { active = false; };
  }, [reports]);

  const dismiss = async (r) => {
    await resolveReport(r.id);
  };

  const removeContent = async (r) => {
    if (!window.confirm(t('history.deleteConfirm'))) return;
    try {
      if (r.kind === 'reply') await deleteReply(r.postId, r.replyId);
      else await deletePost(r.postId);
      await resolveReport(r.id);
      showToast(t('common.delete'), 'success');
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  return (
    <Modal title={t('reports.title')} onClose={onClose}>
      {reports.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-6">{t('reports.empty')}</div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const target = targets[r.id];
            return (
              <div key={r.id} className="bg-gray-900 border border-gray-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                    {r.kind === 'reply' ? t('reports.kindReply') : r.kind === 'dm' ? t('reports.kindDm') : t('reports.kindPost')}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">{timeAgo(r.ts, t)}</span>
                </div>
                {target === undefined ? (
                  <p className="text-xs text-gray-500">{t('common.loading')}</p>
                ) : target === null ? (
                  <p className="text-xs text-gray-500 italic">{t('reports.gone')}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-200 line-clamp-3">{target.text}</p>
                    <p className="text-xs text-gray-500 mt-1">— {target.alias}</p>
                  </>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => dismiss(r)} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-200 text-sm font-medium hover:bg-gray-600">
                    {t('reports.dismiss')}
                  </button>
                  {target && !target.dm && (
                    <button onClick={() => removeContent(r)} className="flex-1 py-2 rounded-lg bg-red-900/40 border border-red-700/50 text-red-300 text-sm font-medium hover:bg-red-900/60">
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
