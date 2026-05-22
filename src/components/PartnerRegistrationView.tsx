import React, { useState } from 'react';
import { Users, Eye, Heart, Megaphone, TrendingUp, Hotel, Utensils, Coffee, Sparkles } from 'lucide-react';

export interface PartnerRegistrationViewProps {
  onRegister?: (data: any) => Promise<void>;
}

export const PartnerRegistrationView: React.FC<PartnerRegistrationViewProps> = ({ onRegister }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    structureName: '',
    activityType: '',
    city: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      if (onRegister) {
        await onRegister(formData);
      } else {
        console.log('No onRegister handler provided');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dark via-white to-gold/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Marketing Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 xl:p-10 border border-gold/20">
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">REJOIGNEZ LE RÉSEAU</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-green-dark">Pourquoi devenir partenaire IBC ?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div className="flex gap-4">
                <Users className="text-gold shrink-0" size={24} />
                <div>
                   <h4 className="font-serif font-bold text-green-dark">Clientèle qualifiée</h4>
                   <p className="text-xs text-gray-600 mt-1">Accédez à une communauté active et à fort pouvoir d'achat.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <Eye className="text-gold shrink-0" size={24} />
                <div>
                   <h4 className="font-serif font-bold text-green-dark">Plus de visibilité</h4>
                   <p className="text-xs text-gray-600 mt-1">Votre établissement mis en avant sur tous nos canaux.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <Heart className="text-gold shrink-0" size={24} />
                <div>
                   <h4 className="font-serif font-bold text-green-dark">Fidélisation</h4>
                   <p className="text-xs text-gray-600 mt-1">Attirez, fidélisez et engagez vos clients grâce au cashback.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <Megaphone className="text-gold shrink-0" size={24} />
                <div>
                   <h4 className="font-serif font-bold text-green-dark">Communication</h4>
                   <p className="text-xs text-gray-600 mt-1">Profitez de nos campagnes ciblées par SMS et Push.</p>
                </div>
             </div>
             <div className="flex gap-4 sm:col-span-2 justify-center max-w-sm mx-auto">
                <TrendingUp className="text-gold shrink-0" size={24} />
                <div>
                   <h4 className="font-serif font-bold text-green-dark">Suivi et performance</h4>
                   <p className="text-xs text-gray-600 mt-1">Accédez à un tableau de bord analytique détaillé pour suivre votre ROI.</p>
                </div>
             </div>
          </div>

          <div className="bg-cream/50 rounded-xl p-6 border border-gold/20 mb-8">
            <h3 className="font-serif text-xl font-bold text-green-dark text-center mb-6">Qui peut devenir partenaire ?</h3>
            <div className="flex flex-wrap justify-center gap-3">
               <span className="bg-white border border-gold/30 px-3 py-1.5 rounded-full text-xs text-green-dark font-medium flex items-center gap-2 shadow-sm"><Hotel size={14}/> Hébergements</span>
               <span className="bg-white border border-gold/30 px-3 py-1.5 rounded-full text-xs text-green-dark font-medium flex items-center gap-2 shadow-sm"><Utensils size={14}/> Restaurants</span>
               <span className="bg-white border border-gold/30 px-3 py-1.5 rounded-full text-xs text-green-dark font-medium flex items-center gap-2 shadow-sm"><Coffee size={14}/> Lounges</span>
               <span className="bg-white border border-gold/30 px-3 py-1.5 rounded-full text-xs text-green-dark font-medium flex items-center gap-2 shadow-sm"><Sparkles size={14}/> Bien-être</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t border-b border-gold/10 py-6">
             <div>
                <p className="font-serif text-3xl font-bold text-gold">10k+</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Membres</p>
             </div>
             <div>
                <p className="font-serif text-3xl font-bold text-gold">500+</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Établissements</p>
             </div>
             <div>
                <p className="font-serif text-3xl font-bold text-gold">100+</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Expériences</p>
             </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 xl:p-10">
          <h2 className="text-2xl font-serif font-bold text-green-dark mb-2">Créer votre compte Partenaire</h2>
          <p className="text-gray-600 mb-8">Remplissez le formulaire ci-dessous pour postuler</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-green-dark mb-2">Nom de l'établissement</label>
                  <input
                    type="text"
                    name="structureName"
                    value={formData.structureName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-dark mb-2">Type d'activité</label>
                  <select
                    name="activityType"
                    value={formData.activityType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hôtel</option>
                    <option value="lounge">Lounge</option>
                    <option value="salon">Salon/SPA</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-green-dark hover:bg-green-darker text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Continuer
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-green-dark mb-2">Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-dark mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-green-dark hover:bg-green-darker text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-bold text-green-dark mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-dark mb-2">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-dark mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-dark hover:bg-green-darker text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Inscription...' : 'Soumettre'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
