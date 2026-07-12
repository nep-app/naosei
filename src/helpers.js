// Formata "há X tempo" a partir de um timestamp (ms). i18n via t().
export function timeAgo(ts, t) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('common.now');
  if (mins < 60) return t('common.minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('common.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('common.daysAgo', { count: days });
}

// Hora local HH:MM para inputs type="time"
export function currentTimeHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDateLabel(ts, lang) {
  try {
    return new Date(ts).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pt-PT', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}
