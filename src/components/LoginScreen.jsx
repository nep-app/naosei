import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../Icons';
import { useAuth, aliasIsValid } from '../contexts/AuthContext';

export function LoginScreen() {
  const { t, i18n } = useTranslation();
  const { loginAlias, signupAlias } = useAuth();

  const changeLang = (lang) => { i18n.changeLanguage(lang); localStorage.setItem('nep_lang', lang); };

  const [isLogin, setIsLogin] = useState(true);
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mapError = (err) => {
    switch (err.code) {
      case 'auth/wrong-password': return t('login.errWrongPassword');
      case 'auth/user-not-found': return t('login.errUserNotFound');
      case 'auth/email-already-in-use': return t('login.errAliasTaken');
      case 'auth/invalid-credential': return t('login.errInvalidCred');
      case 'auth/weak-password': return t('login.weakPassword');
      default: return t('common.error') + ': ' + err.message;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!aliasIsValid(alias)) { setError(t('login.aliasInvalid')); return; }
    if (password.length < 8) { setError(t('login.weakPassword')); return; }
    setLoading(true);
    try {
      if (isLogin) await loginAlias(alias, password);
      else await signupAlias(alias, password);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
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

        {/* Formulário alcunha + palavra-passe */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">{t('login.aliasLabel')}</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder={t('login.aliasPlaceholder')}
              maxLength={24}
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

          {!isLogin && (
            <p className="text-xs text-amber-300/90 bg-amber-900/20 border border-amber-700/40 rounded-lg p-3">
              {t('login.noRecovery')}
            </p>
          )}

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
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
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="w-full text-purple-400 text-sm hover:text-purple-300 transition-colors"
          >
            {isLogin ? t('login.noAccount') : t('login.hasAccount')}
          </button>
        </form>

        {/* Nota anonimato */}
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
