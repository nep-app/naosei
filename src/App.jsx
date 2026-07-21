import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from './Icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { ForumView } from './views/ForumView';
import { MessagesView } from './views/MessagesView';
import { SettingsView } from './views/SettingsView';

function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center gap-2 px-4 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={
            'px-4 py-3 rounded-lg shadow-lg font-medium text-sm pointer-events-auto ' +
            (toast.type === 'success' ? 'bg-green-500 text-white'
              : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')
          }
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function Shell() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [view, setView] = useState('forum');
  const [toasts, setToasts] = useState([]);
  const [dmTarget, setDmTarget] = useState(null);

  const startDM = (uid, alias) => { setDmTarget({ uid, alias }); setView('messages'); };

  const showToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setToasts((cur) => [...cur, { id, message, type }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 2600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400">
        <Icons.RefreshCw className="w-5 h-5 animate-spin mr-2" /> {t('common.loading')}
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const navItems = [
    { key: 'forum', icon: Icons.MessageSquare, label: t('nav.forum') },
    { key: 'messages', icon: Icons.Send, label: t('dm.nav') },
    { key: 'settings', icon: Icons.User, label: t('nav.settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {view === 'forum' && <ForumView showToast={showToast} onStartDM={startDM} />}
        {view === 'messages' && <MessagesView dmTarget={dmTarget} onConsumeDmTarget={() => setDmTarget(null)} showToast={showToast} />}
        {view === 'settings' && <SettingsView showToast={showToast} />}
      </div>

      {/* Barra inferior (igual à app) */}
      <div
        className="bg-gray-800 fixed bottom-0 left-0 right-0 shadow-xl rounded-t-3xl pt-3 px-3 z-50"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={
                  'p-2 rounded-xl transition-colors flex flex-col items-center ' +
                  (view === key ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')
                }
              >
                <Icon className="w-5 h-5" />
                <div className="text-xs font-medium mt-1">{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
