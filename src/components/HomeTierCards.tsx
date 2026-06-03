import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Crown, Sparkles, Check } from 'lucide-react';
import ibcLogo from '../assets/ibc-logo.webp';

// ─── Tier configuration ────────────────────────────────────────────────────

interface TierInfo {
  id: string;
  badge: string;
  title: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  popular?: boolean;
  profile: string;
  activity: string;
  price?: string;
  cashback: string;
  benefits: string[];
}

const TIERS: TierInfo[] = [
  {
    id: 'bronze',
    badge: 'Bronze',
    title: 'Discovery Member',
    color: '#B87333',
    icon: Star,
    profile: 'Découverte & lifestyle occasionnel',
    activity: '10 000 – 40 000 FCFA / week-end',
    price: '500 FCFA / mois',
    cashback: '3%',
    benefits: [
      'Accès aux expériences standards',
      'Accès prioritaire à certaines offres',
      'Invitations événements découverte',
      'Avantages partenaires',
    ],
  },
  {
    id: 'gold',
    badge: 'Or',
    title: 'Prestige Member',
    color: '#C9A84C',
    icon: Crown,
    popular: true,
    profile: 'Forte activité & consommation régulière',
    activity: '50 000 – 90 000 FCFA / week-end',
    cashback: '5%',
    benefits: [
      'Accès aux expériences prestige',
      'Invitations événements privés',
      'Avantages partenaires renforcés',
      'Accès prioritaire aux événements',
    ],
  },
  {
    id: 'platinum',
    badge: 'Platinum',
    title: 'Elite Member',
    color: '#7C8B9B',
    icon: Sparkles,
    profile: 'Premium & grands consommateurs',
    activity: '100 000 FCFA et plus / week-end',
    cashback: '7%',
    benefits: [
      'Accès expériences premium & VIP',
      'Réservations prioritaires',
      'Accès lounge & conciergerie',
      'Surclassements partenaires',
    ],
  },
];

// ─── Single Member Card ─────────────────────────────────────────────────────

const MemberCard: React.FC<{ tier: TierInfo }> = ({ tier }) => {
  const navigate = useNavigate();
  const Icon = tier.icon;

  return (
    <article
      className={`hover-lift relative flex w-full max-w-[380px] flex-col rounded-3xl bg-white p-6 sm:p-7 shadow-soft transition-all
        ${tier.popular ? 'border-2 border-gold ring-2 ring-gold/15 md:-translate-y-3' : 'border border-gold/15'}`}
      style={{ borderTopColor: tier.color, borderTopWidth: tier.popular ? undefined : 4 }}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-green-darker shadow-md">
          Le plus populaire
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0" style={{ background: tier.color }}>
            <Icon size={17} />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold leading-none" style={{ color: tier.color }}>{tier.badge}</h3>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-text-muted">{tier.title}</p>
          </div>
        </div>
        <img src={ibcLogo} alt="IBC" width={32} height={32} className="h-8 w-8 object-contain opacity-80" />
      </div>

      {/* Cashback highlight */}
      <div className="mt-6">
        <span className="font-serif text-4xl font-extrabold text-green-dark">{tier.cashback}</span>
        <span className="ml-1.5 text-sm text-text-muted">de cashback</span>
      </div>
      <p className="mt-1 text-xs text-text-muted">{tier.profile}</p>

      {/* Activité */}
      <div className="mt-5 rounded-xl border border-gold/10 bg-cream/50 p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Activité moyenne</p>
        <p className="mt-0.5 text-xs font-semibold text-green-dark">{tier.activity}</p>
      </div>

      {/* Benefits */}
      <ul className="mt-5 flex-1 space-y-2.5">
        {tier.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-[13px] text-text">
            <Check size={15} className="mt-0.5 shrink-0" style={{ color: tier.color }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-gold/10 pt-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">{tier.price ? 'Adhésion' : 'Statut'}</p>
          <p className="mt-0.5 font-serif text-base font-bold text-green-dark">{tier.price ?? 'Évolutif'}</p>
        </div>
        <button
          onClick={() => navigate('/member-registration')}
          className="shrink-0 rounded-full bg-green-dark px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gold transition-colors hover:bg-[#031d0f]"
        >
          Choisir
        </button>
      </div>
    </article>
  );
};

// ─── Section Component ─────────────────────────────────────────────────────

export const HomeTierCards: React.FC = () => {
  return (
    <section className="py-20 sm:py-32 bg-white reveal-section" id="membership-tiers">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">IBC Membership</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-green-dark leading-tight mb-4">
            Le programme membre IBC
          </h2>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed">
            Un système d'avantages évolutif : plus vous vivez d'expériences, plus vos privilèges et votre
            cashback augmentent. Votre statut s'adapte automatiquement à votre activité.
          </p>
        </div>

        {/* 3 cards grid */}
        <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-3 md:items-stretch md:gap-6">
          {TIERS.map((tier) => (
            <MemberCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
};
