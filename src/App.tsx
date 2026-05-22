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
  BookOpen,
  Scan,
  Compass,
  Sparkles,
  Crown,
  Headphones,
  Palmtree,
  Plane,
  PiggyBank,
  Leaf,
} from 'lucide-react';

import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import type { Member, Transaction, Offer } from './lib/mock-api';
import { loginUser, registerMember, logoutUser, subscribeToAuthState, getCurrentMemberProfile } from './lib/auth.service';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getMemberTransactions } from './lib/transaction.service';
import { PartnerDashboardView } from './components/PartnerDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { MemberDashboardView } from './components/MemberDashboardView';
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
      toast.success(`Bienvenue, ${userData.name} !`);
    } catch (error: any) {
      // Re-throw so LoginView can display inline error messages
      throw error;
    }
  };

  const handleRegister = async (data: any) => {
    try {
      const userData = await registerMember({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        whatsapp: data.phone || '',
        plan: data.plan || 'bronze',
        paymentMethod: data.paymentMethod,
        photoFile: data.photoFile || null,
      });
      setUser(userData);
      navigate('/member-dashboard');
      toast.success('Bienvenue dans le Club IBC !');
    } catch (error: any) {
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
      throw error;
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
  const isSolid = scrolled || currentView !== '/';
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isSolid ? 'bg-white shadow-premium py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3">
          <img src={ibcLogo} alt="IBC Logo" className="w-10 h-10" />
          <div className="flex flex-col items-start text-left">
            <span className={`font-serif text-lg font-bold italic block leading-none ${isSolid ? 'text-green-dark' : 'text-white'}`}>Ivoire Business Club</span>
            <span className="hidden lg:block text-gold text-[7px] uppercase tracking-[0.15em] font-bold mt-1 leading-tight max-w-[280px]">
PLATEFORME D'EXPÉRIENCES TOURISTIQUES<br />& CLUB PRIVÉ D'AVANTAGES
            </span>
          </div>
        </button>
        <div className="hidden md:flex items-center gap-10">
          {[{ name: 'Accueil', path: '/' }, { name: 'Partenaires', path: '/establishments' }, { name: 'Avantages', path: '/offers' }].map((item) => (
            <Link key={item.path} to={item.path} className={`relative font-medium text-[10px] uppercase tracking-widest transition-all duration-300 pb-0.5 border-b-2 ${currentView === item.path ? 'text-gold border-gold' : (isSolid ? 'text-text hover:text-gold border-transparent hover:border-gold' : 'text-white/90 hover:text-white border-transparent hover:border-white/60')}`}>{item.name}</Link>
          ))}
          <button type="button" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`font-medium text-[10px] uppercase tracking-widest transition-all duration-300 nav-link border-b-2 border-transparent hover:border-gold hover:text-gold pb-0.5 ${isSolid ? 'text-text hover:text-gold' : 'text-white/90 hover:text-white'}`}>Contact</button>
          {user ? (
            <button onClick={() => navigate('/member-dashboard')} className="btn-gold !px-5 !py-2 text-[10px] flex items-center gap-2">Mon Dashboard</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${isSolid ? 'border-green-dark text-green-dark hover:bg-green-dark hover:text-gold' : 'border-white/30 text-white hover:bg-white hover:text-green-dark'}`}>Connexion</button>
              <button onClick={() => navigate('/member-registration')} className="btn-gold !px-5 !py-2 text-[10px]">S'inscrire</button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={24} className={isSolid ? 'text-green-dark' : 'text-white'} /> : <Menu size={24} className={isSolid ? 'text-green-dark' : 'text-white'} />}</button>
      </div>
      {/* Premium Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-[#031d0f]/95 backdrop-blur-xl border-t border-gold/20 overflow-hidden transition-all duration-300 shadow-2xl ${mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="px-6 py-8 flex flex-col gap-6">
          {[{ name: 'Accueil', path: '/' }, { name: 'Partenaires', path: '/establishments' }, { name: 'Avantages', path: '/offers' }].map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`text-[11px] uppercase tracking-[0.2em] font-bold ${currentView === item.path ? 'text-gold' : 'text-white/90 hover:text-gold transition-colors'}`}>{item.name}</Link>
          ))}
          <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/90 hover:text-gold transition-colors text-left">Contact</button>
          
          <div className="h-px bg-gold/20 w-full my-2" />
          
          <div className="flex flex-col gap-4">
            {user ? (
              <button onClick={() => { setMobileMenuOpen(false); navigate('/member-dashboard'); }} className="btn-gold w-full py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-center rounded-sm">Mon Dashboard</button>
            ) : (
              <>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="border border-white/30 text-white hover:bg-white hover:text-green-dark transition-all duration-300 w-full py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">Connexion</button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/member-registration'); }} className="btn-gold w-full py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-center rounded-sm">Devenir Membre</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#031d0f]/70 via-[#031d0f]/40 to-[#031d0f]/95 z-10" />
        <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1600" alt="Premium Lifestyle Côte d'Ivoire" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center text-white pt-16 md:pt-20">
          <div className="inline-block bg-green-dark/60 backdrop-blur-md border border-gold/30 px-5 sm:px-8 py-3 mb-8 sm:mb-10 rounded-sm max-w-xl mx-auto">
            <span className="text-gold text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.25em] font-bold block leading-tight">
              Le club privé des expériences locales
            </span>
            <span className="text-gold text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.25em] font-bold block mt-1 leading-tight">
              & des établissements lifestyle en Côte d'Ivoire
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-10 leading-tight tracking-wide px-2 drop-shadow-lg">
            Transformez vos loisirs<br />
            <span className="italic text-gold">en opportunités d'affaires.</span>
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed font-light px-2">Découvrez des lieux uniques, vivez des expériences exclusives et profitez d'avantages réservés aux membres.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-2xl mx-auto px-2">
            <button onClick={() => navigate('/member-registration')} className="btn-gold w-full sm:w-1/2 shadow-2xl flex flex-col items-center py-3.5 sm:py-4 px-4 sm:px-6 rounded-sm hover:scale-[1.02] transition-transform duration-300">
              <span className="text-sm sm:text-base font-bold tracking-wider">DEVENIR MEMBRE</span>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest mt-1 opacity-90 font-medium text-center">Découvrir • Sortir • Voyager • Profiter</span>
            </button>
            <button onClick={() => navigate('/partner-registration')} className="btn-outline w-full sm:w-1/2 !border-gold/50 !text-white hover:!bg-gold hover:!text-green-dark flex flex-col items-center py-3.5 sm:py-4 px-4 sm:px-6 rounded-sm hover:scale-[1.02] transition-all duration-300">
              <span className="text-sm sm:text-base font-bold tracking-wider">DEVENIR PARTENAIRE</span>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest mt-1 opacity-90 font-medium text-center">Attirer • Générer du trafic • Fidéliser</span>
            </button>
          </div>
        </div>
      </section>

      {/* Bienvenue dans votre univers IBC Section */}
      <section className="py-20 sm:py-28 bg-[#092215] border-t border-b border-gold/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">La Promesse IBC</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-white mb-6">BIENVENUE DANS VOTRE UNIVERS IBC</h2>
            <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed px-4">
              Plus qu'un cashback, une expérience de vie. Découvrez, profitez et économisez dans les plus beaux établissements de Côte d'Ivoire.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-white/90">
            {[
              { title: 'Cagnotte Disponible', desc: 'Suivez et utilisez vos avantages accumulés après chaque visite validée.', icon: Banknote },
              { title: 'Objectifs Évasion', desc: 'Épargnez pour vos prochaines expériences : un week-end, un dîner, un voyage.', icon: Crown },
              { title: 'Épargne Club', desc: "Épargne automatique pour réaliser vos projets loisirs tout au long de l'année.", icon: PiggyBank },
              { title: 'Cercle Évasion', desc: 'Épargnez à plusieurs, rejoignez ou créez votre cercle privé pour voyager loin.', icon: Users },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-gold/10 p-6 sm:p-8 rounded-xl hover:bg-white/[0.05] hover:border-gold/30 transition-all duration-500 flex flex-col items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/30 transition-all duration-300">
                  <item.icon className="text-gold" size={24} />
                </div>
                <h4 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors">{item.title}</h4>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommandés pour vous Section */}
      <section className="py-16 sm:py-32 bg-cream">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 sm:mb-16 gap-6">
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-3 sm:mb-4">Inspirations</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-dark">RECOMMANDÉS POUR VOUS</h2>
            </div>
            <button onClick={() => navigate('/establishments')} className="btn-outline !text-green-dark !border-gold hover:!bg-gold text-xs px-6 py-3 w-full sm:w-auto">VOIR TOUTES LES OFFRES</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { title: 'La Plage', location: 'Grand-Bassam', badge: '-20%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600' },
              { title: 'Azar Club', location: 'Cocody', badge: '-15%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600' },
              { title: 'Hôtel Tiama', location: 'Marcory', badge: 'Surclassement', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600' },
              { title: 'Assinie Lodge', location: 'Assinie', badge: '-10%', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600' }
            ].map((exp, i) => (
              <div key={i} className="bg-white border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-soft transition-all duration-500 group cursor-pointer" onClick={() => navigate('/offers')}>
                <div className="relative overflow-hidden h-32 sm:h-48">
                  <img src={exp.img} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className="absolute top-2 right-2 bg-gradient-to-r from-gold to-[#F0C040] text-green-darker text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full shadow-md">
                    {exp.badge}
                  </span>
                </div>
                <div className="p-3 sm:p-4 text-left">
                  <h4 className="font-serif text-sm sm:text-lg font-bold text-green-dark truncate">{exp.title}</h4>
                  <p className="flex items-center gap-1 text-text-muted text-[10px] sm:text-xs mt-1 sm:mt-1.5">
                    <MapPin size={10} className="text-gold shrink-0 sm:hidden" />
                    <MapPin size={12} className="text-gold shrink-0 hidden sm:block" />
                    <span className="truncate">{exp.location}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partenaires Section */}
      <section className="py-20 sm:py-32 bg-green-dark relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4 sm:mb-6">LE RÉSEAU IBC</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8">Devenir Partenaire</h2>
            <p className="text-white/80 text-sm sm:text-base mb-8 sm:mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Rejoignez le réseau des établissements premium et connectez-vous à une clientèle active, fidèle et à la recherche d'expériences uniques en Côte d'Ivoire. Développez votre activité !
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-10 sm:mb-12 max-w-lg mx-auto lg:mx-0">
               <div className="bg-white/5 border border-gold/10 rounded-xl p-4 sm:p-6 text-center">
                  <p className="font-serif text-2xl sm:text-4xl font-bold text-gold">10k+</p>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold mt-2">Membres Actifs</p>
               </div>
               <div className="bg-white/5 border border-gold/10 rounded-xl p-4 sm:p-6 text-center">
                  <p className="font-serif text-2xl sm:text-4xl font-bold text-gold">500+</p>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold mt-2">Établissements</p>
               </div>
            </div>
            <button
              onClick={() => navigate('/partner-registration')}
              className="w-full sm:w-auto bg-[#C9A84C] text-[#1B5E35] font-bold rounded-[4px] px-8 sm:px-12 py-4 uppercase tracking-widest text-[10px] sm:text-xs hover:bg-[#F0C040] transition-colors"
            >
              REJOINDRE LE RÉSEAU IBC
            </button>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
              <div className="space-y-3 sm:space-y-6 mt-8 sm:mt-12">
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600" alt="Restaurant gastronomique" className="rounded-2xl w-full h-32 sm:h-64 object-cover shadow-lg" />
                <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600" alt="Beach Club Assinie" className="rounded-2xl w-full h-24 sm:h-48 object-cover shadow-lg" />
              </div>
              <div className="space-y-3 sm:space-y-6">
                <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600" alt="Hôtel Premium" className="rounded-2xl w-full h-24 sm:h-48 object-cover shadow-lg" />
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600" alt="Rooftop Lounge" className="rounded-2xl w-full h-32 sm:h-64 object-cover shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mon Dashboard CTA */}
      <section className="py-16 sm:py-24 bg-[#0a1f14]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">ACCÈS MEMBRE</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">Votre Espace Privé</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="border border-gold/20 p-5 sm:p-8 flex items-center gap-4 sm:gap-6 rounded-xl bg-white/5">
              <LayoutDashboard size={28} className="text-gold shrink-0 sm:w-8 sm:h-8" />
              <div className="text-left">
                <p className="text-white font-bold font-serif text-base sm:text-lg">Tableau de bord</p>
                <p className="text-white/50 text-[10px] sm:text-sm mt-1">Suivez votre cagnotte, vos objectifs et privilèges</p>
              </div>
            </div>
            <div className="border border-gold/20 p-5 sm:p-8 flex items-center gap-4 sm:gap-6 rounded-xl bg-white/5">
              <BookOpen size={28} className="text-gold shrink-0 sm:w-8 sm:h-8" />
              <div className="text-left">
                <p className="text-white font-bold font-serif text-base sm:text-lg">Le Catalogue</p>
                <p className="text-white/50 text-[10px] sm:text-sm mt-1">Explorez tous nos partenaires et offres exclusives</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/login')} className="btn-gold w-full sm:w-auto !px-12 py-3.5 sm:py-4 font-bold uppercase tracking-widest text-xs">
              ACCÉDER À MON ESPACE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};


const MemberRegistrationView: React.FC<{ onRegister: (data: any) => void }> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', plan: 'bronze', paymentMethod: 'orange', password: '', confirmPassword: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
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

  const checkEmailExists = async (): Promise<boolean> => {
    if (!formData.email) {
      setEmailError('Veuillez saisir votre adresse email.');
      return false;
    }

    if (formData.email.toLowerCase().includes('demo')) return true;

    try {
      setCheckingEmail(true);
      setEmailError('');
      const methods = await fetchSignInMethodsForEmail(auth, formData.email);
      if (methods.length > 0) {
        setEmailError('Cet email est déjà utilisé.');
        return false;
      }
      return true;
    } catch (error: any) {
      // Fallback for unconfigured Firebase to allow testing
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    onRegister({ ...formData, photoFile });
  };
  return (
    <div className="min-h-screen bg-cream py-24">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Marketing Header */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">LE CLUB PRIVÉ</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-green-dark mb-6">Bienvenue dans votre univers IBC</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">Rejoignez une communauté exclusive et profitez d'un écosystème d'avantages pensés pour vous.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              { title: 'Cashback & Cagnotte', desc: "Cumulez jusqu'à 7% sur vos dépenses chez nos partenaires. Utilisez votre cagnotte pour vos prochaines sorties.", icon: Banknote },
              { title: 'Statuts Évolutifs', desc: 'Bronze, Or, Platinum. Plus vous explorez, plus vos privilèges et avantages exclusifs augmentent.', icon: Crown },
              { title: 'Objectif Évasion', desc: 'Fixez-vous un objectif de voyage ou de loisir, et financez-le automatiquement grâce à votre cagnotte.', icon: Plane },
              { title: 'Épargne Club', desc: "Une solution intelligente pour planifier vos dépenses loisirs tout au long de l'année.", icon: PiggyBank },
              { title: 'Cercle Évasion', desc: 'Accédez à des séjours exclusifs et des escapades premium négociés spécialement pour les membres.', icon: Palmtree },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 border border-gold/10 hover:border-gold/30 hover:shadow-soft transition-all">
                <item.icon size={24} className="text-gold mb-4" />
                <h4 className="font-serif text-lg text-green-dark font-bold mb-2">{item.title}</h4>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-16">
            <h3 className="font-serif text-2xl font-bold text-green-dark mb-8 text-center">Recommandés pour vous</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Dîner Signature', location: 'Le Grand Large, Zone 4', badge: '-15%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
                { title: 'Week-end Évasion', location: 'Maison Akoula, Assinie', badge: 'Cashback x2', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' },
                { title: 'Sunset Lounge', location: 'Sky Lounge, Marcory', badge: 'Verre Offert', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
              ].map((exp, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl group">
                  <img src={exp.img} alt={exp.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-dark/90 to-transparent" />
                  <div className="absolute top-3 right-3 bg-gold text-[#010a04] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                    {exp.badge}
                  </div>
                  <div className="absolute bottom-0 p-5 w-full">
                    <h4 className="font-serif text-white font-bold text-lg">{exp.title}</h4>
                    <p className="text-gold/80 text-xs flex items-center gap-1 mt-1"><MapPin size={12} /> {exp.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
        <div className="border border-gold/20 p-12 mb-6 flex flex-col gap-6 bg-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">REJOIGNEZ GRATUITEMENT IBC</span>
              <h2 className="font-serif text-4xl font-bold text-green-dark">Devenez Membre du club</h2>
            </div>
            <button type="button" onClick={() => navigate('/')} className="text-[10px] uppercase tracking-[0.3em] font-bold text-green-dark border-b border-green-dark hover:text-gold transition-colors">Retour à l'accueil</button>
          </div>
          <p className="text-text-muted italic text-sm leading-relaxed">
            Accès aux expériences, avantages membres et événements privés à partir de 500 FCFA / mois
          </p>
        </div>
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
                    <li>✓ Jusqu'à 3% de cashback</li>
                    <li>✓ Accès aux expériences partenaires</li>
                    <li>✓ Invitations événements découverte</li>
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
                    <li>✓ Jusqu'à 5% de cashback</li>
                    <li>✓ Accès prioritaire réservations</li>
                    <li>✓ Invitations cocktails VIP</li>
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
                    <li>✓ Jusqu'à 7% de cashback</li>
                    <li>✓ Conciergerie privée WhatsApp</li>
                    <li>✓ Surclassements hôteliers VIP</li>
                  </ul>
                </div>
                <div className="mt-4 border-t border-gold/10 pt-3 text-[10px] font-bold text-slate-500">
                  Dès 30 000 pts cumulés
                </div>
              </div>
            </div>

            {/* Comment ça marche - Les Avantages Clefs */}
            <div className="space-y-6">
              <div className="border-t border-gold/15 pt-8 text-left">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">COMMENT ÇA MARCHE</span>
                <h4 className="font-serif text-2xl font-bold text-green-dark">Une gestion intelligente de vos privilèges</h4>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Cashback */}
                <div className="bg-white border border-gold/10 hover:border-gold/30 rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 text-green-dark flex items-center justify-center shrink-0 border border-gold/20">
                    <Wallet size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-serif font-bold text-green-dark text-sm">Le Cashback Automatique</h5>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Chaque paiement chez nos partenaires crédite votre compte. Suivez vos gains accumulés en temps réel sur votre dashboard.
                    </p>
                  </div>
                </div>

                {/* Cagnotte */}
                <div className="bg-white border border-gold/10 hover:border-gold/30 rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 text-green-dark flex items-center justify-center shrink-0 border border-gold/20">
                    <Gift size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-serif font-bold text-green-dark text-sm">Ma Cagnotte IBC</h5>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Votre capital plaisir disponible. Utilisez-le en un clic pour régler tout ou partie de vos consommations chez nos partenaires.
                    </p>
                  </div>
                </div>

                {/* Objectifs */}
                <div className="bg-white border border-gold/10 hover:border-gold/30 rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 text-green-dark flex items-center justify-center shrink-0 border border-gold/20">
                    <TrendingUp size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-serif font-bold text-green-dark text-sm">Objectifs Évasion</h5>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Fixez-vous un but (séjour, weekend) et laissez votre épargne de cashback financer automatiquement l'escapade de vos rêves.
                    </p>
                  </div>
                </div>

                {/* Épargne Club */}
                <div className="bg-white border border-gold/10 hover:border-gold/30 rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 text-green-dark flex items-center justify-center shrink-0 border border-gold/20">
                    <Banknote size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-serif font-bold text-green-dark text-sm">Épargne Club</h5>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Allouez automatiquement un pourcentage de votre cashback vers votre tirelire de voyage privée pour épargner sans effort.
                    </p>
                  </div>
                </div>

                {/* Cercle Évasion */}
                <div className="bg-white border border-gold/10 hover:border-gold/30 rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-soft sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-green-dark/5 text-green-dark flex items-center justify-center shrink-0 border border-gold/20">
                    <Users size={20} className="text-gold" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-serif font-bold text-green-dark text-sm">Cercle Évasion</h5>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Épargnez à plusieurs ! Fusionnez vos cagnottes avec vos proches et amis pour réaliser ensemble des escapades collectives inoubliables.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandés pour vous */}
            <div className="space-y-6 border-t border-gold/15 pt-8">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">RECOMMANDÉS POUR VOUS</span>
                <h4 className="font-serif text-2xl font-bold text-green-dark">Vivez des expériences d'exception</h4>
                <p className="text-[11px] text-text-muted mt-1">Des réductions exclusives sur vos escapades et sorties lifestyle</p>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                  { name: 'Sunset Lounge', location: 'Abidjan, Cocody', discount: '-20%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=300' },
                  { name: 'Brunch & Chill', location: 'Bingerville', discount: '-15%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=300' },
                  { name: 'Weekend Assinie', location: 'Assinie', discount: '-25%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300' },
                  { name: 'Sofitel Abidjan', location: 'Abidjan, Cocody', discount: '-20%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=300' },
                ].map((place, idx) => (
                  <div key={idx} className="bg-white border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-soft transition-all duration-300 group">
                    <div className="relative overflow-hidden h-24">
                      <img 
                        src={place.img} 
                        alt={place.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-gold to-[#F0C040] text-green-darker text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                        {place.discount}
                      </span>
                    </div>
                    <div className="p-3 text-left">
                      <h5 className="font-serif text-[11px] font-bold text-green-dark truncate">{place.name}</h5>
                      <p className="flex items-center gap-1 text-text-muted text-[8px] mt-0.5">
                        <MapPin size={8} className="text-gold" />
                        <span className="truncate">{place.location}</span>
                      </p>
                    </div>
                  </div>
                ))}
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[{ id: 'orange', name: 'Orange Money', icon: <Smartphone size={24} /> }, { id: 'wave', name: 'Wave', icon: <Smartphone size={24} /> }, { id: 'moov', name: 'Moov Money', icon: <Smartphone size={24} /> }, { id: 'mtn', name: 'MTN Money', icon: <Smartphone size={24} /> }].map((m) => (
                <div key={m.id} onClick={() => setFormData({...formData, paymentMethod: m.id})} className={`p-6 border cursor-pointer transition-all text-center flex flex-col items-center gap-4 ${formData.paymentMethod === m.id ? 'bg-green-dark text-white border-gold shadow-lg' : 'bg-white text-green-dark border-gold/10 hover:border-gold/30'}`}>
                  {m.icon}<span className="font-bold text-sm">{m.name}</span>
                  {formData.paymentMethod === m.id && <CheckCircle2 size={18} className="text-gold" />}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button type="button" onClick={handleBack} className="flex-1 py-4 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] hover:bg-green-dark hover:text-white transition-all">Étape précédente</button>
              <button type="submit" className="flex-1 bg-[#C9A84C] text-[#1B5E35] font-bold rounded-[4px] py-4 uppercase tracking-widest text-[10px] hover:bg-[#F0C040] transition-colors">CONFIRMEZ MON ADHÉSION</button>
            </div>
            <div className="text-center mt-4">
              <button type="button" onClick={() => navigate('/')} className="text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-green-dark transition-colors">Retour à l'accueil</button>
            </div>
            <p className="text-text-muted text-xs text-center mt-4">En cliquant sur confirmer, vous acceptez notre Charte de Confidentialité et les Conditions Générales du Club.</p>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};


const EstablishmentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Tous');
  const places = [
    { name: 'Sofitel Abidjan', cat: 'Hébergements & Séjours', zone: 'Cocody', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' },
    { name: 'Pullman Helios', cat: 'Hébergements & Séjours', zone: 'Plateau', cashback: '3-7%', img: '/assets/pullman-hotel.png' },
    { name: 'Sky Lounge', cat: 'Lounges & Nightlife', zone: 'Marcory', cashback: '5%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
    { name: 'Radisson Blu', cat: 'Hébergements & Séjours', zone: 'Port-Bouet', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Maison Akoula', cat: 'Beach Clubs & Loisirs', zone: 'Assinie', cashback: '5%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Le Grand Large', cat: 'Restaurants & Dining', zone: 'Zone 4', cashback: '5%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Orchidée Spa', cat: 'Bien-être & Wellness', zone: 'Cocody', cashback: '5%', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400' },
  ];
  const filteredPlaces = places.filter(p =>
    (filter === 'Tous' || p.cat === filter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filterIcons: Record<string, React.ReactNode> = { 'Hébergements & Séjours': <Hotel size={14} />, 'Restaurants & Dining': <Utensils size={14} />, 'Lounges & Nightlife': <Coffee size={14} />, 'Beach Clubs & Loisirs': <Gamepad2 size={14} />, 'Bien-être & Wellness': <Heart size={14} /> };
  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">LE RÉSEAU IBC</span>
          <h2 className="font-serif text-4xl font-bold text-green-dark mt-4">NOS DESTINATIONS & PARTENAIRES</h2>
        </div>
        <div className="relative mb-8">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Rechercher un lieu ou une zone..." className="w-full bg-white border border-gold/10 py-5 pl-16 pr-6 font-serif text-lg focus:border-gold outline-none shadow-premium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3 mb-12">
          {['Tous', 'Hébergements & Séjours', 'Restaurants & Dining', 'Lounges & Nightlife', 'Beach Clubs & Loisirs', 'Bien-être & Wellness'].map((f) => (
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
        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-4">
            <img src={ibcLogo} alt="IBC Logo" className="w-16 h-16" />
            <button type="button" onClick={() => navigate('/')} className="text-[10px] uppercase tracking-[0.3em] font-bold text-green-dark border-b border-green-dark hover:text-gold transition-colors">Retour à l'accueil</button>
          </div>
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
        <div className="flex flex-col gap-3 mt-3">
          <button onClick={() => navigate('/member-registration')} className="w-full text-center text-green-dark text-xs font-bold uppercase tracking-[0.2em] border-b border-gold hover:text-gold transition-colors">Rejoindre LE RÉSEAU IBC</button>
          <button onClick={() => navigate('/partner-registration')} className="w-full text-center text-gold text-xs font-bold uppercase tracking-[0.2em] border-b border-gold hover:text-green-dark transition-colors">Devenir partenaire</button>
        </div>
      </div>
    </div>
  );
};

const PartnerRegistrationView: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ businessName: '', contactName: '', email: '', phone: '', establishmentType: 'restaurant', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); toast.success('Merci pour votre intérêt ! Nous vous contactons très bientôt.'); setSubmitted(true); setTimeout(() => navigate('/'), 3000); };
  return (
    <div className="min-h-screen bg-cream py-24">
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
            <button type="submit" className="btn-gold w-full py-4 flex items-center justify-center gap-3">Soumettre ma Candidature <ArrowRight size={18} /></button>
          </form>
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 size={48} className="text-green-dark mx-auto mb-6" />
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
                <span className="text-gold text-[7px] uppercase tracking-[0.2em] font-bold">PLATEFORME D'EXPÉRIENCES TOURISTIQUES & CLUB PRIVÉ D'AVANTAGES</span>
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
