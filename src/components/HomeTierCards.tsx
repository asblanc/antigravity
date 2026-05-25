import React from 'react';
import ibcLogo from '../assets/ibc-logo.png';

// ─── Tier configuration ────────────────────────────────────────────────────

interface TierInfo {
  id: string;
  badge: string;
  title: string;
  gradient: string;
  tone: 'light' | 'dark';
  profile: string;
  activity: string;
  price?: string;
  benefits: string[];
}

const TIERS: TierInfo[] = [
  {
    id: 'bronze',
    badge: 'BRONZE',
    title: 'Discovery Member',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
    tone: 'light',
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
    badge: 'OR',
    title: 'Prestige Member',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
    tone: 'light',
    profile: 'Membres à forte activité et consommation régulière',
    activity: '50 000 – 90 000 FCFA / week-end',
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
    badge: 'PLATINUM',
    title: 'Elite Member',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #A9A9A9 100%)',
    tone: 'dark',
    profile: 'Membres premium et grands consommateurs d’expériences',
    activity: '100 000 FCFA et plus / week-end',
    benefits: [
      'Accès expériences premium et VIP',
      'Réservations prioritaires',
      'Accès lounge',
      'Cashback jusqu\'à 7%',
    ],
  },
];

// ─── Single Member Card ─────────────────────────────────────────────────────

const MemberCard: React.FC<{ tier: TierInfo }> = ({ tier }) => {
  const isDarkText = tier.tone === 'dark';
  const textClass = isDarkText ? 'text-[#142017]' : 'text-white';
  const mutedClass = isDarkText ? 'text-[#142017]/70' : 'text-white/75';
  const borderClass = isDarkText ? 'border-black/10' : 'border-white/20';
  const badgeClass = isDarkText
    ? 'bg-black/10 text-[#142017] border-black/10'
    : 'bg-white/15 text-white border-white/25';
  const logoBoxClass = isDarkText ? 'bg-white/60 border-black/10' : 'bg-white/90 border-white/40';

  return (
    <article
      className={`group relative mx-auto flex aspect-[1.586/1] w-full max-w-[380px] flex-col overflow-hidden rounded-[18px] border ${borderClass} p-5 shadow-[0_18px_45px_rgba(3,29,15,0.14)] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-[0_26px_60px_rgba(3,29,15,0.24)] ${textClass}`}
      style={{ background: tier.gradient }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.04)_32%,rgba(255,255,255,0)_58%)]" />
      <div className={`pointer-events-none absolute -right-14 -top-12 h-36 w-36 rounded-full border ${borderClass}`} />
      <div className={`pointer-events-none absolute -bottom-20 right-8 h-40 w-40 rounded-full border ${borderClass}`} />
      <div className={`pointer-events-none absolute bottom-5 right-5 h-12 w-20 rounded-full border ${borderClass} opacity-50`} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className={`flex h-10 w-16 items-center justify-center rounded-md border ${logoBoxClass} px-2 shadow-sm`}>
          <img src={ibcLogo} alt="IBC" className="max-h-8 w-auto object-contain" />
        </div>
        <span className={`rounded-full border px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em] ${badgeClass}`}>
          {tier.badge}
        </span>
      </div>

      <div className="relative z-10 mt-5 min-h-0 flex-1">
        <p className="font-serif text-xl font-bold leading-tight tracking-wide sm:text-2xl">{tier.title}</p>
        <p className={`mt-1 text-[11px] font-medium leading-snug ${mutedClass}`}>Profil : {tier.profile}</p>

        <div className="mt-3">
          <p className={`text-[8px] font-bold uppercase tracking-[0.24em] ${mutedClass}`}>Activité moyenne</p>
          <p className="mt-0.5 text-xs font-semibold leading-snug">{tier.activity}</p>
        </div>

        <ul className="mt-3 grid grid-cols-1 gap-1 text-[10px] font-medium leading-tight sm:text-[11px]">
          {tier.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-1.5">
              <span className="mt-[-1px] font-bold">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`relative z-10 mt-4 flex items-end justify-between border-t ${borderClass} pt-3`}>
        {tier.price ? (
          <div>
            <p className={`text-[8px] font-bold uppercase tracking-[0.24em] ${mutedClass}`}>Tarif d'adhésion</p>
            <p className="mt-0.5 font-serif text-lg font-bold leading-none">{tier.price}</p>
          </div>
        ) : (
          <span className={`text-[8px] font-bold uppercase tracking-[0.24em] ${mutedClass}`}>Statut évolutif IBC</span>
        )}
        <div className="flex items-center gap-1.5 opacity-70">
          <span className={`h-2.5 w-2.5 rounded-full ${isDarkText ? 'bg-[#142017]/50' : 'bg-white/60'}`} />
          <span className={`h-2.5 w-2.5 rounded-full ${isDarkText ? 'bg-[#142017]/35' : 'bg-white/40'}`} />
          <div className={`ml-1 h-7 w-10 rounded ${isDarkText ? 'bg-[#142017]/15' : 'bg-white/15'} border ${borderClass}`}>
            <div className={`mx-auto mt-1.5 h-3.5 w-7 rounded-sm border ${borderClass}`} />
          </div>
        </div>
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
        <div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
          {TIERS.map((tier) => (
            <MemberCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
};
