import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Star,
  MapPin,
  Users,
  CreditCard,
  Gift,
  Coffee,
  Utensils,
  Briefcase,
  Menu,
  X,
  Globe,
  Share2,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Lock,
  Wallet,
  Smartphone,

  LogOut,




  LayoutDashboard,
  Search,


  Award,
  TrendingUp,
  Banknote,
  Gamepad2,
  Heart,
  Hotel,
  BookOpen,   Scan,
} from 'lucide-react';

import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import type { Member, Transaction, Offer } from './lib/mock-api';
import { loginUser, registerMember, logoutUser, subscribeToAuthState, getCurrentMemberProfile } from './lib/auth.service';
import { getMemberTransactions } from './lib/transaction.service';
import { PartnerDashboardView } from './components/PartnerDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import ibcLogo from "./assets/ibc-logo.png";

const formatPrice = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<Member | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 50); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          const profile = await getCurrentMemberProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            const role = (profile as any).role;
            if (role === 'partner') navigate('/partner-dashboard');
            else if (role === 'admin') navigate('/admin-dashboard');
            else navigate('/member-dashboard');
          }
        } catch (e) { console.error('Profile load error:', e); }
      } else { setUser(null); }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password?: string) => {
    try {
      const userData = await loginUser(email, password || 'Demo1234!');
      setUser(userData);
      const role = (userData as any).role;
      if (role === 'partner') navigate('/partner-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else navigate('/member-dashboard');
      toast.success(`Bienvenue, ${userData.name}`);
    } catch (error: any) {
      const msg = error?.code === 'auth/invalid-credential'
        ? 'E-mail ou mot de passe incorrect'
        : error?.message || 'Erreur de connexion';
      toast.error(msg);
    }
  };

  const handleRegister = async (data: any) => {
    try {
      const userData = await registerMember({
        name: data.name,
        email: data.email,
        password: data.password || 'IBC' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        whatsapp: data.whatsapp,
        plan: data.plan || 'bronze',
      });
      setUser(userData);
      navigate('/member-dashboard');
      toast.success('Bienvenue dans le Club IBC !');
    } catch (error: any) {
      const msg = error?.code === 'auth/email-already-in-use'
        ? 'Cet e-mail est déjà utilisé'
        : error?.message || 'Erreur lors de l’inscription';
      toast.error(msg);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate('/');
    toast.success('À bientôt !');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <img src={ibcLogo} alt="IBC" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-green-dark font-serif text-sm uppercase tracking-widest">Ivoire Business Club</p>
        </div>
      </div>
    );
  }

  const isDashboard = location.pathname.includes('dashboard');

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Toaster position="top-center" toastOptions={{ className: 'font-sans text-sm' }} />
      {!isDashboard && (
        <Navbar
          scrolled={scrolled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentView={location.pathname}
          user={user}
        />
      )}
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/member-registration" element={<MemberRegistrationView onRegister={handleRegister} />} />
        <Route path="/partner-registration" element={<PartnerRegistrationView />} />
        <Route path="/establishments" element={<EstablishmentsView />} />
        <Route path="/offers" element={<EstablishmentsView />} />
        <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
        <Route path="/member-dashboard" element={user ? <MemberDashboardView user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/partner-dashboard" element={<PartnerDashboardView onLogout={handleLogout} />} />
        <Route path="/admin-dashboard" element={<AdminDashboardView onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!isDashboard && <Footer />}
    </div>
  );
};

const Navbar: React.FC<{ scrolled: boolean, mobileMenuOpen: boolean, setMobileMenuOpen: (o: boolean) => void, currentView: string, user: Member | null }> = ({ scrolled, mobileMenuOpen, setMobileMenuOpen, currentView, user }) => {
  const navigate = useNavigate();
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-premium py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3">
          <img src={ibcLogo} alt="IBC Logo" className="w-10 h-10" />
          <div>
            <span className={`font-serif text-base font-bold italic block leading-none ${scrolled ? 'text-green-dark' : 'text-white'}`}>Ivoire Business Club</span>
            <span className="text-gold text-[8px] uppercase tracking-[0.3em] font-bold">Prestige & Excellence</span>
          </div>
        </button>
        <div className="hidden md:flex items-center gap-10">
          {[{ name: 'Accueil', path: '/' }, { name: 'Partenaires', path: '/establishments' }, { name: 'Avantages', path: '/offers' }].map((item) => (
            <Link key={item.path} to={item.path} className={`relative font-medium text-[10px] uppercase tracking-widest transition-all duration-300 pb-0.5 border-b-2 ${currentView === item.path ? 'text-gold border-gold' : (scrolled ? 'text-text hover:text-gold border-transparent hover:border-gold' : 'text-white/90 hover:text-white border-transparent hover:border-white/60')}`}>{item.name}</Link>
          ))}
          <button type="button" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`font-medium text-[10px] uppercase tracking-widest transition-all duration-300 nav-link border-b-2 border-transparent hover:border-gold hover:text-gold pb-0.5 ${currentView === item.path ? 'text-gold border-gold' : (scrolled ? 'text-text hover:text-gold border-transparent hover:border-gold' : 'text-white/90 hover:text-white border-transparent hover:border-white/60')}`}>Contact</button>
          {user ? (
            <button onClick={() => navigate('/member-dashboard')} className="btn-gold !px-5 !py-2 text-[10px] flex items-center gap-2">Mon Dashboard</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${scrolled ? 'border-green-dark text-green-dark hover:bg-green-dark hover:text-gold' : 'border-white/30 text-white hover:bg-white hover:text-green-dark'}`}>Connexion</button>
              <button onClick={() => navigate('/member-registration')} className="btn-gold !px-5 !py-2 text-[10px]">S'inscrire</button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={24} className={scrolled ? 'text-green-dark' : 'text-white'} /> : <Menu size={24} className={scrolled ? 'text-green-dark' : 'text-white'} />}</button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-green-dark px-6 py-8 flex flex-col gap-6">
          {[{ name: 'Accueil', path: '/' }, { name: 'Partenaires', path: '/establishments' }, { name: 'Avantages', path: '/offers' }].map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`text-sm uppercase tracking-widest font-bold ${currentView === item.path ? 'text-gold' : 'text-white hover:text-gold'}`}>{item.name}</Link>
          ))}
          <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-sm uppercase tracking-widest font-bold text-white hover:text-gold text-left">Contact</button>
        </div>
      )}
    </nav>
  );
};

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-green-dark/80 z-10" />
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600" alt="Premium Hotel Abidjan" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 container mx-auto px-6 text-center text-white pt-24">
          <div className="inline-block border border-gold/30 px-6 py-2 mb-8">
            <span className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold">Plateforme Touristique & PROGRAMME DE FIDÉLITÉ</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight">
            Transformez vos loisirs<br />
            <span className="italic text-gold">en opportunités d'affaires.</span>
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto mb-12 leading-relaxed">Transformez vos dépenses touristiques en économies. Rejoignez le club privé des consommateurs qualifiés.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/member-registration')} className="btn-gold w-full sm:w-auto shadow-2xl text-sm sm:text-base">Rejoindre le Club</button>
            <button onClick={() => navigate('/partner-registration')} className="btn-outline w-full sm:w-auto !border-white/50 !text-white hover:!border-gold group text-sm sm:text-base">Devenir Partenaire</button>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto">
            {[{ label: 'Membres Actifs', value: '1,250+' }, { label: 'PARTENAIRES AGRÉÉS', value: '45+' }, { label: 'CASHBACK REDISTRIBUÉ', value: '15M+' }].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-serif text-2xl font-bold text-gold">{stat.value}</div>
                <div className="text-white/50 text-[9px] uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mechanism Section */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Mécanisme d’Excellence</span>
            <h2 className="font-serif text-4xl font-bold text-green-dark mt-4">Une Expérience en 4 Étapes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{ title: 'Inscrivez-vous', desc: 'Créez votre profil exclusif en quelques minutes.', icon: Users }, { title: 'Explorez', desc: 'Explorez notre catalogue d’établissements partenaires.', icon: MapPin }, { title: 'Consommez', desc: 'Accédez a des offres exclusives dans les hotels, restaurants et loisirs.', icon: Utensils }, { title: 'Gagnez', desc: 'Recevez votre cashback automatiquement selon votre statut.', icon: CreditCard }].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="p-8 bg-white border border-gold/10 hover:border-gold/30 transition-all group">
                  <div className="w-12 h-12 bg-green-dark text-gold font-serif font-bold text-lg flex items-center justify-center mb-6">{i + 1}</div>
                  <Icon size={24} className="text-gold mb-4" />
                  <h4 className="font-serif text-lg text-green-dark font-bold mb-3">{step.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Partners Section */}
      <section className="py-32 bg-green-dark">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">LE RÉSEAU IBC</span>
              <h2 className="font-serif text-4xl font-bold text-white mt-4">Nos Partenaires</h2>
            </div>
            <button onClick={() => navigate('/establishments')} className="btn-outline !text-white !border-white/30 hover:!border-gold text-xs md:text-sm px-4 py-2 md:px-6 md:py-3">Voir tout le catalogue</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{ name: 'Sofitel Abidjan', type: 'L’Hôtel Ivoire iconique', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800' }, { name: 'Sky Lounge', type: 'Vue panoramique sur Abidjan', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800' }, { name: 'Radisson Blu', type: 'Hub des affaires internationales', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800' }, { name: 'Pullman Helios', type: 'Excellence au coeur du Plateau', img: '/assets/pullman-hotel.png' }].map((p, i) => (
              <div key={i} className="group relative overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-dark/90 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <h4 className="font-serif text-white font-bold">{p.name}</h4>
                  <p className="text-gold text-[10px] uppercase tracking-widest">{p.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Experiences Section */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Catalogue Exclusif</span>
            <h2 className="font-serif text-4xl font-bold text-green-dark mt-4">Experiences Signature</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{ title: 'AFTERWORK SOCIAL', desc: 'Connectez-vous avec l’élite économique dans des lieux d’exception.', icon: Users }, { title: 'DINNER SIGNATURE', desc: 'Une table reservee, une experience culinaire hors du commun.', icon: Utensils }, { title: 'LUXURY ESCAPE', desc: 'Evadez-vous dans nos destinations partenaires les plus prisées.', icon: MapPin }, { title: 'WEEKEND ESCAPE', desc: 'Le repos bien mérité des batisseurs, dans un cadre serein.', icon: Coffee }].map((exp, i) => {
              const Icon = exp.icon;
              return (
                <div key={i} className="p-8 border border-gold/10 hover:border-gold/30 hover:shadow-premium transition-all group bg-white">
                  <Icon size={32} className="text-gold mb-6" />
                  <h4 className="font-serif text-sm font-bold text-green-dark mb-3 uppercase tracking-widest">{exp.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed mb-6">{exp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* LOYALTY PROGRAM - Section 4: Accumulez du cashback */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-gold/20 p-12 text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">PROGRAMME DE FIDÉLITÉ</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-green-dark leading-tight">
              Accumulez du cashback<br />selon votre Statut
            </h2>
          </div>
          {/* Badge inscription gratuite */}
          <div className="flex justify-start mb-10">
            <div className="inline-flex items-center gap-2 bg-yellow-300 text-green-dark px-4 py-2 font-bold text-sm">
              <CheckCircle2 size={16} />
              Inscription gratuite
            </div>
          </div>
          {/* Statuts */}
          <div className="mb-10">
            <p className="text-text font-medium mb-6 text-sm uppercase tracking-widest">Statuts :</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-700 to-yellow-500" />
                <span className="text-green-dark font-bold text-lg">Bronze : <span className="text-gold">3%</span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200" />
                <span className="text-green-dark font-bold text-lg">Or : <span className="text-gold">5%</span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-400 to-white border border-gray-200" />
                <span className="text-green-dark font-bold text-lg">Platinum : <span className="text-gold">7%</span></span>
              </div>
            </div>
          </div>
          <p className="text-green-dark font-serif text-xl italic">Rejoignez-nous et faites partie de la révolution touristique !</p>
        </div>
      </section>
      
      {/* Section 5: Devenez Membre du club */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-gold/20 p-12 text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">Inscription Gratuite</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-green-dark">Devenez Membre du club</h2>
          </div>
          <div className="border border-gold/10 p-8 bg-white/50">
            <p className="text-text-muted text-base italic text-center leading-relaxed">
              Rejoignez le cercle restreint des consommateurs privilégiés et bénéficiez
              des opportunites exclusives conçus pour l’élite.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Obtenez le Statut de depart */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-gold/20 p-12 text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">Inscription Gratuite</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-green-dark">Obtenez le Statut de depart</h2>
          </div>
          {/* Barre Membre Bronze */}
          <div className="bg-green-dark px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award size={20} className="text-gold" />
              <span className="text-white font-bold text-lg">Membre Bronze</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-yellow-400" />
              <span className="text-yellow-400 text-[10px] uppercase tracking-[0.3em] font-bold">Cashback 3% — Sur chaque depense</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section 7: Payez 500 FCFA/mois */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-gold/20 p-12 text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">Inscription Gratuite</span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-green-dark leading-tight">
              Payez 500 FCFA / mois de Frais<br />de participation au programme IBC
            </h2>
          </div>
          <div className="mb-8">
            <p className="text-text font-medium mb-6 text-sm">Mode de paiement :</p>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-white border border-gold/10">
                <Banknote size={20} className="text-gold" />
                <span className="text-green-dark font-medium">Espece</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white border border-gold/10">
                <Smartphone size={20} className="text-gold" />
                <span className="text-green-dark font-medium">Mobile Money</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/member-registration')}
            className="btn-gold w-full py-5 text-sm"
          >
            Confirmez mon adhesion
          </button>
        </div>
      </section>
      
      {/* Section 8: Devenir Partenaire */}
      <section className="py-32 bg-green-dark">
        <div className="container mx-auto px-6 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">Reseau Exclusif</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Devenir Partenaire</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nous vous connectons à une clientèle qualifiée et fidèle. Chaque transaction
            validee chez vous génère un cashback pour le membre et une visibilité pour votre établissement.
          </p>
          <button onClick={() => navigate('/partner-registration')} className="btn-gold !px-12">
            Rejoindre LE RÉSEAU IBC
          </button>
        </div>
      </section>

      {/* Section 9: Mon Dashboard */}
      <section className="py-24 bg-[#0a1f14]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">Espace Membre</span>
            <h2 className="font-serif text-4xl font-bold text-white">Mon Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
            <div className="border border-gold/20 p-8 flex items-center gap-6">
              <LayoutDashboard size={32} className="text-gold shrink-0" />
              <div>
                <p className="text-white font-bold font-serif">Tableau de bord</p>
                <p className="text-white/50 text-sm">Suivez vos cashbacks et activités</p>
              </div>
            </div>
            <div className="border border-gold/20 p-8 flex items-center gap-6">
              <BookOpen size={32} className="text-gold shrink-0" />
              <div>
                <p className="text-white font-bold font-serif">Catalogue partenaires</p>
                <p className="text-white/50 text-sm">Accédez à tous les établissements</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 border border-gold/30 px-5 py-2">
              <Banknote size={16} className="text-gold" />
              <span className="text-gold text-[10px] uppercase tracking-widest font-bold">Espece</span>
            </div>
            <div className="flex items-center gap-2 border border-gold/30 px-5 py-2">
              <Smartphone size={16} className="text-gold" />
              <span className="text-gold text-[10px] uppercase tracking-widest font-bold">Mobile Money</span>
            </div>
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/login')} className="btn-gold !px-12">
              Accéder à mon espace
            </button>
          </div>
        </div>
      </section>
      
      {/* Section 10: Nos Etablissements Partenaires */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="border border-gold/20 p-10 text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">Reseau Exclusif</span>
            <h2 className="font-serif text-4xl font-bold text-green-dark">Nos Etablissements Partenaires</h2>
          </div>
          {/* Filtres avec icones */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <button onClick={() => navigate('/establishments')} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-green-dark text-gold border border-gold">Tous</button>
            <button onClick={() => navigate('/establishments')} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-text-muted border border-gold/10 flex items-center gap-2">
              <Hotel size={14} />Hebergement
            </button>
            <button onClick={() => navigate('/establishments')} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-text-muted border border-gold/10 flex items-center gap-2">
              <Utensils size={14} />Restauration
            </button>
            <button onClick={() => navigate('/establishments')} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-text-muted border border-gold/10 flex items-center gap-2">
              <Gamepad2 size={14} />Loisirs
            </button>
            <button onClick={() => navigate('/establishments')} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-text-muted border border-gold/10 flex items-center gap-2">
              <Heart size={14} />Bien-etre
            </button>
          </div>
          {/* Cards partenaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[{ name: 'Sofitel Abidjan', cat: 'Hebergement', zone: 'Cocody', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' }, { name: 'Sky Lounge', cat: 'Restauration', zone: 'Marcory', cashback: '5%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' }, { name: 'Radisson Blu', cat: 'Hebergement', zone: 'Port-Bouet', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=400' }, { name: 'Maison Akoula', cat: 'Loisirs', zone: 'Assinie', cashback: '5%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' }, { name: 'Le Grand Large', cat: 'Restauration', zone: 'Zone 4', cashback: '5%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' }, { name: 'Pullman Helios', cat: 'Hebergement', zone: 'Plateau', cashback: '3-7%', img: '/assets/pullman-hotel.png' }].map((place, i) => (
              <div key={i} className="bg-white border border-gold/10 overflow-hidden hover:border-gold/30 hover:shadow-premium transition-all group">
                <div className="relative overflow-hidden h-48">
                  <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 bg-green-dark text-gold text-[9px] uppercase tracking-widest font-bold px-3 py-1">{place.cat}</span>
                </div>
                <div className="p-6">
                  <h4 className="font-serif text-green-dark font-bold mb-2">{place.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-text-muted text-xs"><MapPin size={12} />{place.zone}</span>
                    <span className="bg-green-dark/10 text-green-dark text-[10px] font-bold px-3 py-1">Cashback {place.cashback}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/establishments')} className="btn-gold flex items-center gap-3 mx-auto">
              <BookOpen size={18} />
              Voir tout le Catalogue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const MemberRegistrationView: React.FC<{ onRegister: (data: any) => void }> = ({ onRegister }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', plan: 'or', paymentMethod: 'orange' });
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onRegister(formData); };
  return (
    <div className="min-h-screen bg-cream py-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="border border-gold/20 p-12 mb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">Inscription Gratuite</span>
          <h2 className="font-serif text-4xl font-bold text-green-dark">Devenez Membre du club</h2>
          <p className="text-text-muted mt-4 italic text-sm leading-relaxed">
            Transformez vos dépenses touristiques en économies. Rejoignez le club privé des consommateurs qualifiés
            et bénéficiez de privileges exclusives dans les plus beaux etablissements de Cote d'Ivoire.
          </p>
        </div>
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-10 flex items-center justify-center font-bold font-serif transition-all ${step >= s ? 'bg-green-dark text-gold shadow-gold' : 'bg-white text-gold/30 border border-gold/10'}`}>
              {step > s ? <CheckCircle2 size={18} /> : s}
            </div>
          ))}
        </div>
        {step === 1 && (
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-green-dark">Informations Personnelles</h3>
            <div><label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Nom Complet</label>
              <input type="text" placeholder="M. / Mme Nom Prenom" className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Email Professionnel</label>
              <input type="email" placeholder="email@compagnie.ci" className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
            <div><label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Numero WhatsApp</label>
              <div className="flex items-center border-b border-gold/20">
                <span className="text-text-muted text-sm pr-3">+225</span>
                <input type="tel" placeholder="07 00 00 00 00" className="flex-1 bg-transparent py-4 font-serif text-lg focus:outline-none" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
              </div></div>
            <button onClick={handleNext} className="btn-gold w-full py-4">Continuer</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-green-dark">Selection du Forfait</h3>
            {[{ id: 'bronze', name: 'Membre Bronze', price: '500 FCFA / mois', perks: 'Cashback 3% sur chaque depense' }, { id: 'or', name: 'Membre Or', price: '2.500 FCFA / mois', perks: 'Cashback 5% + Conciergerie' }, { id: 'platinum', name: 'Membre Platinum', price: '10.000 FCFA / mois', perks: 'Cashback 7% + Acces VIP' }].map((p) => (
              <div key={p.id} onClick={() => setFormData({...formData, plan: p.id})} className={`p-6 border cursor-pointer transition-all flex items-center justify-between ${formData.plan === p.id ? 'bg-green-dark text-white border-gold shadow-lg' : 'bg-white text-green-dark border-gold/10 hover:border-gold/30'}`}>
                <div><p className="font-bold font-serif">{p.name}</p><p className="text-sm opacity-70">{p.perks}</p></div>
                <div className="flex items-center gap-4"><span className="font-bold">{p.price}</span>{formData.plan === p.id && <CheckCircle2 size={20} className="text-gold" />}</div>
              </div>
            ))}
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 py-4 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] hover:bg-green-dark hover:text-white transition-all">Retour</button>
              <button onClick={handleNext} className="flex-1 btn-gold py-4">Continuer</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-serif text-2xl text-green-dark">Mode de Paiement</h3>
            <div className="grid grid-cols-2 gap-4">
              {[{ id: 'orange', name: 'Orange Money', icon: <Smartphone size={24} /> }, { id: 'wave', name: 'Wave', icon: <Smartphone size={24} /> }, { id: 'moov', name: 'Moov Money', icon: <Smartphone size={24} /> }, { id: 'espece', name: 'Espece', icon: <Banknote size={24} /> }].map((m) => (
                <div key={m.id} onClick={() => setFormData({...formData, paymentMethod: m.id})} className={`p-6 border cursor-pointer transition-all text-center flex flex-col items-center gap-4 ${formData.paymentMethod === m.id ? 'bg-green-dark text-white border-gold shadow-lg' : 'bg-white text-green-dark border-gold/10 hover:border-gold/30'}`}>
                  {m.icon}<span className="font-bold text-sm">{m.name}</span>
                  {formData.paymentMethod === m.id && <CheckCircle2 size={18} className="text-gold" />}
                </div>
              ))}
            </div>
            <p className="text-text-muted text-xs text-center">En cliquant sur confirmer, vous acceptez notre Charte de Confidentialite et les Conditions Generales du Club.</p>
            <div className="flex gap-4">
              <button type="button" onClick={handleBack} className="flex-1 py-4 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] hover:bg-green-dark hover:text-white transition-all">Retour</button>
              <button type="submit" className="flex-1 btn-gold py-4">Confirmez mon adhesion</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const MemberDashboardView: React.FC<{ user: Member, onLogout: () => void }> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try { const txs = await getMemberTransactions(user.uid); setTransactions(txs); } catch (e) { console.error(e); }
      setOffers([{ id: 'off_1', partnerName: 'Hotel Tiama', description: '-20% sur les suites Junior', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200' }, { id: 'off_2', partnerName: 'Le Grand Large', description: 'Degustation privee offerte', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200' }, { id: 'off_3', partnerName: 'Sofitel', description: 'Acces Spa VIP illimite', imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=200' }]);
    };
    fetchData();
  }, [user.uid]);
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-green-dark py-6 px-6 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gold hover:text-white transition-colors"><ChevronLeft size={18} />Retour au site</button>
        <div className="flex items-center gap-3">
          <div className="text-right"><p className="text-white/60 text-[10px] uppercase tracking-widest">Bienvenue,</p><p className="text-white font-serif font-bold">{user.name}</p></div>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1B3A2D&color=C9A84C`} alt="Avatar" className="w-10 h-10 rounded-full border border-gold/30" />
        </div>
      </div>
      <div className="container mx-auto px-6 py-12 max-w-2xl space-y-8">
        <div className="bg-green-dark p-8 border border-gold/20">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gold">Niveau {user.tier}</span>
            <span className="text-white/40 text-xs">Votre cashback augmente avec votre niveau</span>
          </div>
          <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] mb-2">Mon Compte Cashback IBC</p>
          <p className="font-serif text-5xl font-bold text-white">{formatPrice(user.balance)} <span className="text-gold text-2xl">FCFA</span></p>
          <p className="text-white/40 text-xs mt-4">Cashback credite automatiquement apres chaque visite validee.</p>
        </div>
        <button onClick={() => setShowQR(true)} className="w-full bg-white text-green-dark p-8 border border-gold shadow-gold flex flex-col items-center gap-4 hover:scale-[1.02] transition-transform">
          <Scan size={32} className="text-gold" />
          <div className="text-center">
            <p className="font-bold font-serif text-lg">Mon QR Code</p>
            <p className="text-text-muted text-sm">Cliquez pour valider vos privileges</p>
          </div>
        </button>
        <div className="grid grid-cols-2 gap-4">
          {[{ label: 'Total Depense', value: formatPrice(user.totalSpent), unit: 'FCFA' }, { label: 'Visites ce mois', value: user.visitsThisMonth, unit: 'LIEUX' }].map((stat, i) => (
            <div key={i} className="bg-white border border-gold/10 p-6 text-center">
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">{stat.label}</p>
              <p className="font-serif text-3xl font-bold text-green-dark">{stat.value}</p>
              <p className="text-[9px] text-gold uppercase tracking-widest mt-1">{stat.unit}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl text-green-dark font-bold">Offres Exclusives</h3>
            <button onClick={() => navigate('/offers')} className="text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-gold">Voir tout</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {offers.map((offer, i) => (
              <div key={i} className="min-w-[200px] bg-white border border-gold/10">
                <img src={offer.imageUrl} alt={offer.partnerName} className="w-full h-28 object-cover" />
                <div className="p-4"><p className="font-bold text-sm text-green-dark">{offer.partnerName}</p><p className="text-text-muted text-xs">{offer.description}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-serif text-xl text-green-dark font-bold mb-6">Activités Récentes</h3>
          {transactions.map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gold/10">
              <div><p className="font-bold text-green-dark">{tx.partnerName}</p><p className="text-text-muted text-xs">{tx.date}</p></div>
              <div className="text-right"><p className="font-bold text-green-dark">+{formatPrice(tx.cashback)} FCFA</p><p className="text-[9px] text-gold uppercase">{tx.status.toUpperCase()}</p></div>
            </div>
          ))}
        </div>
      </div>
      {showQR && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
          <div className="bg-white p-8 max-w-xs w-full text-center relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-green-dark"><X size={20} /></button>
            <h3 className="font-serif text-xl text-green-dark mb-2">Votre Pass IBC</h3>
            <p className="text-text-muted text-xs mb-6">{user.name} - Membre {user.tier.toUpperCase()}</p>
            <QRCodeSVG value={`IBC-MEMBER-${user.uid}`} size={180} className="mx-auto" />
            <p className="text-text-muted text-xs mt-6">Presentez ce code a l accueil de l etablissement.</p>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-green-dark border-t border-gold/20 flex justify-around py-4 z-40">
        <button className="flex flex-col items-center gap-1 text-gold"><LayoutDashboard size={20} /><span className="text-[9px] uppercase tracking-widest">Dashboard</span></button>
        <button onClick={() => navigate('/establishments')} className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors"><MapPin size={20} /><span className="text-[9px] uppercase tracking-widest">Lieux</span></button>
        <button onClick={() => navigate('/offers')} className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors"><Gift size={20} /><span className="text-[9px] uppercase tracking-widest">Offres</span></button>
        <button onClick={onLogout} className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors"><LogOut size={20} /><span className="text-[9px] uppercase tracking-widest">Compte</span></button>
      </div>
    </div>
  );
};

const EstablishmentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Tous');
  const places = [
    { name: 'Sofitel Abidjan', cat: 'Hebergement', zone: 'Cocody', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' },
    { name: 'Pullman Helios', cat: 'Hebergement', zone: 'Plateau', cashback: '3-7%', img: '/assets/pullman-hotel.png' },
    { name: 'Sky Lounge', cat: 'Restauration', zone: 'Marcory', cashback: '5%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
    { name: 'Radisson Blu', cat: 'Hebergement', zone: 'Port-Bouet', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Maison Akoula', cat: 'Loisirs', zone: 'Assinie', cashback: '5%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Le Grand Large', cat: 'Restauration', zone: 'Zone 4', cashback: '5%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
  ];
  const filteredPlaces = places.filter(p =>
    (filter === 'Tous' || p.cat === filter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filterIcons: Record<string, React.ReactNode> = { 'Hebergement': <Hotel size={14} />, 'Restauration': <Utensils size={14} />, 'Loisirs': <Gamepad2 size={14} />, 'Bien-etre': <Heart size={14} /> };
  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Reseau Exclusif</span>
          <h2 className="font-serif text-4xl font-bold text-green-dark mt-4">Nos Etablissements Partenaires</h2>
        </div>
        <div className="relative mb-8">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Rechercher un lieu ou une zone..." className="w-full bg-white border border-gold/10 py-5 pl-16 pr-6 font-serif text-lg focus:border-gold outline-none shadow-premium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3 mb-12">
          {['Tous', 'Hebergement', 'Restauration', 'Loisirs', 'Bien-etre'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${filter === f ? 'bg-green-dark text-gold border border-gold shadow-gold' : 'bg-white text-text-muted border border-gold/10'}`}>
              {filterIcons[f]}{f}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, i) => (
            <div key={i} className="bg-white border border-gold/10 overflow-hidden hover:border-gold/30 hover:shadow-premium transition-all group">
              <div className="relative overflow-hidden h-56">
                <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 left-3 bg-green-dark text-gold text-[9px] uppercase tracking-widest font-bold px-3 py-1">{place.cat}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif text-green-dark font-bold">{place.name}</h4>
                  <div className="flex items-center gap-1 text-gold text-xs"><Star size={12} fill="currentColor" />5.0</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-text-muted text-xs"><MapPin size={12} />{place.zone}</span>
                  <span className="bg-green-dark/10 text-green-dark text-[10px] font-bold px-3 py-1">Cashback {place.cashback}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredPlaces.length === 0 && (
          <div className="text-center py-20">
            <h4 className="font-serif text-2xl text-green-dark mb-4">Aucun etablissement trouve</h4>
            <p className="text-text-muted">Essayez d'élargir votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginView: React.FC<{ onLogin: (email: string, password?: string) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!email) return toast.error('Veuillez entrer votre email'); onLogin(email, password); };
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-24">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <img src={ibcLogo} alt="IBC Logo" className="w-16 h-16 mx-auto mb-6" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">Acces Prive</span>
          <h2 className="font-serif text-3xl font-bold text-green-dark">Portail des Membres</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div><label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Email</label>
            <input type="email" className="w-full bg-transparent border-b border-gold/20 py-3 font-serif focus:border-gold outline-none transition-colors" placeholder="Votre email professionnel" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Mot de passe</label>
            <input type="password" className="w-full bg-transparent border-b border-gold/20 py-3 font-serif focus:border-gold outline-none transition-colors" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button type="submit" className="btn-gold w-full py-4">Entrer dans le Club</button>
        </form>
        <p className="text-center mt-8 text-text-muted text-sm">Pas encore membre ?</p>
        <button onClick={() => navigate('/member-registration')} className="w-full text-center text-green-dark text-xs font-bold uppercase tracking-[0.2em] border-b border-gold hover:text-gold transition-colors mt-2">Rejoindre LE RÉSEAU IBC</button>
      </div>
    </div>
  );
};

const PartnerRegistrationView: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ businessName: '', contactName: '', email: '', phone: '', establishmentType: 'restaurant', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); toast.success('Merci pour votre interet ! Nous vous contactons très bientôt.'); setSubmitted(true); setTimeout(() => navigate('/'), 3000); };
  return (
    <div className="min-h-screen bg-cream py-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="border border-gold/20 p-12 mb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">Partenariat</span>
          <h2 className="font-serif text-4xl font-bold text-green-dark">Devenez Partenaire IBC</h2>
          <p className="text-text-muted mt-4 text-sm leading-relaxed">Rejoignez notre reseau exclusif et developpez votre clientèle avec les membres du Club IBC.</p>
        </div>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {[{ label: 'Nom de l’Établissement', key: 'businessName', placeholder: 'Hotel, Restaurant ou Service', type: 'text' }, { label: 'Responsable', key: 'contactName', placeholder: 'Nom & Prenom', type: 'text' }, { label: 'Email', key: 'email', placeholder: 'contact@etablissement.ci', type: 'email' }, { label: 'Telephone', key: 'phone', placeholder: '+225 04 XX XX XX XX', type: 'tel' }].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors" value={formData[field.key as keyof typeof formData]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} required />
              </div>
            ))}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Type d Etablissement</label>
              <select className="w-full bg-white border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none" value={formData.establishmentType} onChange={(e) => setFormData({...formData, establishmentType: e.target.value})}>
                <option value="restaurant">Restaurant</option>
                <option value="hotel">Hotel</option>
                <option value="spa">Spa & Wellness</option>
                <option value="golf">Golf & Loisirs</option>
                <option value="service">Service Premium</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Description</label>
              <textarea placeholder="Décrivez votre etablissement..." className="w-full bg-transparent border border-gold/20 p-4 font-sans text-sm focus:border-gold outline-none transition-colors rounded min-h-24" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <button type="submit" className="btn-gold w-full py-4 flex items-center justify-center gap-3">Soumettre ma Candidature <ArrowRight size={18} /></button>
          </form>
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 size={48} className="text-green-dark mx-auto mb-6" />
            <h4 className="text-2xl font-serif text-green-dark mb-4">Merci !</h4>
            <p className="text-text-muted mb-6">Votre demande a ete recue. Notre equipe vous contactera très bientôt.</p>
            <button onClick={() => navigate('/')} className="btn-gold">Retour a l accueil</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05150c] text-white pt-32 pb-12 border-t border-gold/20" id="contact">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-8">
              <img src={ibcLogo} alt="IBC Logo" className="w-16 h-16 border border-gold/30 p-1" />
              <div>
                <span className="font-serif text-2xl font-bold italic block leading-none">Ivoire Business Club</span>
                <span className="text-gold text-[9px] uppercase tracking-[0.4em] font-bold">Prestige & Excellence</span>
              </div>
            </div>
            <p className="text-white/50 text-sm max-w-sm leading-relaxed mb-10 font-light">L'excellence au sommet. Votre passerelle exclusive vers le monde du luxe et des affaires en Cote d'Ivoire.</p>
            <div className="flex gap-6">
              {[Globe, Share2, MessageSquare].map((Icon, i) => (
                <button key={i} type="button" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all"><Icon size={18} /></button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-serif text-gold text-lg mb-8 tracking-wide">Navigation</h4>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {[{ label: 'Privilèges', path: '/offers' }, { label: 'Partenariats', path: '/partner-registration' }, { label: 'Événements', path: '/' }, { label: 'Adhésion', path: '/member-registration' }].map((item) => (
                <li key={item.label}><Link to={item.path} className="hover:text-white transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-serif text-gold text-lg mb-8 tracking-wide">Services</h4>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {[{ label: 'Conciergerie', path: '/offers' }, { label: 'Networking', path: '/establishments' }, { label: 'Cashback', path: '/member-registration' }, { label: 'Sponsoring', path: '/partner-registration' }].map((item) => (
                <li key={item.label}><Link to={item.path} className="hover:text-white transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <h4 className="font-serif text-gold text-lg mb-8 tracking-wide">Contacts</h4>
            <ul className="space-y-6 text-sm font-light text-white/60">
              <li className="flex items-start gap-4"><MapPin size={18} className="text-gold shrink-0" /><span>Abidjan, Cote d'Ivoire<br />Cocody Ambassades</span></li>
              <li className="flex items-center gap-4"><Briefcase size={18} className="text-gold shrink-0" /><span>+225 704 14 13 13</span></li>
              <li className="flex items-center gap-4"><Star size={18} className="text-gold shrink-0" /><span>contact@ibc.ci</span></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] text-white/20 uppercase tracking-[0.4em]">
          <div>2026 IVOIRE BUSINESS CLUB. L'excellence au sommet.</div>
          <div className="flex gap-10">
            {['Mentions Legales', 'Confidentialite', 'CGU'].map((item) => (
              <button key={item} type="button" className="hover:text-white transition-colors">{item}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;
