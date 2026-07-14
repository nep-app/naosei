import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth, aliasIsValid } from '../contexts/AuthContext';

export function LoginScreen() {
  const { t, i18n } = useTranslation();
  const { loginAlias, signupAlias, resetPassword } = useAuth();

  const changeLang = (lang) => { i18n.changeLanguage(lang); localStorage.setItem('nep_lang', lang); };

  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(''); // alcunha (ou email no login)
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState(''); // opcional, só no registo
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const mapError = (err) => {
    switch (err.code) {
      case 'auth/wrong-password': return t('login.errWrongPassword');
      case 'auth/user-not-found': return t('login.errUserNotFound');
      case 'auth/email-already-in-use': return t('login.errAliasTaken');
      case 'auth/invalid-credential': return t('login.errInvalidCred');
      case 'auth/invalid-email': return t('login.errInvalidCred');
      case 'auth/weak-password': return t('login.weakPassword');
      default: return t('common.error') + ': ' + err.message;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!isLogin) {
      if (!aliasIsValid(identifier)) { setError(t('login.aliasInvalid')); return; }
      if (password.length < 8) { setError(t('login.weakPassword')); return; }
      if (password !== confirm) { setError(t('login.confirmMismatch')); return; }
    }
    setLoading(true);
    try {
      if (isLogin) await loginAlias(identifier, password);
      else await signupAlias(identifier, password, email);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError(''); setInfo('');
    const em = window.prompt(t('login.resetPrompt'), '');
    if (em === null) return;
    if (!em.trim()) { setError(t('login.resetNoEmail')); return; }
    try {
      await resetPassword(em);
      setInfo(t('login.resetSent'));
    } catch (err) {
      setError(mapError(err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900">
      <div className="w-full max-w-md">
        {/* Língua */}
        <div className="flex justify-end gap-2 mb-4 text-sm">
          <button onClick={() => changeLang('pt')} className={i18n.language === 'pt' ? 'font-bold text-white' : 'text-gray-500 hover:text-gray-300'}>PT</button>
          <span className="text-gray-600">|</span>
          <button onClick={() => changeLang('en')} className={i18n.language === 'en' ? 'font-bold text-white' : 'text-gray-500 hover:text-gray-300'}>ENG</button>
        </div>

        {/* Logótipo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Icons.Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NEP</h1>
          <p className="text-purple-300 text-sm">
            {isLogin ? t('login.loginTitle') : t('login.createTitle')}
          </p>
          <p className="text-gray-400 text-xs mt-1">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              {isLogin ? t('login.identifierLabel') : t('login.aliasLabel')}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isLogin ? t('login.identifierPlaceholder') : t('login.aliasPlaceholder')}
              maxLength={64}
              autoComplete="off"
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">{t('login.passwordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          {isLogin && (
            <div className="text-right -mt-2">
              <button type="button" onClick={handleReset} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                {t('login.forgot')}
              </button>
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">{t('login.confirmLabel')}</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t('login.confirmPlaceholder')}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">{t('login.emailOptionalLabel')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailOptionalPlaceholder')}
                  autoComplete="off"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-2">{t('login.emailOptionalNote')}</p>
              </div>
            </>
          )}

          {info && (
            <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-300 text-sm">{info}</div>
          )}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={
              'w-full py-3 rounded-lg transition-all font-medium flex items-center justify-center gap-2 ' +
              (loading ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600')
            }
          >
            {loading ? (
              <>
                <Icons.RefreshCw className="w-4 h-4 animate-spin" />
                {isLogin ? t('login.signingIn') : t('login.creating')}
              </>
            ) : (
              <>
                {isLogin ? t('login.signIn') : t('login.signUp')}
                <Icons.ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setInfo(''); setConfirm(''); }}
            className="w-full text-purple-400 text-sm hover:text-purple-300 transition-colors"
          >
            {isLogin ? t('login.noAccount') : t('login.hasAccount')}
          </button>
        </form>

        <div className="mt-6 bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icons.Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300">{t('login.anonNote')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
