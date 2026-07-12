import React, { useEffect } from 'react';
import * as Icons from '../Icons';

// Janela sobreposta (modal) com o visual escuro da app.
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
