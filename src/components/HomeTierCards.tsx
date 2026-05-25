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
    tone: 'dark',
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
  const mutedClass = isDarkText ? 'text-[#142017]/80' : 'text-white/90';
  const borderClass = isDarkText ? 'border-black/15' : 'border-white/25';
  const badgeClass = isDarkText
    ? 'bg-black/10 text-[#142017] border-black/15'
    : 'bg-white/20 text-white border-white/30';
  const logoBoxClass = isDarkText ? 'bg-white/70 border-black/15' : 'bg-white/95 border-white/40';

  return (
    <article
      className={`group relative mx-auto flex min-h-[500px] w-full max-w-[430px] flex-col overflow-hidden rounded-[18px] border ${borderClass} p-6 shadow-[0_18px_45px_rgba(3,29,15,0.14)] transition-all duration-300 sm:p-7 md:min-h-[540px] md:hover:-translate-y-1 md:hover:shadow-[0_26px_60px_rgba(3,29,15,0.24)] ${textClass}`}
      style={{
        background: isDarkText
          ? tier.gradient
          : `linear-gradient(135deg, rgba(0,0,0,0.28), rgba(0,0,0,0.36)), ${tier.gradient}`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-10 bg-[linear-gradient(115deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.12)_28%,rgba(255,255,255,0)_54%)]" />
      <div className={`pointer-events-none absolute -right-16 -top-16 z-0 h-44 w-44 rounded-full border ${borderClass} opacity-15`} />
      <div className={`pointer-events-none absolute -bottom-24 right-4 z-0 h-48 w-48 rounded-full border ${borderClass} opacity-10`} />
      <div className={`pointer-events-none absolute bottom-6 right-6 z-0 h-10 w-16 rounded-full border ${borderClass} opacity-10`} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className={`flex h-12 w-20 items-center justify-center rounded-md border ${logoBoxClass} px-2 shadow-sm`}>
          <img src={ibcLogo} alt="IBC" className="max-h-8 w-auto object-contain" />
        </div>
        <span className={`rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] ${badgeClass}`}>
          {tier.badge}
        </span>
      </div>

      <div className="relative z-10 mt-7 flex-1">
        <p className="font-serif text-2xl font-bold leading-tight tracking-wide sm:text-[1.7rem]">{tier.title}</p>
        <p className={`mt-3 text-sm font-semibold leading-relaxed ${mutedClass}`}>Profil : {tier.profile}</p>

        <div className={`mt-5 rounded-lg border ${borderClass} ${isDarkText ? 'bg-white/20' : 'bg-white/10'} p-4`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${mutedClass}`}>Activité moyenne</p>
          <p className="mt-1.5 text-base font-bold leading-snug">{tier.activity}</p>
        </div>

        <ul className="mt-5 grid grid-cols-1 gap-3 text-sm font-semibold leading-snug sm:text-[15px]">
          {tier.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDarkText ? 'bg-[#142017] text-white' : 'bg-white text-[#142017]'}`}>✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`relative z-10 mt-7 flex items-end justify-between gap-4 border-t ${borderClass} pt-5`}>
        {tier.price ? (
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${mutedClass}`}>Tarif d'adhésion</p>
            <p className="mt-1.5 font-serif text-2xl font-bold leading-none">{tier.price}</p>
          </div>
        ) : (
          <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${mutedClass}`}>Statut évolutif IBC</span>
        )}
        <div className="flex shrink-0 items-center gap-1.5 opacity-50">
          <span className={`h-2.5 w-2.5 rounded-full ${isDarkText ? 'bg-[#142017]/50' : 'bg-white/60'}`} />
          <span className={`h-2.5 w-2.5 rounded-full ${isDarkText ? 'bg-[#142017]/35' : 'bg-white/40'}`} />
          <div className={`ml-1 h-7 w-10 rounded ${isDarkText ? 'bg-[#142017]/15' : 'bg-white/15'} border ${borderClass} opacity-60`}>
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
        <div className="grid grid-cols-1 justify-items-center gap-7 md:grid-cols-3 md:items-stretch md:gap-5 lg:gap-7">
          {TIERS.map((tier) => (
            <MemberCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
};
