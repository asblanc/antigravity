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
  Info,
  LogOut,
  Settings,
  Bell,
  Scan,
  History,
  LayoutDashboard,
  Search,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import type { Member, Transaction, Offer } from './lib/mock-api';
import { loginUser, registerMember, logoutUser, subscribeToAuthState, getCurrentMemberProfile } from './lib/auth.service';
import { getMemberTransactions } from './lib/transaction.service';
import { PartnerDashboardView } from './components/PartnerDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import ibcLogo from "./assets/ibc-logo.png";
// puis dans le JSX :
<img src={ibcLogo} alt="IBC Logo" className="h-10 w-auto" />

// Format numbers with dots as thousands separator
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

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Firebase Auth state listener — persists session across reloads
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getCurrentMemberProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            // Route to correct dashboard based on role
            const role = (profile as any).role;
            if (role === 'partner') navigate('/partner-dashboard');
            else if (role === 'admin') navigate('/admin-dashboard');
            else navigate('/member-dashboard');
          }
        } catch (e) {
          console.error('Profile load error:', e);
        }
      } else {
        setUser(null);
      }
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
      toast.success(`Bienvenue, ${userData.name} 🎉`);
    } catch (error: any) {
      const msg = error?.code === 'auth/invalid-credential'
        ? 'Email ou mot de passe incorrect'
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
      toast.success('Bienvenue dans le Club IBC ! 🥂');
    } catch (error: any) {
      const msg = error?.code === 'auth/email-already-in-use'
        ? 'Cet email est déjà utilisé'
        : error?.message || 'Erreur lors de l\'inscription';
      toast.error(msg);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate('/');
    toast.success('À bientôt !');
  };

  // Show loading spinner while Firebase resolves auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-darker">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold font-serif text-lg">Ivoire Business Club</p>
        </div>
      </div>
    );
  }

  const isDashboard = location.pathname.includes('dashboard');

  return (
    <div className={`min-h-screen font-sans selection:bg-gold selection:text-green-dark ${isDashboard ? 'bg-green-darker' : 'bg-white-warm'} text-text overflow-x-hidden transition-colors duration-500`}>
      {!isDashboard && (
        <Navbar 
           
          scrolled={scrolled || location.pathname !== '/'} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
          currentView={location.pathname}
          user={user}
        />
      )}
      <main>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/member-registration" element={<MemberRegistrationView onRegister={handleRegister} />} />
          <Route path="/partner-registration" element={<HomeView />} />
          <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
          <Route path="/member-dashboard" element={user ? <MemberDashboardView user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/partner-dashboard" element={<PartnerDashboardView onLogout={handleLogout} />} />
          <Route path="/admin-dashboard" element={<AdminDashboardView onLogout={handleLogout} />} />
          <Route path="/establishments" element={<EstablishmentsView />} />
          <Route path="/offers" element={<EstablishmentsView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      <Toaster position="bottom-right" />
    </div>
  );
};

// --- SHARED COMPONENTS ---

const Navbar: React.FC<{ 
  scrolled: boolean,
  mobileMenuOpen: boolean,
  setMobileMenuOpen: (o: boolean) => void,
  currentView: string,
  user: Member | null
}> = ({ scrolled, mobileMenuOpen, setMobileMenuOpen, currentView, user }) => {
  const navigate = useNavigate();
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 md:px-12 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-gold py-3' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-full border border-gold/50 overflow-hidden bg-green-dark shadow-sm group-hover:border-gold transition-colors duration-300">
            <img src={ibcLogo} alt="IBC Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className={`font-serif text-lg leading-tight font-bold italic tracking-tight ${scrolled ? 'text-green-dark' : 'text-white'}`}>
              Ivoire Business Club
            </span>
            <span className="text-[9px] uppercase tracking-[0.4em] text-gold font-bold">
              Prestige & Excellence
            </span>
          </div>
        </div>

          <div className="hidden md:flex items-center gap-10">
            {[
              { name: 'Accueil', path: '/' },
              { name: 'Partenaires', path: '/establishments' },
              { name: 'Privilèges', path: '/offers' },
            ].map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className={`relative font-medium text-[10px] uppercase tracking-widest transition-colors duration-300 group ${
                  currentView === item.path ? 'text-gold' : (scrolled ? 'text-text hover:text-gold' : 'text-white/90 hover:text-white')
                }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gold transition-transform duration-300 origin-left ${currentView === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            ))}
            <button type="button" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className={`relative font-medium text-[10px] uppercase tracking-widest transition-colors duration-300 group ${scrolled ? 'text-text hover:text-gold' : 'text-white/90 hover:text-white'}`}>
              Contact
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </button>
          </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button 
              onClick={() => navigate('/member-dashboard')}
              className="btn-gold !px-5 !py-2 text-[10px] flex items-center gap-2"
            >
              <LayoutDashboard size={14} /> Mon Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 ${
                  scrolled 
                    ? 'border-green-dark text-green-dark hover:bg-green-dark hover:text-gold' 
                    : 'border-white/30 text-white hover:bg-white hover:text-green-dark'
                }`}
              >
                Connexion
              </button>
              <button 
                onClick={() => navigate('/member-registration')}
                className="btn-gold !px-5 !py-2 text-[10px]"
              >
                S'inscrire
              </button>
            </>
          )}
          <button 
            className="md:hidden text-gold"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-green-darker border-t border-gold/20 p-6 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            {[
              { name: 'Accueil', path: '/' },
              { name: 'Partenaires', path: '/establishments' },
              { name: 'Privilèges', path: '/offers' },
            ].map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm uppercase tracking-widest font-bold ${currentView === item.path ? 'text-gold' : 'text-white hover:text-gold'}`}
              >
                {item.name}
              </Link>
            ))}
            <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-sm uppercase tracking-widest font-bold text-white hover:text-gold text-left">
              Contact
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- VIEWS ---

const HomeView: React.FC<{ }> = ({}) => {
  const navigate = useNavigate();
  return (
    <div id="accueil">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-darker/95 via-green-dark/70 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2070" 
            alt="Premium Hotel Abidjan" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-6 py-1 border border-gold/50 text-gold text-[10px] uppercase tracking-[0.5em] font-bold mb-10 bg-green-dark/20 backdrop-blur-sm"
          >
            Bienvenue dans l'Excellence Ivoirienne
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-8xl font-serif text-white mb-8 leading-tight tracking-tight"
          >
            Luxe, Affaires <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
              & Prestige
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto mb-14 font-sans font-light leading-relaxed tracking-wide"
          >
            Transformez vos loisirs en opportunités d'affaires. 
            Rejoignez le cercle restreint des décideurs et bénéficiez de privilèges exclusifs 
            dans les plus beaux établissements de Côte d'Ivoire.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20"
          >
            <button 
              onClick={() => navigate('/member-registration')}
              className="btn-gold w-full sm:w-auto shadow-2xl"
            >
              Rejoindre le Club
            </button>
            <button 
              onClick={() => navigate('/partner-registration')}
              className="btn-outline w-full sm:w-auto !border-white/50 !text-white hover:!border-gold hover:!shadow-gold group"
            >
              Devenir Partenaire 
              <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-5xl mx-auto border-t border-white/10 pt-16">
            {[
              { label: 'Membres Actifs', value: '1,250+' },
              { label: 'Partenaires Agréés', value: '45+' },
              { label: 'Cashback Redistribué', value: '15M+' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-serif text-gold mb-3 group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 text-white/40">
          <span className="text-[9px] uppercase tracking-[0.4em]">Découvrir</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* Mechanism Section */}
      <section className="py-32 bg-white-warm relative" id="privilèges">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[11px] uppercase tracking-[0.6em] text-gold font-bold mb-4">MÉCANISME D'EXCELLENCE</h2>
            <h3 className="text-4xl md:text-6xl font-serif text-green-dark">Une Expérience en 4 Étapes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { title: 'Inscrivez-vous', desc: 'Créez votre profil exclusif en quelques minutes.', icon: Users },
              { title: 'Découvrez', desc: 'Explorez notre catalogue d\'établissements agréés.', icon: MapPin },
              { title: 'Consommez', desc: 'Profitez du meilleur de la gastronomie et de l\'hôtellerie.', icon: Utensils },
              { title: 'Gagnez', desc: 'Recevez Cashback exclusif sur chaque dépense immédiat sur chaque dépense.', icon: CreditCard }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative group text-center md:text-left">
                  <div className="w-16 h-16 bg-green-dark text-gold flex items-center justify-center mb-8 mx-auto md:mx-0 shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
                    <Icon size={28} />
                    <div className="absolute -top-4 -right-4 text-6xl font-serif text-gold/10 font-bold -z-10">{i + 1}</div>
                  </div>
                  <h4 className="text-xl font-serif text-green-dark mb-4">{step.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners / Network Section */}
      <section className="py-32 bg-green-dark text-white relative overflow-hidden" id="partenaires">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-green-darker opacity-50 skew-x-12 translate-x-1/2" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-[11px] uppercase tracking-[0.6em] text-gold font-bold mb-4">LE RÉSEAU IBC</h2>
              <h3 className="text-4xl md:text-6xl font-serif leading-tight">Nos Partenaires de Prestige</h3>
            </div>
            <button 
              onClick={() => navigate('/establishments')}
              className="btn-outline !text-white !border-white/30 hover:!border-gold hover:!shadow-gold whitespace-nowrap"
            >
              Voir tout le catalogue
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Sofitel Abidjan', type: 'L\'Hôtel Ivoire iconique', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800' },
              { name: 'Sky Lounge', type: 'Vue panoramique sur Abidjan', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800' },
              { name: 'Radisson Blu', type: 'Hub des affaires internationales', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800' },
              { name: 'Pullman Hélios', type: 'Excellence au cœur du Plateau', img: '/assets/pullman-hotel.png' }
            ].map((p, i) => (
              <div key={i} className="group relative aspect-[4/5] overflow-hidden bg-black shadow-2xl">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-darker via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h4 className="text-2xl font-serif mb-2">{p.name}</h4>
                  <p className="text-gold text-[10px] uppercase tracking-[0.2em] font-bold">{p.type}</p>
                  <div className="h-px bg-gold/50 w-0 group-hover:w-full transition-all duration-500 mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue / Experiences Section */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[11px] uppercase tracking-[0.6em] text-gold font-bold mb-4">CATALOGUE EXCLUSIF</h2>
            <h3 className="text-4xl md:text-6xl font-serif text-green-dark">Expériences Signature</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: 'AFTERWORK SOCIAL', desc: 'Connectez-vous avec l\'élite économique dans des lieux d\'exception.', icon: Users },
              { title: 'DINNER SIGNATURE', desc: 'Une table réservée, une expérience culinaire hors du commun.', icon: Utensils },
              { title: 'LUXURY ESCAPE', desc: 'Évadez-vous dans nos destinations partenaires les plus prisées.', icon: MapPin },
              { title: 'WEEKEND ESCAPE', desc: 'Le repos bien mérité des bâtisseurs, dans un cadre serein.', icon: Coffee }
            ].map((exp, i) => {
              const Icon = exp.icon;
              return (
                <div key={i} className="bg-white p-12 border border-gold/10 hover:border-gold/30 hover:shadow-gold transition-all duration-500 flex gap-10 items-start">
                  <div className="text-gold shrink-0 mt-1">
                    <Icon size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-green-dark mb-4 tracking-wide">{exp.title}</h4>
                    <p className="text-text-muted leading-relaxed mb-6">{exp.desc}</p>
                    <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all">
                      En savoir plus <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Loyalty Program Section */}
      <section className="py-32 bg-white-warm relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[11px] uppercase tracking-[0.6em] text-gold font-bold mb-4">PROGRAMME DE FIDÉLITÉ</h2>
            <h3 className="text-4xl md:text-6xl font-serif text-green-dark">Élevez Votre Statut</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { 
                tier: 'BRONZE', 
                title: 'MEMBRE BRONZE', 
                benefits: ['💰 Cashback IBC — Sur chaque dépense Garanti', 'Accès Events Standard', 'Annuaire des Partenaires'],
                price: '500 FCFA / mois',
                highlight: false
              },
              { 
                tier: 'SILVER', 
                title: 'MEMBRE SILVER', 
                benefits: ['Cashback 5% Bonus', 'Accès Events Premium', 'Conciergerie Dédiée', 'Invitations Afterworks'],
                price: '2.500 FCFA / mois',
                highlight: true
              },
              { 
                tier: 'GOLD ELITE', 
                title: 'MEMBRE GOLD ELITE', 
                benefits: ['Cashback 7% Privilège', 'Accès VIP Signature', 'Assistant Personnel 24/7', 'Accès Salons VIP Aéroport'],
                price: '10.000 FCFA / mois',
                highlight: false
              }
            ].map((plan, i) => (
              <div key={i} className={`p-12 border ${plan.highlight ? 'bg-green-dark text-white border-gold shadow-2xl lg:scale-105 z-10' : 'bg-white text-green-dark border-gold/10'} flex flex-col`}>
                <div className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-4 ${plan.highlight ? 'text-gold' : 'text-gold'}`}>
                  {plan.tier}
                </div>
                <h4 className="text-3xl font-serif mb-8">{plan.title}</h4>
                <div className="text-3xl font-serif mb-10 font-bold italic">
                  {plan.price}
                </div>
                <ul className="space-y-4 mb-12 flex-grow">
                  {plan.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-light">
                      <Star size={14} className="text-gold shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate('/member-registration')}
                  className={`w-full py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    plan.highlight ? 'bg-gold text-green-dark hover:bg-gold-light' : 'bg-green-dark text-gold hover:bg-green-darker'
                  }`}
                >
                  Choisir ce plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote / CTA Section */}
      <section className="py-40 bg-green-darker relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-gold/30 text-8xl font-serif absolute -top-10 left-0 leading-none">“</h2>
            <p className="text-3xl md:text-5xl font-serif text-white italic leading-tight mb-16 px-10">
              Nous ne promettons pas de visibilité, <br />
              nous sommes un <span className="text-gold">canal privé</span> de clientèle qualifiée.
            </p>
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-gold mb-8" />
              <button 
                onClick={() => navigate('/member-registration')}
                className="btn-gold !px-12"
              >
                Demander mon Adhésion
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const MemberRegistrationView: React.FC<{ onRegister: (data: any) => void }> = ({ onRegister }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    plan: 'silver',
    paymentMethod: 'orange'
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white-warm">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="section-subtitle">INSCRIPTION PREMIUM</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-green-dark mb-6">Devenez Membre de l'Excellence</h3>
            <p className="text-text-muted italic max-w-xl mx-auto">
              Rejoignez le cercle restreint des décideurs et bénéficiez de privilèges exclusifs conçus pour l'élite.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gold/10 -z-10" />
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-serif transition-all duration-500 ${
                  step >= s ? 'bg-green-dark text-gold shadow-gold' : 'bg-white text-gold/30 border border-gold/10'
                }`}
              >
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="bg-white p-10 md:p-16 border border-gold/10 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 -rotate-45 translate-x-16 -translate-y-16" />
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h4 className="text-2xl font-serif text-green-dark mb-8 border-b border-gold/10 pb-4">Informations Personnelles</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Nom Complet</label>
                      <input 
                        type="text" 
                        placeholder="M. / Mme Nom Prénom"
                        className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Email Professionnel</label>
                      <input 
                        type="email" 
                        placeholder="email@compagnie.ci"
                        className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Numéro WhatsApp</label>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-serif border-b border-gold/20 py-4">+225</span>
                        <input 
                          type="tel" 
                          placeholder="07 00 00 00 00"
                          className="w-full bg-transparent border-b border-gold/20 py-4 font-serif text-lg focus:border-gold outline-none transition-colors"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-8">
                    <button onClick={handleNext} className="btn-gold w-full flex items-center justify-center gap-3">
                      Continuer <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h4 className="text-2xl font-serif text-green-dark mb-8 border-b border-gold/10 pb-4">Sélection du Forfait</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { id: 'bronze', name: 'Membre Bronze', price: '500 FCFA / mois', perks: '💰 Cashback IBC — Sur chaque dépense' },
                      { id: 'silver', name: 'Membre Silver', price: '2.500 FCFA / mois', perks: 'Cashback 5% + Conciergerie' },
                      { id: 'gold', name: 'Gold Elite', price: '10.000 FCFA / mois', perks: 'Cashback 7% + Accès VIP' }
                    ].map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => setFormData({...formData, plan: p.id})}
                        className={`p-6 border cursor-pointer transition-all flex items-center justify-between ${
                          formData.plan === p.id ? 'bg-green-dark text-white border-gold shadow-lg' : 'bg-white text-green-dark border-gold/10 hover:border-gold/30'
                        }`}
                      >
                        <div>
                          <div className="font-serif text-xl mb-1">{p.name}</div>
                          <div className={`text-[10px] uppercase tracking-widest font-bold ${formData.plan === p.id ? 'text-gold' : 'text-gold'}`}>{p.perks}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-serif italic">{p.price}</div>
                          {formData.plan === p.id && <CheckCircle2 className="text-gold mt-2 ml-auto" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 flex gap-4">
                    <button onClick={handleBack} className="btn-outline !px-8 flex items-center gap-2">
                      <ChevronLeft size={18} /> Retour
                    </button>
                    <button onClick={handleNext} className="btn-gold flex-grow flex items-center justify-center gap-3">
                      Continuer <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h4 className="text-2xl font-serif text-green-dark mb-8 border-b border-gold/10 pb-4">Mode de Paiement</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'orange', name: 'Orange Money', icon: <Smartphone /> },
                      { id: 'wave', name: 'Wave', icon: <Smartphone /> },
                      { id: 'moov', name: 'Moov Money', icon: <Smartphone /> },
                      { id: 'card', name: 'Carte Bancaire', icon: <CreditCard /> }
                    ].map((m) => (
                      <div 
                        key={m.id}
                        onClick={() => setFormData({...formData, paymentMethod: m.id})}
                        className={`p-6 border cursor-pointer transition-all text-center flex flex-col items-center gap-4 ${
                          formData.paymentMethod === m.id ? 'bg-green-dark text-white border-gold shadow-lg' : 'bg-white text-green-dark border-gold/10 hover:border-gold/30'
                        }`}
                      >
                        <div className={`${formData.paymentMethod === m.id ? 'text-gold' : 'text-gold'}`}>
                          {m.icon}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest font-bold">{m.name}</div>
                        {formData.paymentMethod === m.id && <CheckCircle2 size={16} className="text-gold absolute top-4 right-4" />}
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-cream/50 p-6 border border-gold/5 flex gap-4 items-start">
                    <Info size={20} className="text-gold shrink-0 mt-1" />
                    <p className="text-[11px] text-text-muted italic leading-relaxed">
                      En cliquant sur confirmer, vous acceptez notre Charte de Confidentialité et les Conditions Générales de Vente du Club. Votre adhésion sera soumise à validation.
                    </p>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button onClick={handleBack} className="btn-outline !px-8 flex items-center gap-2">
                      <ChevronLeft size={18} /> Retour
                    </button>
                    <button onClick={handleSubmit} className="btn-gold flex-grow flex items-center justify-center gap-3">
                      Confirmer mon Adhésion <Lock size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
      try {
        const txs = await getMemberTransactions(user.uid);
        setTransactions(txs);
      } catch (e) {
        console.error('Failed to load transactions:', e);
      }
      // Offers remain static until a dedicated offers service is added
      setOffers([
        { id: 'off_1', partnerName: 'Hôtel Tiama', description: '-20% sur les suites Junior', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200' },
        { id: 'off_2', partnerName: 'Le Grand Large', description: 'Dégustation privée offerte', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200' },
        { id: 'off_3', partnerName: 'Sofitel', description: 'Accès Spa VIP illimité', imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=200' },
      ]);
    };
    fetchData();
  }, [user.uid]);

  return (
    <div className="min-h-screen bg-green-darker text-white pb-32">
      {/* Dashboard Nav */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gold hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour au site
          </button>

      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-gold overflow-hidden bg-white/10">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Bienvenue,</p>
              <h3 className="font-serif text-xl">{user.name}</h3>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-green-dark transition-all">
              <Bell size={20} />
            </button>
            <button 
              onClick={onLogout}
              className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pt-10 space-y-10">
        {/* Solde Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-dark to-green-darker p-8 border border-gold/30 shadow-premium relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-x-8 -translate-y-8" />
          
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${user.tier === 'gold' ? 'bg-yellow-400' : user.tier === 'silver' ? 'bg-gray-300' : 'bg-orange-400'}`}></div>
            <span className="font-medium tracking-widest text-xs uppercase text-gold">Niveau {user.tier}</span>
          </div>
          <p className="text-[9px] text-white/50 italic mb-4">Votre cashback augmente avec votre niveau</p>
          
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-2">Mon Compte Cashback IBC</p>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-4xl font-serif text-white">{formatPrice(user.balance)} <span className="text-xl text-gold">FCFA</span></h2>
          </div>
          <p className="text-[10px] leading-relaxed text-white/70 italic border-t border-gold/20 pt-4 mt-2">
            Votre cashback est crédité automatiquement après chaque visite validée par l'établissement. Présentez votre QR Code en caisse.
          </p>
        </motion.div>

        {/* QR Button */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowQR(true)}
          className="w-full bg-white text-green-dark p-8 border border-gold shadow-gold flex flex-col items-center gap-4 hover:scale-[1.02] transition-transform"
        >
          <div className="p-4 bg-green-dark text-gold rounded-xl">
            <Scan size={40} />
          </div>
          <div className="text-center">
            <h4 className="font-serif text-2xl uppercase tracking-wider">Mon QR Code</h4>
            <p className="text-[11px] text-green-dark/60 mt-1 uppercase tracking-widest font-bold">Cliquez pour valider vos privilèges</p>
          </div>
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: 'Total Dépensé', value: formatPrice(user.totalSpent), unit: 'FCFA' },
            { label: 'Visites ce mois', value: user.visitsThisMonth, unit: 'LIEUX' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-green-dark/40 border border-gold/10 p-6 text-center"
            >
              <p className="text-[9px] uppercase tracking-widest text-gold font-bold mb-2">{stat.label}</p>
              <div className="text-xl font-serif text-white">{stat.value}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1">{stat.unit}</div>
            </motion.div>
          ))}
        </div>

        {/* Offers Carousel */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-serif text-xl text-gold">Offres Exclusives</h4>
            <button 
              onClick={() => navigate('/offers')}
              className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-gold"
            >
              Voir tout
            </button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            {offers.map((offer, i) => (
              <div key={i} className="min-w-[200px] bg-white text-green-dark p-4 border border-gold/10 group cursor-pointer">
                <div className="overflow-hidden mb-4">
                  <img src={offer.imageUrl} className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h5 className="font-serif text-lg leading-tight mb-2">{offer.partnerName}</h5>
                <p className="text-[10px] leading-relaxed text-text-muted">{offer.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="pb-10">
          <h4 className="font-serif text-xl text-gold mb-6">Activités Récentes</h4>
          <div className="space-y-4">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gold/5 bg-green-dark/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center text-gold">
                    <History size={18} />
                  </div>
                  <div>
                    <h5 className="font-serif text-white">{tx.partnerName}</h5>
                    <p className="text-[9px] uppercase tracking-widest text-white/30">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gold font-serif">+{formatPrice(tx.cashback)} <span className="text-[9px]">FCFA</span></div>
                  <div className="text-[8px] text-gold/60">cashback reçu</div>
                  <div className="text-[9px] uppercase tracking-widest text-gold/40 font-bold">{tx.status.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Overlay */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-green-darker/95 backdrop-blur-xl p-6"
          >
            <div className="w-full max-w-sm bg-white p-12 text-center relative">
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 text-green-dark"
              >
                <X size={24} />
              </button>
              <div className="mb-10">
                <h3 className="font-serif text-3xl text-green-dark mb-2">Votre Pass IBC</h3>
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">{user.name} - Membre {user.tier.toUpperCase()}</p>
              </div>
              <div className="bg-white p-6 border-2 border-gold shadow-premium inline-block mb-10">
                <QRCodeSVG value={user.qrCode} size={200} />
              </div>
              <p className="text-text-muted text-xs leading-relaxed italic">
                Présentez ce code à l'accueil de l'établissement <br /> pour valider vos privilèges.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-dark/95 backdrop-blur-md border-t border-gold/20 py-4 px-8 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between text-gold/40">
          <button className="flex flex-col items-center gap-1 text-gold">
            <LayoutDashboard size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/establishments')}
            className="flex flex-col items-center gap-1 hover:text-gold transition-colors"
          >
            <MapPin size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Lieux</span>
          </button>
          <button 
            onClick={() => navigate('/offers')}
            className="flex flex-col items-center gap-1 hover:text-gold transition-colors"
          >
            <Gift size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Offres</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-gold transition-colors">
            <Settings size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Compte</span>
          </button>
        </div>
      </div>
    </div>
  );
};



const EstablishmentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Tous');

  const places = [
    { name: 'Sofitel Abidjan', cat: 'Hôtel', zone: 'Cocody', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' },
    { name: 'Pullman Hélios', cat: 'Hôtel', zone: 'Plateau', cashback: '3-7%', img: '/assets/pullman-hotel.png' },
    { name: 'Sky Lounge', cat: 'Restaurant', zone: 'Marcory', cashback: '5%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
    { name: 'Radisson Blu', cat: 'Hôtel', zone: 'Port-Bouët', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Maison Akoula', cat: 'Lounge', zone: 'Assinie', cashback: '5%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Le Grand Large', cat: 'Restaurant', zone: 'Zone 4', cashback: '5%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' }
  ];

  const filteredPlaces = places.filter(p => 
    (filter === 'Tous' || p.cat === filter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white-warm">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-subtitle">RÉSEAU DE PRESTIGE</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-green-dark mb-6">Nos Établissements Partenaires</h3>
        </div>

        {/* Search & Filter */}
        <div className="max-w-4xl mx-auto mb-16 space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un lieu ou une zone (ex: Plateau, Sofitel...)"
              className="w-full bg-white border border-gold/10 py-5 pl-16 pr-6 font-serif text-lg focus:border-gold outline-none shadow-premium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {['Tous', 'Hôtel', 'Restaurant', 'Lounge', 'Bien-être'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  filter === f ? 'bg-green-dark text-gold border border-gold shadow-gold' : 'bg-white text-text-muted border border-gold/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredPlaces.map((place, i) => (
              <motion.div 
                key={place.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gold/10 group cursor-pointer overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-green-dark/90 backdrop-blur-md text-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-gold/30">
                    {place.cat}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <button className="btn-gold !w-full !py-2 text-[9px]">Détails & Réservation</button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-serif text-xl text-green-dark">{place.name}</h4>
                    <div className="flex items-center gap-1 text-gold">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-bold">5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted text-[10px] uppercase tracking-widest font-bold mb-4">
                    <MapPin size={12} className="text-gold" />
                    {place.zone}
                  </div>
                  <div className="pt-4 border-t border-gold/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-dark">Cashback {place.cashback}</span>
                    </div>
                    <ArrowUpRight size={16} className="text-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPlaces.length === 0 && (
          <div className="text-center py-20">
            <Compass size={48} className="mx-auto text-gold/30 mb-6" />
            <h4 className="font-serif text-2xl text-green-dark mb-2">Aucun établissement trouvé</h4>
            <p className="text-text-muted">Essayez d'élargir votre recherche ou de changer de catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginView: React.FC<{ onLogin: (email: string) => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Veuillez entrer votre email');
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-darker relative py-32 px-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <img src={ibcLogo} alt="IBC Logo" className="w-24 h-24 mx-auto mb-8 border border-gold/30 p-2 rounded-full" />
          <h2 className="text-3xl font-serif text-white mb-2">Accès Privé</h2>
          <p className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold">Portail des Membres</p>
        </div>

        <div className="bg-white p-12 border border-gold/10 shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Email</label>
              <input 
                type="email" 
                className="w-full bg-transparent border-b border-gold/20 py-3 font-serif focus:border-gold outline-none transition-colors"
                placeholder="Votre email professionnel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Mot de passe</label>
              <input 
                type="password" 
                className="w-full bg-transparent border-b border-gold/20 py-3 font-serif focus:border-gold outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
              <label className="flex items-center gap-2 text-text-muted cursor-pointer">
                <input type="checkbox" className="accent-gold" /> Se souvenir
              </label>
              <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-gold hover:text-gold-light">Oublié ?</button>
            </div>
            <button type="submit" className="btn-gold w-full py-4 mt-4">
              Entrer dans le Club
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-gold/5 text-center">
            <p className="text-[11px] text-text-muted mb-4 uppercase tracking-widest font-medium">Pas encore membre ?</p>
            <button 
              onClick={() => navigate('/member-registration')}
              className="text-green-dark text-xs font-bold uppercase tracking-[0.2em] border-b border-gold hover:text-gold transition-colors"
            >
              Demander mon adhésion
            </button>
          </div>
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/partner-dashboard')}
              className="text-[9px] uppercase tracking-widest text-text-muted hover:text-gold"
            >
              Accès Partenaire
            </button>
          </div>
        </div>
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
            <p className="text-white/50 text-sm max-w-sm leading-relaxed mb-10 font-light">
              L'excellence au sommet. Votre passerelle exclusive vers le monde du luxe 
              et des affaires en Côte d'Ivoire. Un réseau privé pour une élite exigeante.
            </p>
            <div className="flex gap-6">
              <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
                <Globe size={18} />
              </button>
              <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
                <Share2 size={18} />
              </button>
              <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-serif text-gold text-lg mb-8 tracking-wide">Navigation</h4>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Privilèges</button></li>
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Partenariats</button></li>
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Événements</button></li>
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Adhésion</button></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-serif text-gold text-lg mb-8 tracking-wide">Services</h4>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Conciergerie</button></li>
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Networking</button></li>
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Cashback</button></li>
              <li><button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Sponsoring</button></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-serif text-gold text-lg mb-8 tracking-wide">Contacts</h4>
            <ul className="space-y-6 text-sm font-light text-white/60">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-gold shrink-0" />
                <span>Abidjan, Côte d'Ivoire <br /> Cocody Ambassades</span>
              </li>
              <li className="flex items-center gap-4">
                <Briefcase size={18} className="text-gold shrink-0" />
                <span>+225 704 14 13 13</span>
              </li>
              <li className="flex items-center gap-4">
                <Star size={18} className="text-gold shrink-0" />
                <span>contact@ibc.ci</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] text-white/20 uppercase tracking-[0.4em]">
          <div>© 2026 IVOIRE BUSINESS CLUB. L'excellence au sommet.</div>
          <div className="flex gap-10">
            <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Mentions Légales</button>
            <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">Confidentialité</button>
            <button type="button" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors">CGU</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;
