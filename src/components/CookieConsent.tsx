import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'ibc-cookie-consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Affiché uniquement si aucun choix n'a encore été fait.
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch { /* localStorage indisponible */ }
  }, []);

  const decide = (choice: 'accepted' | 'declined') => {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch { /* noop */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl mx-auto bg-white border border-gold/20 shadow-premium rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-dark/5 border border-gold/20 flex items-center justify-center shrink-0">
          <Cookie size={20} className="text-gold" />
        </div>
        <p className="text-[12px] leading-relaxed text-text-muted flex-1">
          Nous utilisons des cookies essentiels pour faire fonctionner le site et améliorer votre expérience.
          En continuant, vous acceptez notre{' '}
          <Link to="/legal/confidentialite" className="text-gold font-semibold hover:underline">politique de confidentialité</Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => decide('declined')}
            className="flex-1 sm:flex-none text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-green-dark px-4 py-2.5 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => decide('accepted')}
            className="flex-1 sm:flex-none btn-gold !px-6 !py-2.5 text-[10px]"
          >
            Accepter
          </button>
          <button onClick={() => decide('declined')} aria-label="Fermer" className="text-text-muted hover:text-green-dark p-1 sm:hidden">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
