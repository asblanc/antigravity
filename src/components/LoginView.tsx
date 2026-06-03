import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft,
  ChevronRight, Shield
} from 'lucide-react';
import ibcLogo from '../assets/ibc-logo.webp';

export interface LoginViewProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onLoginGoogle?: () => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onLoginGoogle,
  onResetPassword,
}) => {
  const navigate = useNavigate();

  // Email / Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset password state
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Veuillez saisir votre adresse email.'); return; }
    if (!password) { setError('Veuillez saisir votre mot de passe.'); return; }
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string, fn?: () => Promise<void>) => {
    if (!fn) {
      toast.error(`Le fournisseur ${provider} n'est pas configuré. Activez-le dans Firebase Console.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User cancelled — silent
      } else if (err.code === 'auth/popup-blocked') {
        setError('La fenêtre de connexion a été bloquée. Autorisez les popups pour ce site.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Un compte existe déjà avec cet e-mail via une autre méthode de connexion.');
      } else {
        setError(err.message || 'Erreur de connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    setError('');
    setResetLoading(true);
    try {
      if (!onResetPassword) {
        setError('La réinitialisation de mot de passe n\'est pas configurée.');
        return;
      }
      await onResetPassword(resetEmail);
      setResetSent(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (err: any) {
      setError(err.message || 'Erreur d\'envoi de l\'email.');
    } finally {
      setResetLoading(false);
    }
  };

  // ─── Reset Password View ──────────────────────────────────────────────
  if (resetMode) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center py-12 md:py-24">
        <div className="w-full max-w-md px-4 md:px-6">
          <div className="text-center mb-8">
            <img src={ibcLogo} alt="IBC Logo" className="w-16 h-16 mx-auto mb-4" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-green-dark">
              Réinitialiser le mot de passe
            </h2>
            <p className="text-text-muted text-sm mt-2">
              Saisissez votre adresse email pour recevoir un lien.
            </p>
          </div>

          {resetSent ? (
            <div className="bg-white border border-gold/20 rounded-2xl p-8 text-center shadow-soft">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <h3 className="font-serif text-lg font-bold text-green-dark mb-2">Email envoyé !</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Si un compte existe avec l'adresse <strong className="text-green-dark">{resetEmail}</strong>, 
                vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(''); }}
                className="mt-6 text-gold font-bold text-sm hover:underline"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="bg-white border border-gold/15 rounded-2xl p-6 md:p-8 shadow-soft space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted block mb-1">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors"
                  placeholder="email@exemple.ci"
                  required
                />
              </div>

              {error && <p className="text-red-600 text-xs bg-red-50 p-3 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-gold text-green-darker py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {resetLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                onClick={() => { setResetMode(false); setError(''); }}
                className="w-full text-center text-[10px] uppercase tracking-widest text-text-muted hover:text-green-dark transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ─── Main Login View ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 md:py-24">
      <div className="w-full max-w-md px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-text-muted hover:text-green-dark transition-colors mb-6">
            <ArrowLeft size={12} /> Retour à l'accueil
          </button>
          <img src={ibcLogo} alt="IBC Logo" className="w-16 h-16 mx-auto mb-4" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">Accès Privé</span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-green-dark">Connexion</h2>
          <p className="text-text-muted text-sm mt-2">Accédez à votre espace IBC</p>
        </div>

        <div className="bg-white border border-gold/15 rounded-2xl p-6 md:p-8 shadow-soft">
          {/* ─── Email/Password Form ─── */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted block mb-1">Email</label>
              <div className="flex items-center border-b border-gold/20">
                <Mail size={16} className="text-gold mr-3 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.ci"
                  className="flex-1 bg-transparent py-3 font-serif text-base focus:outline-none"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted block mb-1">Mot de passe</label>
              <div className="flex items-center border-b border-gold/20">
                <Lock size={16} className="text-gold mr-3 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent py-3 font-serif text-base focus:outline-none"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-muted hover:text-green-dark transition-colors p-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setResetMode(true)}
              className="text-[10px] text-gold font-bold hover:underline block w-full text-right"
            >
              Mot de passe oublié ?
            </button>

            {error && <p className="text-red-600 text-xs bg-red-50 p-3 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-dark text-gold py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#031d0f] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* ─── Divider ─── */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gold/20" />
            <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">ou continuer avec</span>
            <div className="flex-1 h-px bg-gold/20" />
          </div>

          {/* ─── Social Buttons ─── */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google', onLoginGoogle)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gold/20 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-sm font-medium text-text">Google</span>
            </button>
          </div>
        </div>

        {/* ─── Register Link ─── */}
        <div className="text-center mt-8">
          <p className="text-sm text-text-muted">
            Pas encore membre ?{' '}
            <button
              onClick={() => navigate('/member-registration')}
              className="text-gold font-bold hover:underline inline-flex items-center gap-0.5"
            >
              Devenir membre <ChevronRight size={14} />
            </button>
          </p>
          <button
            onClick={() => navigate('/partner-registration')}
            className="text-[10px] uppercase tracking-widest text-text-muted hover:text-green-dark transition-colors mt-3 inline-flex items-center gap-1"
          >
            Vous êtes un établissement ? Devenez partenaire
          </button>
        </div>
      </div>
    </div>
  );
};