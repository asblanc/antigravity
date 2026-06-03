import React from 'react';

interface Props { children: React.ReactNode }
interface State { hasError: boolean }

/**
 * Capture les erreurs de rendu React et affiche une page de repli élégante
 * au lieu d'un écran blanc.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Erreur applicative capturée :', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-3">Oups</span>
          <h1 className="font-serif text-3xl font-bold text-green-dark mb-3">Une erreur est survenue</h1>
          <p className="text-text-muted text-sm leading-relaxed mb-8">
            Quelque chose s'est mal passé de notre côté. Rechargez la page — si le problème persiste,
            contactez notre équipe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-gold px-8 py-3.5"
            >
              Recharger la page
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-8 py-3.5 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] rounded-[4px] hover:bg-green-dark hover:text-gold transition-all"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
}
