import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-6 py-24">
      <span className="font-serif text-[10rem] font-bold leading-none text-gold/20 select-none">404</span>
      <h1 className="font-serif text-3xl font-bold text-green-dark mt-2 mb-4">Page introuvable</h1>
      <p className="text-text-muted text-sm max-w-sm leading-relaxed mb-8">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <button onClick={() => navigate('/')} className="btn-gold px-12 py-4">
        Retour à l'accueil
      </button>
    </div>
  );
};
