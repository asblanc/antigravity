import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { MapPin, Crown, Banknote, Wallet, Gift, TrendingUp, Users, Star, Sparkles, Smartphone, CheckCircle2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const MemberRegistrationView: React.FC<{ onRegister: (data: any) => Promise<void> }> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrerId = searchParams.get('ref') || undefined; // parrain via lien ?ref=
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', plan: 'bronze', paymentMethod: 'orange', password: '', confirmPassword: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pwError, setPwError] = useState('');

  // Force du mot de passe (0–4)
  const pwScore = (() => {
    const p = formData.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
    return p ? Math.min(s, 4) : 0;
  })();
  const pwMeta = [
    { label: '', color: '' },
    { label: 'Faible', color: 'bg-red-500' },
    { label: 'Moyen', color: 'bg-amber-500' },
    { label: 'Bon', color: 'bg-lime-500' },
    { label: 'Excellent', color: 'bg-green-600' },
  ][pwScore];
  const stepLabels = ['Informations personnelles', 'Choix d’adhésion', 'Paiement sécurisé'];

  const handleBack = () => setStep(Math.max(1, step - 1));
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Remonte en haut à chaque changement d'étape (le formulaire peut être long).
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const checkEmailExists = async (): Promise<boolean> => {
    if (!formData.email) {
      setEmailError('Veuillez saisir votre adresse email.');
      return false;
    }
    if (formData.email.toLowerCase().includes('demo')) return true;

    try {
      setCheckingEmail(true);
      setEmailError('');
      // In Supabase, duplicate email check is usually handled at signUp.
      // But we can check if a profile already exists.
      const { data } = await supabase.from('profiles').select('id').eq('email', formData.email).single();
      if (data) {
        setEmailError('Cet email est déjà utilisé.');
        return false;
      }
      return true;
    } catch (error: any) {
      // If profile doesn't exist, it throws an error or returns null depending on the query
      return true;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleNext = async () => {
    if (step === 2) {
      const isEmailAvailable = await checkEmailExists();
      if (!isEmailAvailable) return;
    }

    setStep(Math.min(3, step + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setPwError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPwError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPwError('');

    setIsSubmitting(true);
    try {
      await onRegister({ ...formData, photoFile, referrerId });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <Seo
        title="Devenir Membre — Ivoire Business Club"
        description="Rejoignez le club privé IBC : adhésion Bronze, Silver ou Gold, cashback sur vos sorties et avantages exclusifs en Côte d'Ivoire."
        path="/member-registration"
      />
      <div className="container mx-auto px-6 max-w-5xl">
        {/* En-tête */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-3">Le club privé</span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-green-dark mb-4">Bienvenue dans votre univers IBC</h1>
          <p className="text-text-muted max-w-xl mx-auto text-base md:text-lg">
            Rejoignez une communauté exclusive et profitez d'un écosystème d'avantages pensés pour vous.
          </p>
          <p className="text-text-muted text-xs mt-3">Adhésion à partir de <strong className="text-green-dark">500 FCFA / mois</strong></p>
          <button type="button" onClick={() => navigate('/')} className="mt-4 text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted hover:text-gold transition-colors">← Retour à l'accueil</button>
        </div>

        {/* FORMULAIRE — visible immédiatement après l'en-tête */}
        <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
          {stepLabels.map((label, index) => (
            <button key={label} type="button" onClick={() => setStep(index + 1)} className={`border rounded-full p-4 text-left transition-all ${step === index + 1 ? 'bg-green-dark text-gold border-gold shadow-soft' : 'bg-white text-green-dark border-gold/10 hover:border-gold hover:shadow-sm'}`}>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1">Étape {index + 1}</p>
              <p className="text-sm font-semibold leading-snug">{label}</p>
            </button>
          ))}
        </div>
        {step === 1 && (
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-green-dark">Informations Personnelles</h3>
            <div><label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Nom Complet</label>
              <input type="text" placeholder="M. / Mme Nom Prenom" className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Email Professionnel</label>
              <input type="email" placeholder="email@compagnie.ci" className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors" value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setEmailError(''); }} />
              {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
            </div>
            <div><label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Numero WhatsApp</label>
              <div className="flex items-center border-b border-gold/20">
                <span className="text-text-muted text-sm pr-3">+225</span>
                <input type="tel" placeholder="07 00 00 00 00" className="flex-1 bg-transparent py-4 font-serif text-lg focus:outline-none" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
              </div></div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Photo de profil</label>
              <div className="flex flex-col gap-3">
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm text-text-muted" />
                {photoPreview ? (
                  <div className="overflow-hidden rounded-3xl border border-gold/20 bg-white p-3">
                    <img src={photoPreview} alt="Aperçu" className="h-40 w-full object-cover rounded-3xl" />
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted">Téléchargez une photo pour votre carte membre IBC.</p>
                )}
              </div>
            </div>
            <button onClick={handleNext} disabled={checkingEmail} className="btn-gold w-full py-4 disabled:opacity-50">{checkingEmail ? 'Vérification...' : 'Continuer'}</button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => navigate('/login')} className="text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-green-dark transition-colors">Déjà membre ? Connectez-vous</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-10">
            {/* Bienvenue dans votre univers IBC */}
            <div className="text-center md:text-left space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">L'UNIVERS IVOIRE BUSINESS CLUB</span>
              <h3 className="font-serif text-3xl font-bold text-green-dark">Bienvenue dans votre univers IBC</h3>
              <p className="text-text-muted leading-relaxed text-sm md:text-base">
                Découvrez une nouvelle façon de vivre vos escapades, voyages et sorties lifestyle. 
                Avec Ivory Business Club, chaque dépense chez nos partenaires génère du <strong className="text-green-dark">cashback automatique</strong>, 
                vous permettant de financer vos futures expériences et d'évoluer à travers nos statuts exclusifs.
              </p>
            </div>

            {/* Statuts Tiers (Bronze, Or, Platinum) */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Bronze */}
              <div className="bg-white border border-[#8C6239]/20 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#8C6239] transition-all duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#8C6239] text-white flex items-center justify-center text-xs shrink-0">
                      <Star size={10} fill="currentColor" />
                    </span>
                    <h4 className="font-serif font-bold text-[#8C6239] text-sm">Bronze</h4>
                  </div>
                  <p className="text-[8px] uppercase tracking-wider text-text-muted mb-3 font-semibold">Discovery Member</p>
                  <ul className="text-left text-[11px] text-text-muted space-y-1.5">
                    {['Jusqu\'à 3% de cashback', 'Accès aux expériences partenaires', 'Invitations événements découverte'].map((t) => (
                      <li key={t} className="flex items-start gap-1.5"><Check size={12} className="text-gold shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 border-t border-gold/10 pt-3 text-[10px] font-bold text-[#8C6239]">
                  Inclus (500 FCFA/mois)
                </div>
              </div>

              {/* Or */}
              <div className="bg-white border border-gold/20 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-gold transition-all duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-gold text-[#031d0f] flex items-center justify-center text-xs shrink-0">
                      <Crown size={10} fill="currentColor" />
                    </span>
                    <h4 className="font-serif font-bold text-gold text-sm">Or</h4>
                  </div>
                  <p className="text-[8px] uppercase tracking-wider text-text-muted mb-3 font-semibold">Privilege Member</p>
                  <ul className="text-left text-[11px] text-text-muted space-y-1.5">
                    {['Jusqu\'à 5% de cashback', 'Accès prioritaire réservations', 'Invitations cocktails VIP'].map((t) => (
                      <li key={t} className="flex items-start gap-1.5"><Check size={12} className="text-gold shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 border-t border-gold/10 pt-3 text-[10px] font-bold text-gold">
                  Dès 15 000 pts cumulés
                </div>
              </div>

              {/* Platinum */}
              <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-500 transition-all duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs shrink-0">
                      <Sparkles size={10} fill="currentColor" />
                    </span>
                    <h4 className="font-serif font-bold text-slate-500 text-sm">Platinum</h4>
                  </div>
                  <p className="text-[8px] uppercase tracking-wider text-text-muted mb-3 font-semibold">Elite Member</p>
                  <ul className="text-left text-[11px] text-text-muted space-y-1.5">
                    {['Jusqu\'à 7% de cashback', 'Conciergerie privée WhatsApp', 'Surclassements hôteliers VIP'].map((t) => (
                      <li key={t} className="flex items-start gap-1.5"><Check size={12} className="text-gold shrink-0 mt-0.5" /><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 border-t border-gold/10 pt-3 text-[10px] font-bold text-slate-500">
                  Dès 30 000 pts cumulés
                </div>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex gap-4 border-t border-gold/15 pt-8">
              <button onClick={handleBack} className="flex-1 py-4 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] hover:bg-green-dark hover:text-white transition-all">Retour</button>
              <button onClick={handleNext} className="flex-1 btn-gold py-4">Continuer</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">A retenir :</p>
              <h3 className="font-serif text-3xl text-green-dark">Rejoignez IVOIRE BUSINESS CLUB</h3>
              <p className="text-text-muted text-sm md:text-base leading-relaxed">
                Accédez à un univers d’expériences locales, d’avantages exclusifs et d’établissements sélectionnés à travers la Côte d’Ivoire.
                Votre adhésion membre commence à partir de 500 FCFA / mois.
              </p>
              <div className="border-t border-gold/10 pt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-2">Étape 3/3</p>
                <h4 className="font-serif text-2xl text-green-dark font-bold">Finaliser mon adhésion</h4>
                <p className="text-text-muted text-sm mt-2">Choisissez un mot de passe et un mode de paiement.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Mot de passe</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Confirmez le mot de passe</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Force du mot de passe */}
            {formData.password && (
              <div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwScore ? pwMeta.color : 'bg-gold/15'}`} />
                  ))}
                </div>
                {pwMeta.label && <p className="text-[10px] text-text-muted mt-1.5">Sécurité : <strong className="text-green-dark">{pwMeta.label}</strong></p>}
              </div>
            )}
            {pwError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[{ id: 'orange', name: 'Orange Money', icon: <Smartphone size={24} /> }, { id: 'wave', name: 'Wave', icon: <Smartphone size={24} /> }, { id: 'moov', name: 'Moov Money', icon: <Smartphone size={24} /> }, { id: 'mtn', name: 'MTN Money', icon: <Smartphone size={24} /> }].map((m) => (
                <div key={m.id} onClick={() => setFormData({...formData, paymentMethod: m.id})} className={`p-6 border cursor-pointer transition-all text-center flex flex-col items-center gap-4 ${formData.paymentMethod === m.id ? 'bg-green-dark text-white border-gold shadow-lg' : 'bg-white text-green-dark border-gold/10 hover:border-gold/30'}`}>
                  {m.icon}<span className="font-bold text-sm">{m.name}</span>
                  {formData.paymentMethod === m.id && <CheckCircle2 size={18} className="text-gold" />}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button type="button" onClick={handleBack} disabled={isSubmitting} className="flex-1 py-4 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] hover:bg-green-dark hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">Étape précédente</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#C9A84C] text-[#1B5E35] font-bold rounded-[4px] py-4 uppercase tracking-widest text-[10px] hover:bg-[#F0C040] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Traitement en cours...
                  </>
                ) : 'CONFIRMEZ MON ADHÉSION'}
              </button>
            </div>
            <div className="text-center mt-4">
              <button type="button" onClick={() => navigate('/')} className="text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-green-dark transition-colors">Retour à l'accueil</button>
            </div>
            <p className="text-text-muted text-xs text-center mt-4">En cliquant sur confirmer, vous acceptez notre Charte de Confidentialité et les Conditions Générales du Club.</p>
          </form>
        )}
        </div>

        {/* ─── INFOS COMPLÉMENTAIRES (sous le formulaire) ─── */}
        <div className="mt-20 space-y-16">
          {/* Avantages */}
          <div>
            <div className="text-center mb-8">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">Pourquoi rejoindre IBC</span>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-green-dark">Un écosystème d'avantages pensé pour vous</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Wallet, title: 'Cashback automatique', desc: "Chaque paiement chez nos partenaires crédite votre compte, suivi en temps réel sur votre dashboard." },
                { icon: Gift, title: 'Ma Cagnotte IBC', desc: 'Votre capital plaisir disponible, utilisable en un clic pour régler vos consommations partenaires.' },
                { icon: TrendingUp, title: 'Objectifs Évasion', desc: "Fixez un but (séjour, weekend) et laissez votre cashback financer l'escapade de vos rêves." },
                { icon: Banknote, title: 'Épargne Club', desc: 'Mettez de côté une partie de votre cashback dans une tirelire voyage dédiée.' },
                { icon: Users, title: 'Cercle Évasion', desc: 'Fusionnez vos cagnottes avec vos proches pour des escapades collectives inoubliables.' },
                { icon: Crown, title: 'Statuts évolutifs', desc: 'Bronze, Or, Platinum : plus vous explorez, plus vos privilèges augmentent.' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gold/10 hover:border-gold/30 hover:shadow-soft rounded-2xl p-5 flex items-start gap-4 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center shrink-0 border border-gold/20">
                    <item.icon size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-serif font-bold text-green-dark text-sm">{item.title}</h5>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandés */}
          <div>
            <div className="text-center mb-8">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">Recommandés pour vous</span>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-green-dark">Vivez des expériences d'exception</h3>
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Sunset Lounge', location: 'Abidjan, Cocody', discount: '-20%', img: '/hero-lounge.webp' },
                { name: 'Brunch & Chill', location: 'Bingerville', discount: '-15%', img: '/hero-restaurant.webp' },
                { name: 'Weekend Assinie', location: 'Assinie', discount: '-25%', img: '/hero-beach.webp' },
                { name: 'Sofitel Abidjan', location: 'Abidjan, Cocody', discount: '-20%', img: '/assets/pullman-hotel.png' },
              ].map((place, idx) => (
                <div key={idx} className="bg-white border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-soft transition-all duration-300 group">
                  <div className="relative overflow-hidden h-28">
                    <img src={place.img} alt={place.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-gold to-[#F0C040] text-green-darker text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded shadow-sm">{place.discount}</span>
                  </div>
                  <div className="p-3 text-left">
                    <h5 className="font-serif text-xs font-bold text-green-dark truncate">{place.name}</h5>
                    <p className="flex items-center gap-1 text-text-muted text-[9px] mt-0.5"><MapPin size={9} className="text-gold" /><span className="truncate">{place.location}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA bas de page */}
          <div className="text-center">
            <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-gold px-10 py-4">Compléter mon adhésion</button>
          </div>
        </div>
      </div>
    </div>
  );
};
