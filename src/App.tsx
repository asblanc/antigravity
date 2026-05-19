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
  Leaf,
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
  const isSolid = scrolled || currentView !== '/';
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isSolid ? 'bg-white shadow-premium py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3">
          <img src={ibcLogo} alt="IBC Logo" className="w-10 h-10" />
          <div className="flex flex-col items-start text-left">
            <span className={`font-serif text-lg font-bold italic block leading-none ${isSolid ? 'text-green-dark' : 'text-white'}`}>Ivoire Business Club</span>
            <span className="hidden lg:block text-gold text-[7px] uppercase tracking-[0.15em] font-bold mt-1 leading-tight max-w-[280px]">
              Le club privé des expériences locales<br />& des établissements lifestyle
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
  const [activeFilter, setActiveFilter] = useState('Tous');
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-green-dark/95 via-green-dark/80 to-green-dark/95 z-10" />
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600" alt="Premium Hotel Abidjan" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 container mx-auto px-6 text-center text-white pt-16">
          <div className="inline-block bg-green-dark/60 backdrop-blur-md border border-gold/30 px-8 py-3.5 mb-10 rounded-sm max-w-xl mx-auto">
            <span className="text-gold text-[10px] uppercase tracking-[0.25em] font-bold block leading-tight">
              Le club privé des expériences locales
            </span>
            <span className="text-gold text-[10px] uppercase tracking-[0.25em] font-bold block mt-1 leading-tight">
              & des établissements lifestyle en Côte d'Ivoire
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold mb-10 leading-tight tracking-wide">
            Transformez vos loisirs<br />
            <span className="italic text-gold">en opportunités d'affaires.</span>
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto mb-16 leading-relaxed font-light">Découvrez des lieux uniques, vivez des expériences exclusives et profitez d'avantages réservés aux membres.</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
            <button onClick={() => navigate('/member-registration')} className="btn-gold w-full sm:w-1/2 shadow-2xl flex flex-col items-center py-4 px-6 rounded-sm hover:scale-[1.02] transition-transform duration-300">
              <span className="text-base font-bold tracking-wider">DEVENIR MEMBRE</span>
              <span className="text-[8px] uppercase tracking-widest mt-1.5 opacity-90 font-medium">Découvrir • Sortir • Voyager • Profiter</span>
            </button>
            <button onClick={() => navigate('/partner-registration')} className="btn-outline w-full sm:w-1/2 !border-gold/50 !text-white hover:!bg-gold hover:!text-green-dark flex flex-col items-center py-4 px-6 rounded-sm hover:scale-[1.02] transition-all duration-300">
              <span className="text-base font-bold tracking-wider">DEVENIR PARTENAIRE</span>
              <span className="text-[8px] uppercase tracking-widest mt-1.5 opacity-90 font-medium text-center">Attirer • Fidéliser • Rejoindre le réseau</span>
            </button>
          </div>
        </div>
      </section>

      {/* Community Target Section */}
      <section className="py-28 bg-[#092215] border-t border-b border-gold/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">Pour qui est-ce pensé ?</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase mb-6">UNE COMMUNAUTÉ PENSÉE POUR</h2>
            <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
            <p className="text-white/60 text-sm font-light leading-relaxed">
              Le programme membre IBC réunit des profils dynamiques et exigeants autour de passions communes et d'opportunités uniques en Côte d'Ivoire.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white/90">
            <div className="bg-white/[0.02] border border-gold/10 p-8 rounded hover:bg-white/[0.05] hover:border-gold/30 transition-all duration-500 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/30 transition-all duration-300">
                <Compass className="text-gold animate-pulse" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors">Les amoureux de découvertes</h4>
              <p className="text-white/70 text-xs leading-relaxed font-light">Explorez des destinations uniques, des hébergements insolites et des adresses secrètes à travers toute la Côte d'Ivoire.</p>
            </div>
            <div className="bg-white/[0.02] border border-gold/10 p-8 rounded hover:bg-white/[0.05] hover:border-gold/30 transition-all duration-500 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/30 transition-all duration-300">
                <MapPin className="text-gold" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors">Les actifs urbains</h4>
              <p className="text-white/70 text-xs leading-relaxed font-light">Décompressez après vos journées intenses grâce à notre sélection exclusive de lounges, rooftops et événements After Work animés.</p>
            </div>
            <div className="bg-white/[0.02] border border-gold/10 p-8 rounded hover:bg-[#0c2c1b]/30 hover:border-gold/30 transition-all duration-500 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/30 transition-all duration-300">
                <Sparkles className="text-gold" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors">Les passionnés de lifestyle</h4>
              <p className="text-white/70 text-xs leading-relaxed font-light">Savourez le meilleur de la gastronomie locale et internationale et accédez à des expériences de bien-être haut de gamme.</p>
            </div>
            <div className="bg-white/[0.02] border border-gold/10 p-8 rounded hover:bg-[#0c2c1b]/30 hover:border-gold/30 transition-all duration-500 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/30 transition-all duration-300">
                <Briefcase className="text-gold" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors">Les professionnels & entrepreneurs</h4>
              <p className="text-white/70 text-xs leading-relaxed font-light">Connectez-vous avec un réseau sélect d'affaires, participez à des événements privés et créez des opportunités de synergie professionnelle.</p>
            </div>
            <div className="sm:col-span-2 bg-white/[0.02] border border-gold/10 p-8 rounded hover:bg-[#0c2c1b]/30 hover:border-gold/30 transition-all duration-500 flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/30 transition-all duration-300 flex-shrink-0">
                <Crown className="text-gold" size={20} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors mb-2">Les amateurs d'expériences premium</h4>
                <p className="text-white/70 text-xs leading-relaxed font-light">Bénéficiez d'un service d'exception, d'accords privilégiés et d'attentions exclusives réservés à l'élite des membres du réseau.</p>
              </div>
            </div>
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
            {[{ title: 'Rejoignez le Club', desc: 'Créez votre profil membre en quelques minutes', icon: Users }, { title: 'Explorez', desc: 'Découvrez des établissements et expériences sélectionnés', icon: MapPin }, { title: 'Vivez l\'expérience', desc: 'Profitez d\'offres et d\'expériences exclusives chez nos partenaires', icon: Utensils }, { title: 'Profitez d\'avantages exclusifs', desc: 'Cumulez récompenses, privilèges et des avantages selon votre activité et votre statut membre', icon: CreditCard }].map((step, i) => {
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
              <h2 className="font-serif text-4xl font-bold text-white mt-4">NOS DESTINATIONS & PARTENAIRES</h2>
            </div>
            <button onClick={() => navigate('/establishments')} className="btn-outline !text-white !border-white/30 hover:!border-gold text-xs md:text-sm px-4 py-2 md:px-6 md:py-3">VOIR TOUT LE CATALOGUE</button>
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
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl font-bold text-[#1B5E35] tracking-wide uppercase">EXPLOREZ NOS UNIVERS</h2>
          </div>
          <div className="flex flex-col border border-[#1B5E35]/10 rounded-lg overflow-hidden divide-y divide-[#1B5E35]/10 shadow-premium">
            {[
              { title: 'AFTER WORK & NIGHTLIFE', desc: 'Rooftops • DJ Sets • Networking • Lounges', icon: Headphones },
              { title: 'DINING & GASTRONOMIE', desc: 'Restaurants • Cuisine ivoirienne • Diners signature', icon: Utensils },
              { title: 'BEACH & LOISIRS', desc: 'Bassam • Assinie • Beach clubs • Sunset experiences', icon: Palmtree },
              { title: 'SÉJOURS & ESCAPADES', desc: 'Day use • Week-end • Resorts • Villas privées', icon: Hotel },
              { title: 'DIASPORA & HERITAGE', desc: 'Retour aux sources • Culture • Traditions', icon: Globe }
            ].map((exp, i) => {
              const Icon = exp.icon;
              return (
                <div
                  key={i}
                  className="p-6 md:p-8 bg-[#F5F3EE] hover:bg-[#F2EFE8] transition-colors flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 group"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#1B5E35] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-serif text-lg font-bold text-[#1B5E35] mb-2 tracking-wide">
                      {exp.title}
                    </h4>
                    <p className="text-[#1B5E35]/80 text-sm font-medium">
                      {exp.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* LOYALTY PROGRAM - Section 4: Le Programme Membre IBC */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-gold/20 p-12 text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">IBC MEMBERSHIP</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-green-dark leading-tight">
              LE PROGRAMME MEMBRE IBC
            </h2>
          </div>
          
          <div className="mb-16 bg-cream p-8 border border-gold/10 text-green-dark leading-relaxed">
            <p className="font-semibold mb-4">
              Un système d'avantages et de privilèges évolutif basé sur l'activité et l'expérience membre.
            </p>
            <p className="font-medium mb-3">La plateforme IVOIRE BUSINESS CLUB analyse :</p>
            <ul className="space-y-2 pl-4 mb-4 text-[#1B5E35]/80">
              <li className="flex items-start gap-2">
                <span>•</span> les habitudes de consommation
              </li>
              <li className="flex items-start gap-2">
                <span>•</span> les préférences membres
              </li>
              <li className="flex items-start gap-2">
                <span>•</span> les expériences vécues
              </li>
              <li className="flex items-start gap-2">
                <span>•</span> les interactions avec les établissements partenaires
              </li>
            </ul>
            <p className="font-medium">
              afin d'offrir une expérience personnalisée et des avantages adaptés au profil de chaque membre.
            </p>
          </div>

          <div className="space-y-8">
            {/* Bronze */}
            <div className="border border-gold/20 p-8 bg-cream/10">
              <div className="flex items-center gap-4 mb-4">
                <Leaf className="text-gold shrink-0" size={24} />
                <div>
                  <h3 className="text-2xl font-serif font-bold text-green-dark uppercase tracking-widest">Membre Bronze</h3>
                  <p className="text-gold text-sm font-semibold tracking-wider">Discovery Member</p>
                </div>
              </div>
              <p className="text-text-muted mb-6 text-sm">Tous les membres démarrent automatiquement avec le statut Bronze.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="font-bold text-green-dark text-sm mb-1 uppercase tracking-wider">Profil</p>
                  <p className="text-text-muted text-sm mb-4">Membres découverte & lifestyle occasionnel</p>
                  
                  <p className="font-bold text-green-dark text-sm mb-1 uppercase tracking-wider">Activité moyenne</p>
                  <p className="text-text-muted text-sm">10 000 FCFA à 40 000 FCFA / week-end</p>
                </div>
                <div>
                  <p className="font-bold text-green-dark text-sm mb-3 uppercase tracking-wider">Avantages</p>
                  <ul className="space-y-2 text-sm text-text-muted">
                    <li className="flex items-center gap-2">✓ Accès aux expériences standards</li>
                    <li className="flex items-center gap-2">✓ Accès prioritaire à certaines offres</li>
                    <li className="flex items-center gap-2">✓ Invitations événements découverte</li>
                    <li className="flex items-center gap-2">✓ Avantages partenaires</li>
                    <li className="flex items-center gap-2">✓ Cashback jusqu'à 3%</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gold/10 pt-4 flex justify-between items-center">
                <span className="text-xs text-text-muted uppercase tracking-wider">Tarif d'adhésion</span>
                <span className="text-xl font-bold text-green-dark font-serif">500 FCFA / mois</span>
              </div>
            </div>

            {/* Statuts Verrouillés */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
              {/* Or */}
              <div className="border border-gold/20 p-8 bg-cream/10 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-gold">
                  <Lock size={18} />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200" />
                  <div>
                    <h3 className="text-xl font-serif font-bold text-green-dark">Statut Or</h3>
                    <p className="text-gold text-xs font-semibold tracking-wider uppercase">Prestige Member (bientôt)</p>
                  </div>
                </div>
                <p className="text-text-muted text-sm mb-4 leading-relaxed">
                  "Attribué aux membres à forte activité — 50 000 à 90 000 FCFA / week-end"
                </p>
                <div className="border-t border-gold/10 pt-3 flex justify-between items-center text-xs">
                  <span className="text-text-muted">Avantage Cashback</span>
                  <span className="font-bold text-green-dark">Cashback jusqu'à 5%</span>
                </div>
              </div>

              {/* Platinum */}
              <div className="border border-gold/20 p-8 bg-cream/10 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-gold">
                  <Lock size={18} />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-400 to-white border border-gray-200" />
                  <div>
                    <h3 className="text-xl font-serif font-bold text-green-dark">Statut Platinum</h3>
                    <p className="text-gold text-xs font-semibold tracking-wider uppercase">Elite Member (bientôt)</p>
                  </div>
                </div>
                <p className="text-text-muted text-sm mb-4 leading-relaxed">
                  "Réservé aux membres premium — 100 000 FCFA et plus / week-end"
                </p>
                <div className="border-t border-gold/10 pt-3 flex justify-between items-center text-xs">
                  <span className="text-text-muted">Avantage Cashback</span>
                  <span className="font-bold text-green-dark">Cashback jusqu'à 7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section 7: Inscription */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-gold/20 p-12 text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">Rejoignez gratuitement IBC</span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-green-dark leading-tight">
              Accès aux expériences, avantages membres et événements privés à partir de 500 FCFA / mois
            </h2>
          </div>
          <div className="mb-8">
            <p className="text-text font-medium mb-6 text-sm">Mode de paiement :</p>
            <div className="space-y-3">
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
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">LE RÉSEAU IBC</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Devenir Partenaire</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Intégrez un réseau d'établissements lifestyle sélectionnés et connectez-vous à une communauté active à la recherche d'expériences locales, de loisirs et d'escapades premium.
            <br className="hidden md:block" />
            IVOIRE BUSINESS CLUB transforme les sorties, séjours et expériences en opportunités de fréquentation et de fidélisation pour ses partenaires.
          </p>
          <button
            onClick={() => navigate('/partner-registration')}
            className="bg-[#C9A84C] text-[#1B5E35] font-bold rounded-[4px] px-12 py-4 uppercase tracking-widest text-[10px] hover:bg-[#F0C040] transition-colors"
          >
            REJOINDRE LE RÉSEAU IBC
          </button>
        </div>
      </section>

      {/* Section 9: Mon Dashboard */}
      <section className="py-24 bg-[#0a1f14]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">MON DASHBOARD</span>
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
              <Smartphone size={16} className="text-gold" />
              <span className="text-gold text-[10px] uppercase tracking-widest font-bold">Mobile Money</span>
            </div>
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/login')} className="btn-gold !px-12 font-bold uppercase tracking-widest">
              ACCÉDER À MON ESPACE
            </button>
          </div>
        </div>
      </section>
      
      {/* Section 10: Nos Etablissements Partenaires */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="border border-gold/20 p-10 text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">LE RÉSEAU IBC</span>
            <h2 className="font-serif text-4xl font-bold text-green-dark">NOS DESTINATIONS & PARTENAIRES</h2>
          </div>
          {/* Filtres avec icones */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {[
              { id: 'Tous', label: 'Tous', emoji: '' },
              { id: 'Hébergements & Séjours', label: 'Hébergements & Séjours', emoji: '🛏️' },
              { id: 'Restaurants & Dining', label: 'Restaurants & Dining', emoji: '🍽️' },
              { id: 'Lounges & Nightlife', label: 'Lounges & Nightlife', emoji: '🎧' },
              { id: 'Beach Clubs & Loisirs', label: 'Beach Clubs & Loisirs', emoji: '🏖️' },
              { id: 'Bien-être & Wellness', label: 'Bien-être & Wellness', emoji: '💆' }
            ].map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1B5E35] text-white border border-[#1B5E35]'
                      : 'bg-transparent text-[#1B5E35] border border-[#1B5E35]'
                  }`}
                >
                  {cat.emoji && <span className="text-sm">{cat.emoji}</span>}
                  {cat.label}
                </button>
              );
            })}
          </div>
          {/* Cards partenaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { name: 'Sofitel Abidjan', cat: 'Hébergements & Séjours', zone: 'Cocody', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' },
              { name: 'Sky Lounge', cat: 'Lounges & Nightlife', zone: 'Marcory', cashback: '5%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
              { name: 'Radisson Blu', cat: 'Hébergements & Séjours', zone: 'Port-Bouet', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=400' },
              { name: 'Maison Akoula', cat: 'Beach Clubs & Loisirs', zone: 'Assinie', cashback: '5%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' },
              { name: 'Le Grand Large', cat: 'Restaurants & Dining', zone: 'Zone 4', cashback: '5%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
              { name: 'Orchidée Spa', cat: 'Bien-être & Wellness', zone: 'Cocody', cashback: '5%', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400' }
            ]
              .filter(place => activeFilter === 'Tous' || place.cat === activeFilter)
              .map((place, i) => (
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
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', plan: 'bronze', paymentMethod: 'orange' });
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onRegister(formData); };
  return (
    <div className="min-h-screen bg-cream py-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="border border-gold/20 p-12 mb-12 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">REJOIGNEZ GRATUITEMENT IBC</span>
          <h2 className="font-serif text-4xl font-bold text-green-dark">Devenez Membre du club</h2>
          <p className="text-text-muted mt-4 italic text-sm leading-relaxed">
            Accès aux expériences, avantages membres et événements privés à partir de 500 FCFA / mois
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
            <h3 className="font-serif text-2xl text-green-dark">Bienvenue dans le statut Bronze</h3>
            <div className="p-6 bg-green-dark text-white border border-gold shadow-lg rounded flex items-center justify-between">
              <p className="font-bold font-serif text-sm md:text-base leading-relaxed">
                Membre Bronze — Cashback 3% sur chaque dépense — 500 FCFA / mois
              </p>
              <CheckCircle2 size={24} className="text-gold shrink-0 ml-4" />
            </div>
            <div className="flex gap-4">
              <button onClick={handleBack} className="flex-1 py-4 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] hover:bg-green-dark hover:text-white transition-all">Retour</button>
              <button onClick={handleNext} className="flex-1 btn-gold py-4">Continuer</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-serif text-2xl text-green-dark">Mode de Paiement</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[{ id: 'orange', name: 'Orange Money', icon: <Smartphone size={24} /> }, { id: 'wave', name: 'Wave', icon: <Smartphone size={24} /> }, { id: 'moov', name: 'Moov Money', icon: <Smartphone size={24} /> }].map((m) => (
                <div key={m.id} onClick={() => setFormData({...formData, paymentMethod: m.id})} className={`p-6 border cursor-pointer transition-all text-center flex flex-col items-center gap-4 ${formData.paymentMethod === m.id ? 'bg-green-dark text-white border-gold shadow-lg' : 'bg-white text-green-dark border-gold/10 hover:border-gold/30'}`}>
                  {m.icon}<span className="font-bold text-sm">{m.name}</span>
                  {formData.paymentMethod === m.id && <CheckCircle2 size={18} className="text-gold" />}
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={handleBack} className="flex-1 py-4 border border-green-dark text-green-dark font-bold uppercase tracking-widest text-[10px] hover:bg-green-dark hover:text-white transition-all">Retour</button>
              <button type="submit" className="flex-1 bg-[#C9A84C] text-[#1B5E35] font-bold rounded-[4px] py-4 uppercase tracking-widest text-[10px] hover:bg-[#F0C040] transition-colors">CONFIRMEZ MON ADHÉSION</button>
            </div>
            <p className="text-text-muted text-xs text-center mt-4">En cliquant sur confirmer, vous acceptez notre Charte de Confidentialité et les Conditions Générales du Club.</p>
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
            {[{ label: 'Établissement', key: 'businessName', placeholder: 'Hotel, Restaurant ou Service', type: 'text' }, { label: 'Responsable de l\'établissement', key: 'contactName', placeholder: 'Nom & Prénom', type: 'text' }, { label: 'Email', key: 'email', placeholder: 'contact@etablissement.ci', type: 'email' }, { label: 'Téléphone', key: 'phone', placeholder: '+225 07 XX XX XX XX', type: 'tel' }].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors" value={formData[field.key as keyof typeof formData]} onChange={(e) => setFormData({...formData, [field.key]: e.target.value})} required />
              </div>
            ))}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Catégorie d'activité</label>
              <select className="w-full bg-white border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none" value={formData.establishmentType} onChange={(e) => setFormData({...formData, establishmentType: e.target.value})}>
                <option value="hebergement">Hébergement</option>
                <option value="restaurant">Restaurant</option>
                <option value="lounge">Lounge</option>
                <option value="beach-club">Beach Club</option>
                <option value="bien-etre">Bien-être</option>
                <option value="loisirs">Loisirs</option>
                <option value="autre">Autre</option>
              </select>
            </div>
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
            <button onClick={() => navigate('/')} className="btn-gold">Retour à l'accueil</button>
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
