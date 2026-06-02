import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import type { Member } from '../../lib/mock-api';
import ibcLogo from '../../assets/ibc-logo.png';

interface NavbarProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
  currentView: string;
  user: Member | null;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled, mobileMenuOpen, setMobileMenuOpen, currentView, user }) => {
  const navigate = useNavigate();
  const isSolid = scrolled || currentView !== '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isSolid ? 'bg-white shadow-premium py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3">
          <img src={ibcLogo} alt="IBC Logo" width={40} height={40} decoding="async" className="w-10 h-10" />
          <div className="flex flex-col items-start text-left">
            <span className={`font-serif text-lg font-bold italic block leading-none ${isSolid ? 'text-green-dark' : 'text-white'}`}>Ivoire Business Club</span>
            <span className="hidden lg:block text-gold text-[7px] uppercase tracking-[0.15em] font-bold mt-1 leading-tight max-w-[280px]">
              PLATEFORME D'EXPÉRIENCES TOURISTIQUES<br />ET CLUB PRIVÉ D'AVANTAGES
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
