import React from 'react';

// ─── Tier configuration ────────────────────────────────────────────────────

interface TierInfo {
  id: string;
  name: string;
  title: string;
  gradient: string;
  textColor: string;
  badgeBg: string;
  chipColor: string;
  profile: string;
  activity: string;
  price: string;
  benefits: string[];
}

const TIERS: TierInfo[] = [
  {
    id: 'bronze',
    name: 'BRONZE',
    title: 'Discovery Member',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 40%, #8B4513 100%)',
    textColor: '#FFF8E7',
    badgeBg: 'rgba(255,248,231,0.15)',
    chipColor: '#B8860B',
    profile: 'Membres découverte et lifestyle occasionnel',
    activity: '10 000 – 40 000 FCFA / week-end',
    price: '500 FCFA / mois',
    benefits: [
      'Accès aux expériences standards',
      'Accès prioritaire à certaines offres',
      'Invitations événements découverte',
      'Avantages partenaires',
      'Cashback jusqu\'à 3%',
    ],
  },
  {
    id: 'gold',
    name: 'OR',
    title: 'Prestige Member',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #DAA520 40%, #B8860B 100%)',
    textColor: '#1A1A1A',
    badgeBg: 'rgba(0,0,0,0.15)',
    chipColor: '#DAA520',
    profile: 'Membres à forte activité et consommation régulière',
    activity: '50 000 – 90 000 FCFA / week-end',
    price: '—',
    benefits: [
      'Accès aux expériences prestige',
      'Invitations événements privés',
      'Avantages partenaires renforcés',
      'Accès prioritaire à certains événements',
      'Cashback jusqu\'à 5%',
    ],
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    title: 'Elite Member',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 40%, #A9A9A9 100%)',
    textColor: '#1A1A2E',
    badgeBg: 'rgba(26,26,46,0.1)',
    chipColor: '#A9A9A9',
    profile: 'Membres premium et grands consommateurs',
    activity: '100 000 FCFA et plus / week-end',
    price: '—',
    benefits: [
      'Accès expériences premium et VIP',
      'Réservations prioritaires',
      'Accès lounge',
      'Cashback jusqu\'à 7%',
    ],
  },
];

// ─── Single Card ────────────────────────────────────────────────────────────

const TierCard: React.FC<{ tier: TierInfo }> = ({ tier }) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 select-none group"
      style={{ background: tier.gradient, color: tier.textColor }}
    >
      {/* Decorative SVG pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-8">
        <svg width="100%" height="100%" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
          <circle cx="350" cy="-50" r="140" fill="white" opacity="0.12" />
          <circle cx="400" cy="400" r="120" fill="white" opacity="0.08" />
          <circle cx="-60" cy="250" r="100" fill="white" opacity="0.06" />
          <line x1="0" y1="450" x2="400" y2="450" stroke="white" strokeWidth="0.5" opacity="0.1" />
          <line x1="0" y1="460" x2="400" y2="460" stroke="white" strokeWidth="0.5" opacity="0.05" />
        </svg>
      </div>

      {/* Subtle shine overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{
        background: `linear-gradient(105deg, transparent 30%, ${tier.id === 'gold' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'} 35%, transparent 40%)`,
      }} />

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Top: Logo + Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-xl font-black tracking-tighter drop-shadow-sm" style={{ color: tier.id === 'gold' ? '#1A1A1A' : '#FFD700' }}>IBC</span>
            <span className="text-sm">🌴</span>
          </div>
          <span
            className="text-[9px] font-extrabold uppercase tracking-[0.15em] px-3 py-1 rounded-full"
            style={{
              background: tier.badgeBg,
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: tier.textColor,
            }}
          >
            {tier.name}
          </span>
        </div>

        {/* Card chip */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-6 rounded-[3px] flex items-center justify-center shadow-inner" style={{ background: tier.chipColor }}>
            <div className="w-6 h-4 rounded-[2px] border border-white/25" />
          </div>
          <div className="flex gap-1 opacity-30">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        </div>

        {/* Title + profile */}
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.3em] font-light opacity-75 mb-1">{tier.title}</p>
          <p className="text-[11px] leading-snug opacity-70 italic">{tier.profile}</p>
        </div>

        {/* Activity */}
        <div className="mb-3">
          <p className="text-[7px] uppercase tracking-[0.25em] font-bold opacity-60">Activité moyenne</p>
          <p className="text-xs font-medium mt-0.5">{tier.activity}</p>
        </div>

        {/* Benefits */}
        <div className="flex-1">
          <p className="text-[7px] uppercase tracking-[0.25em] font-bold opacity-60 mb-1.5">Avantages</p>
          <div className="space-y-1">
            {tier.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[9px] shrink-0 mt-0.5" style={{ color: tier.id === 'bronze' ? '#CD7F32' : '#FFD700' }}>✓</span>
                <span className="text-[10px] leading-snug opacity-85">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        {tier.price !== '—' && (
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
            <span className="text-[8px] uppercase tracking-wider opacity-50">Adhésion</span>
            <span className="font-serif text-base font-bold drop-shadow-sm">{tier.price}</span>
          </div>
        )}

        {/* Empty price placeholder for tiers without price */}
        {tier.price === '—' && (
          <div className="mt-4 pt-3 border-t border-white/10" />
        )}
      </div>
    </div>
  );
};

// ─── Section Component ─────────────────────────────────────────────────────

export const HomeTierCards: React.FC = () => {
  return (
    <section className="py-20 sm:py-32 bg-white reveal-section" id="membership-tiers">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section header */}
        <div className="border border-gold/20 p-8 sm:p-12 text-center mb-10 sm:mb-14 max-w-4xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">IBC MEMBERSHIP</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-green-dark leading-tight">
            LE PROGRAMME MEMBRE IBC
          </h2>
        </div>

        {/* Description */}
        <div className="mb-12 bg-cream p-6 sm:p-8 border border-gold/10 text-green-dark leading-relaxed max-w-4xl mx-auto rounded-xl">
          <p className="font-semibold mb-3 text-sm sm:text-base">
            Un système d'avantages et de privilèges évolutif basé sur l'activité et l'expérience membre.
          </p>
          <p className="font-medium mb-2 text-xs sm:text-sm">La plateforme IVOIRE BUSINESS CLUB analyse :</p>
          <ul className="space-y-1.5 pl-4 mb-3 text-[#1B5E35]/80 text-xs sm:text-sm">
            <li className="flex items-start gap-2"><span>•</span> les habitudes de consommation</li>
            <li className="flex items-start gap-2"><span>•</span> les préférences membres</li>
            <li className="flex items-start gap-2"><span>•</span> les expériences vécues</li>
            <li className="flex items-start gap-2"><span>•</span> les interactions avec les établissements partenaires</li>
          </ul>
          <p className="font-medium text-xs sm:text-sm">
            afin d'offrir une expérience personnalisée et des avantages adaptés au profil de chaque membre.
          </p>
        </div>

        {/* 3 cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 lg:gap-6">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
};