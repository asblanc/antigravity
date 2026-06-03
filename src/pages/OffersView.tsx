import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { FadeImage } from '../components/FadeImage';
import {
  BadgePercent, Crown, Gift, Wallet, Users, Sparkles, Star,
  TrendingUp, Banknote, Headphones, ArrowRight, Check, MapPin,
} from 'lucide-react';

const TIERS = [
  {
    name: 'Bronze', sub: 'Discovery Member', cashback: '3%', color: '#8C6239', icon: Star,
    perks: ['Accès aux expériences partenaires', 'Invitations événements découverte', 'Cagnotte & cashback automatique'],
    note: 'Inclus dès 500 FCFA / mois',
  },
  {
    name: 'Or', sub: 'Privilege Member', cashback: '5%', color: '#C9A84C', icon: Crown,
    perks: ['Accès prioritaire aux réservations', 'Invitations cocktails & soirées VIP', 'Objectifs & Épargne Club'],
    note: 'Dès 15 000 pts cumulés',
  },
  {
    name: 'Platinum', sub: 'Elite Member', cashback: '7%', color: '#94A3B8', icon: Sparkles,
    perks: ['Conciergerie privée WhatsApp', 'Surclassements hôteliers VIP', 'Cercle Évasion & séjours premium'],
    note: 'Dès 30 000 pts cumulés',
  },
];

const PRIVILEGES = [
  { icon: Wallet, title: 'Cashback automatique', desc: 'Jusqu’à 7% reversés sur chaque dépense chez nos partenaires.' },
  { icon: Gift, title: 'Ma Cagnotte IBC', desc: 'Un capital plaisir réutilisable en un clic chez nos partenaires.' },
  { icon: TrendingUp, title: 'Objectifs Évasion', desc: 'Financez vos voyages grâce à votre épargne de cashback.' },
  { icon: Banknote, title: 'Épargne Club', desc: 'Mettez de côté une partie de votre cashback sans effort.' },
  { icon: Users, title: 'Cercle Évasion', desc: 'Cumulez vos cagnottes entre proches pour partir ensemble.' },
  { icon: Headphones, title: 'Conciergerie', desc: 'Un service dédié pour vos réservations et demandes spéciales.' },
];

const DEALS = [
  { name: 'Sunset Lounge', location: 'Sky Lounge, Marcory', discount: '-20%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=500' },
  { name: 'Dîner Signature', location: 'Le Grand Large, Zone 4', discount: '-15%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500' },
  { name: 'Week-end Évasion', location: 'Maison Akoula, Assinie', discount: 'Cashback x2', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=500' },
  { name: 'Nuit Prestige', location: 'Sofitel Abidjan, Cocody', discount: '-20%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=500' },
];

export const OffersView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <Seo
        title="Avantages Membres — Cashback & Privilèges | Ivoire Business Club"
        description="Découvrez les avantages du Club IBC : cashback jusqu'à 7%, cagnotte, objectifs évasion, épargne, conciergerie et offres exclusives en Côte d'Ivoire."
        path="/offers"
      />

      <div className="container mx-auto px-6">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-3">Avantages membres</span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-green-dark mb-4">Tout ce que le club vous offre</h1>
          <p className="text-text-muted text-base md:text-lg">
            Plus qu'une carte : un véritable écosystème de privilèges qui récompense chacune de vos sorties et expériences lifestyle.
          </p>
          <button onClick={() => navigate('/member-registration')} className="btn-gold px-10 py-4 mt-8">Devenir membre</button>
        </div>

        {/* Cashback par tier */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">Cashback évolutif</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-green-dark">Plus vous explorez, plus vous gagnez</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className="bg-white border border-gold/15 rounded-3xl p-7 shadow-soft flex flex-col" style={{ borderTopColor: t.color, borderTopWidth: 4 }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: t.color }}>
                    <t.icon size={16} fill="currentColor" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold" style={{ color: t.color }}>{t.name}</h3>
                    <p className="text-[9px] uppercase tracking-wider text-text-muted font-semibold">{t.sub}</p>
                  </div>
                </div>
                <div className="mb-5">
                  <span className="font-serif text-4xl font-extrabold text-green-dark">{t.cashback}</span>
                  <span className="text-text-muted text-sm ml-1">de cashback</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[12px] text-text">
                      <Check size={14} className="text-gold shrink-0 mt-0.5" /><span>{p}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 pt-4 border-t border-gold/10 text-[11px] font-bold" style={{ color: t.color }}>{t.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privilèges */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">Vos privilèges</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-green-dark">Une gestion intelligente de vos loisirs</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRIVILEGES.map((p) => (
              <div key={p.title} className="bg-white border border-gold/10 hover:border-gold/30 hover:shadow-soft rounded-2xl p-6 flex items-start gap-4 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-green-dark/5 flex items-center justify-center shrink-0 border border-gold/20">
                  <p.icon size={20} className="text-gold" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-green-dark">{p.title}</h4>
                  <p className="text-[12px] text-text-muted mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offres exclusives */}
        <div className="mb-20">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-2">Offres du moment</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-green-dark">Privilèges exclusifs négociés pour vous</h2>
            </div>
            <button onClick={() => navigate('/establishments')} className="text-[10px] uppercase tracking-[0.3em] font-bold text-green-dark border-b border-green-dark hover:text-gold transition-colors flex items-center gap-1">
              Voir tous les partenaires <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            {DEALS.map((d) => (
              <div key={d.name} className="hover-lift bg-white border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-premium transition-all duration-300 group">
                <div className="relative overflow-hidden h-36">
                  <FadeImage src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-dark/70 to-transparent" />
                  <span className="absolute top-2 right-2 bg-gradient-to-r from-gold to-[#F0C040] text-green-darker text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded shadow-sm">{d.discount}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif text-sm font-bold text-green-dark truncate">{d.name}</h4>
                  <p className="flex items-center gap-1 text-text-muted text-[10px] mt-1"><MapPin size={10} className="text-gold" /><span className="truncate">{d.location}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="max-w-3xl mx-auto text-center bg-green-dark rounded-[36px] p-10 md:p-14 shadow-premium">
          <BadgePercent size={32} className="text-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3">Prêt à profiter de tous ces avantages ?</h2>
          <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-8">
            Rejoignez Ivoire Business Club dès 500 FCFA / mois et transformez chacune de vos sorties en avantages concrets.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/member-registration')} className="btn-gold px-10 py-4">Devenir membre</button>
            <button onClick={() => navigate('/establishments')} className="px-10 py-4 border border-gold/40 text-gold font-bold uppercase tracking-widest text-[10px] rounded-[4px] hover:bg-gold hover:text-green-darker transition-all">Explorer les partenaires</button>
          </div>
        </div>
      </div>
    </div>
  );
};
