import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageViewProps {
  title: string;
  lastUpdated: string;
  content: React.ReactNode;
}

export const LegalPageView: React.FC<LegalPageViewProps> = ({ title, lastUpdated, content }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-text-muted hover:text-green-dark transition-colors mb-8"
        >
          <ArrowLeft size={12} /> Retour
        </button>

        <div className="bg-white border border-gold/20 p-8 md:p-12 shadow-soft">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-dark mb-2">
            {title}
          </h1>
          <p className="text-sm text-text-muted mb-8 italic">
            Dernière mise à jour : {lastUpdated}
          </p>

          <div className="prose prose-sm md:prose-base prose-green max-w-none text-text-muted space-y-6">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};
