import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Seo } from '../components/Seo';
import { ArrowRight, CheckCircle2, ImagePlus } from 'lucide-react';
import { registerPartner } from '../lib/partner.service';

const CATEGORY_MAP: Record<string, string> = {
  hebergement: 'Hébergements & Séjours',
  restaurant: 'Restaurants & Dining',
  lounge: 'Lounges & Nightlife',
  'beach-club': 'Beach Clubs & Loisirs',
  'bien-etre': 'Bien-être & Wellness',
  loisirs: 'Beach Clubs & Loisirs',
  autre: 'Autres',
};

export const PartnerRegistrationView: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '', establishmentType: 'restaurant',
    address: '', description: '', password: '', confirmPassword: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  };
  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setIsSubmitting(true);
    try {
      await registerPartner({
        businessName: form.businessName,
        email: form.email,
        password: form.password,
        whatsapp: form.phone,
        category: CATEGORY_MAP[form.establishmentType] || 'Autres',
        address: form.address,
        description: form.description,
        imageFile,
      });
      toast.success('Compte partenaire créé ! Votre établissement est en attente de validation.');
      setSubmitted(true);
    } catch (err: any) {
      const m = err?.message || '';
      setError(/already|registered|exists/i.test(m) ? 'Cet e-mail est déjà associé à un compte.' : (m || "Erreur lors de l'inscription."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <Seo
        title="Devenir Partenaire — Ivoire Business Club"
        description="Rejoignez le réseau IBC en tant qu'établissement partenaire : visibilité auprès d'une clientèle premium et nouveaux clients fidélisés."
        path="/partner-registration"
      />
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-3">Le réseau IBC</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-green-dark mb-3">Devenez partenaire IBC</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Créez votre compte établissement et connectez-vous à une clientèle active à la recherche d'expériences en Côte d'Ivoire.
          </p>
          <button type="button" onClick={() => navigate('/')} className="mt-3 text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted hover:text-gold transition-colors">← Retour à l'accueil</button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="bg-white border border-gold/15 rounded-2xl p-6 md:p-8 shadow-soft space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Nom de l'établissement *</label>
              <input type="text" required placeholder="Hôtel, Restaurant, Lounge…" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors" />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Catégorie *</label>
                <select value={form.establishmentType} onChange={(e) => set('establishmentType', e.target.value)} className="w-full bg-white border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none">
                  <option value="hebergement">Hébergement</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="lounge">Lounge / Nightlife</option>
                  <option value="beach-club">Beach Club</option>
                  <option value="bien-etre">Bien-être</option>
                  <option value="loisirs">Loisirs</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Zone / Quartier *</label>
                <input type="text" required placeholder="Cocody, Plateau, Marcory…" value={form.address} onChange={(e) => set('address', e.target.value)} className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Responsable</label>
                <input type="text" placeholder="Nom & Prénom" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Téléphone / WhatsApp *</label>
                <input type="tel" required placeholder="+225 07 XX XX XX XX" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Email professionnel *</label>
              <input type="email" required placeholder="contact@etablissement.ci" value={form.email} onChange={(e) => { set('email', e.target.value); setError(''); }} className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors" />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Mot de passe *</label>
                <input type="password" required minLength={6} placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Confirmer *</label>
                <input type="password" required minLength={6} placeholder="••••••••" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} className="w-full bg-transparent border-b border-gold/20 py-3 font-serif text-lg focus:border-gold outline-none transition-colors" />
              </div>
            </div>

            {/* Photo de l'établissement */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted block mb-2">Photo de l'établissement</label>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-2xl border border-gold/20">
                  <img src={imagePreview} alt="Aperçu" className="h-44 w-full object-cover" />
                  <label className="absolute bottom-2 right-2 cursor-pointer bg-white/90 text-green-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                    Changer
                    <input type="file" accept="image/*" className="hidden" onChange={onImage} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-gold/25 rounded-2xl cursor-pointer hover:bg-cream/40 transition-colors text-text-muted">
                  <ImagePlus size={24} className="text-gold" />
                  <span className="text-xs">Ajouter une photo (façade, salle, ambiance…)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onImage} />
                </label>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Description</label>
              <textarea placeholder="Décrivez votre établissement…" value={form.description} onChange={(e) => set('description', e.target.value)} className="w-full bg-cream/40 border border-gold/20 p-3 mt-1 font-sans text-sm focus:border-gold outline-none transition-colors rounded-lg min-h-24" />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-4 flex items-center justify-center gap-3 disabled:opacity-60">
              {isSubmitting ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Création du compte…</>
              ) : (
                <>Créer mon compte partenaire <ArrowRight size={18} /></>
              )}
            </button>
            <p className="text-[10px] text-text-muted text-center">
              Votre établissement sera visible après validation par notre équipe.
            </p>
            <div className="text-center">
              <button type="button" onClick={() => navigate('/login')} className="text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-green-dark transition-colors">Déjà partenaire ? Connectez-vous</button>
            </div>
          </form>
        ) : (
          <div className="bg-white border border-gold/15 rounded-2xl p-8 text-center shadow-soft">
            <CheckCircle2 size={48} className="text-green-dark mx-auto block mb-6" />
            <h4 className="text-2xl font-serif text-green-dark mb-3">Compte créé !</h4>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">
              Votre compte partenaire est créé. Votre établissement sera <strong className="text-green-dark">visible dans le catalogue après validation</strong> par notre équipe.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => navigate('/partner-dashboard')} className="btn-gold px-8">Accéder à mon espace</button>
              <button onClick={() => navigate('/')} className="px-8 py-3 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] rounded-[4px] hover:bg-green-dark hover:text-gold transition-all">Retour à l'accueil</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
