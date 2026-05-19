import React, { useState } from 'react';

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
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-serif font-bold text-green-dark mb-2">Partenariat</h2>
          <p className="text-gray-600 mb-6">Rejoignez notre réseau de partenaires</p>

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
