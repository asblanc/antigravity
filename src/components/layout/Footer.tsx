import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, MessageSquare, MapPin, Briefcase, Star } from 'lucide-react';
import ibcLogo from '../../assets/ibc-logo.png';

export const Footer: React.FC = () => {
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
            <p className="text-white/50 text-sm max-w-sm leading-relaxed mb-10 font-light">L'excellence au sommet. Votre passerelle exclusive vers le monde du luxe et des affaires en Côte d'Ivoire.</p>
            <div className="flex gap-6">
              {[Globe, Share2, MessageSquare].map((Icon, i) => (
                <button key={i} type="button" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all"><Icon size={18} /></button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-serif text-gold text-lg mb-8 tracking-wide">Navigation</h4>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {[{ label: 'Privilèges', path: '/offers' }, { label: 'Partenariats', path: '/partner-registration' }, { label: 'Événements', path: '/establishments' }, { label: 'Adhésion', path: '/member-registration' }].map((item) => (
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
              <li className="flex items-start gap-4"><MapPin size={18} className="text-gold shrink-0" /><span>Abidjan, Côte d'Ivoire<br />Cocody Ambassades</span></li>
              <li className="flex items-center gap-4"><Briefcase size={18} className="text-gold shrink-0" /><span>+225 704 14 13 13</span></li>
              <li className="flex items-center gap-4"><Star size={18} className="text-gold shrink-0" /><span>contact@ibc.ci</span></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[9px] text-white/20 uppercase tracking-[0.4em]">
          <div>© 2026 IVOIRE BUSINESS CLUB. L'excellence au sommet.</div>
          <div className="flex gap-10">
            {[
              { label: 'Mentions Légales', path: 'mentions-legales' },
              { label: 'Confidentialité', path: 'confidentialite' },
              { label: 'CGU', path: 'cgu' }
            ].map((item) => (
              <Link key={item.path} to={`/legal/${item.path}`} className="hover:text-white transition-colors">{item.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
