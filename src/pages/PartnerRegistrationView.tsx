import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Seo } from '../components/Seo';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const PartnerRegistrationView: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ businessName: '', contactName: '', email: '', phone: '', establishmentType: 'restaurant', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Merci pour votre intérêt ! Nous vous contactons très bientôt.');
      setSubmitted(true);
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-24">
      <Seo
        title="Devenir Partenaire — Ivoire Business Club"
        description="Rejoignez le réseau IBC en tant qu'établissement partenaire : visibilité auprès d'une clientèle premium et nouveaux clients fidélisés."
        path="/partner-registration"
      />
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="border border-gold/20 p-12 mb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">LE RÉSEAU IBC</span>
          <h2 className="font-serif text-4xl font-bold text-green-dark">Devenez Partenaire IBC</h2>
          <p className="text-text-muted mt-4 text-sm leading-relaxed">Rejoignez un réseau d'établissements lifestyle et connectez-vous à une clientèle active à la recherche d'expériences, de découvertes et d'adresses sélectionnées en Côte d'Ivoire.</p>
        </div>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <h3 className="font-serif text-2xl text-green-dark border-b border-gold/20 pb-4 mb-6 uppercase">FORMULAIRE</h3>
            {[{ label: 'Nom de l\'établissement', key: 'businessName', placeholder: 'Hotel, Restaurant ou Service', type: 'text' }, { label: 'Catégorie d\'activité', key: 'establishmentType', placeholder: '', type: 'select' }, { label: 'Responsable de l\'établissement', key: 'contactName', placeholder: 'Nom & Prénom', type: 'text' }, { label: 'Email', key: 'email', placeholder: 'contact@etablissement.ci', type: 'email' }, { label: 'Téléphone', key: 'phone', placeholder: '+225 07 XX XX XX XX', type: 'tel' }].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{field.label}</label>
                {field.type === 'select' ? (
                  <select className="w-full bg-white border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none" value={formData.establishmentType} onChange={(e) => setFormData({...formData, establishmentType: e.target.value})}>
                    <option value="hebergement">Hébergement</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="lounge">Lounge</option>
                    <option value="beach-club">Beach Club</option>
                    <option value="bien-etre">Bien-être</option>
                    <option value="loisirs">Loisirs</option>
                    <option value="autre">Autre</option>
                  </select>
                ) : (
                  <input type={field.type} placeholder={field.placeholder} className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors" value={formData[field.key as keyof typeof formData]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} required />
                )}
              </div>
            ))}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Description</label>
              <textarea placeholder="Décrivez votre établissement..." className="w-full bg-transparent border border-gold/20 p-4 font-sans text-sm focus:border-gold outline-none transition-colors rounded min-h-24" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-4 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Envoi en cours...</>
              ) : (
                <>Soumettre ma Candidature <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 size={48} className="text-green-dark mx-auto block mb-6" />
            <h4 className="text-2xl font-serif text-green-dark mb-4">Merci !</h4>
            <p className="text-text-muted mb-6">Votre demande a été reçue. Notre équipe vous contactera très bientôt.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/')} className="btn-gold">Retour à l'accueil</button>
              <button onClick={() => navigate('/member-registration')} className="btn-outline border-gold text-green-dark hover:bg-gold hover:text-green-dark">Devenir membre</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
