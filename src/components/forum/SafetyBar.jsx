import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../Icons';
import { Modal } from '../Modal';

function RulesModal({ onClose }) {
  const { t } = useTranslation();
  return (
    <Modal title={t('safety.rulesTitle')} onClose={onClose}>
      <p className="text-sm text-gray-300 mb-3">{t('safety.rulesIntro')}</p>
      <ul className="space-y-2 text-sm text-gray-200">
        {['rule1', 'rule2', 'rule3', 'rule4', 'rule5'].map((k) => (
          <li key={k} className="flex gap-2">
            <Icons.Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span>{t(`safety.${k}`)}</span>
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium">
        {t('common.close')}
      </button>
    </Modal>
  );
}

function HelpModal({ onClose }) {
  const { t } = useTranslation();
  return (
    <Modal title={t('safety.helpTitle')} onClose={onClose}>
      <div className="space-y-3">
        {['helpEmergency', 'helpHealth', 'helpDrug'].map((k) => (
          <div key={k} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 font-medium">
            {t(`safety.${k}`)}
          </div>
        ))}
        <p className="text-xs text-gray-400 pt-1">{t('safety.helpNote')}</p>
      </div>
      <button onClick={onClose} className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium">
        {t('common.close')}
      </button>
    </Modal>
  );
}

// Faixa fixa de segurança no topo do fórum: aviso + acesso a regras e ajuda.
export function SafetyBar() {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="bg-purple-900/20 border border-purple-700/40 rounded-2xl p-3 mb-4">
      <div className="flex items-start gap-2">
        <Icons.Info className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-purple-200">{t('safety.disclaimer')}</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setShowRules(true)} className="text-xs font-medium text-purple-300 hover:text-purple-200 inline-flex items-center gap-1">
              <Icons.Shield className="w-3.5 h-3.5" /> {t('safety.openRules')}
            </button>
            <button onClick={() => setShowHelp(true)} className="text-xs font-medium text-blue-300 hover:text-blue-200 inline-flex items-center gap-1">
              <Icons.Heart className="w-3.5 h-3.5" /> {t('safety.openHelp')}
            </button>
          </div>
        </div>
      </div>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
