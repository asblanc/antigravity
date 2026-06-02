import React, { useState, useId } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MemberCardData {
  name: string;
  tier: 'bronze' | 'silver' | 'gold';
  cardNumber?: string;
  memberCode?: string;
  expireDate?: string;
  points?: number;
}

interface TierConfig {
  name: string;
  title: string;
  gradient: string;
  gradientRev: string;
  textColor: string;
  accentColor: string;
  shineColor: string;
  chipColor: string;
  profile: string;
  activity: string;
  price: string;
  benefits: string[];
}

const TIERS: Record<string, TierConfig> = {
  bronze: {
    name: 'BRONZE',
    title: 'Discovery Member',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 40%, #8B4513 100%)',
    gradientRev: 'linear-gradient(135deg, #8B4513 0%, #B8860B 40%, #CD7F32 100%)',
    textColor: '#FFF8E7',
    accentColor: '#CD7F32',
    shineColor: 'rgba(255,248,231,0.15)',
    chipColor: '#B8860B',
    profile: 'Membres découverte et lifestyle occasionnel',
    activity: '10 000 à 40 000 FCFA / week-end',
    price: '500 FCFA / mois',
    benefits: [
      'Accès aux expériences standards',
      'Accès prioritaire à certaines offres',
      'Invitations événements découverte',
      'Avantages partenaires',
      'Cashback jusqu\'à 3%',
    ],
  },
  silver: {
    name: 'ARGENT',
    title: 'Privilege Member',
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 40%, #808080 100%)',
    gradientRev: 'linear-gradient(135deg, #808080 0%, #A8A8A8 40%, #C0C0C0 100%)',
    textColor: '#1A1A2E',
    accentColor: '#E8E8E8',
    shineColor: 'rgba(255,255,255,0.2)',
    chipColor: '#A8A8A8',
    profile: 'Membres actifs et consommateurs réguliers',
    activity: '20 000 à 70 000 FCFA / week-end',
    price: '--',
    benefits: [
      'Accès aux expériences prestige',
      'Invitations événements privés',
      'Avantages partenaires renforcés',
      'Accès prioritaire à certains événements',
      'Cashback jusqu\'à 5%',
    ],
  },
  gold: {
    name: 'OR',
    title: 'Prestige Member',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #DAA520 40%, #B8860B 100%)',
    gradientRev: 'linear-gradient(135deg, #B8860B 0%, #DAA520 40%, #FFD700 100%)',
    textColor: '#1A1A1A',
    accentColor: '#FFD700',
    shineColor: 'rgba(255,215,0,0.2)',
    chipColor: '#DAA520',
    profile: 'Membres à forte activité et consommation régulière',
    activity: '50 000 à 90 000 FCFA / week-end',
    price: '--',
    benefits: [
      'Accès aux expériences prestige',
      'Invitations événements privés',
      'Avantages partenaires renforcés',
      'Accès prioritaire à certains événements',
      'Cashback jusqu\'à 5%',
    ],
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export const MemberCard: React.FC<{ data: MemberCardData; className?: string }> = ({ data, className = '' }) => {
  const [flipped, setFlipped] = useState(false);
  const tier = TIERS[data.tier] || TIERS.bronze;
  const uid = useId();
  const cardNum = data.cardNumber || data.memberCode || `IBC-2024-${data.name.slice(0, 2).toUpperCase()}-${uid.replace(/[:\s]/g, '').slice(-4).toUpperCase()}`;
  const expireDate = data.expireDate || '12/27';
  const displayName = data.name || 'Membre IBC';
  const memberPoints = data.points ?? 0;

  return (
    <div
      className={`perspective-container ${className}`}
      onClick={() => setFlipped(!flipped)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFlipped(!flipped); }}
      aria-label="Carte membre – retourner pour voir les avantages"
    >
      <style>{`
        @keyframes shimmer { 0%, 100% { background-position: 200% 0; } 50% { background-position: -100% 0; } }
        .perspective-container { perspective: 1200px; cursor: pointer; }
        .card-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face {
          position: absolute; inset: 0; width: 100%; height: 100%;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          border-radius: 16px; overflow: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }
        @media (max-width: 639px) {
          .card-inner { transition-duration: 0.5s; }
        }
      `}</style>

      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* ─── RECTO ─── */}
        <div
          className="card-face p-5 sm:p-6 flex flex-col justify-between select-none shadow-xl"
          style={{ background: tier.gradient, color: tier.textColor }}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
              <circle cx="350" cy="-30" r="120" fill="white" opacity="0.15" />
              <circle cx="380" cy="220" r="100" fill="white" opacity="0.1" />
              <circle cx="-50" cy="150" r="80" fill="white" opacity="0.08" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" opacity="0.15" />
              <line x1="0" y1="210" x2="400" y2="210" stroke="white" strokeWidth="0.5" opacity="0.08" />
            </svg>
          </div>

          {/* Shine overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `linear-gradient(105deg, transparent 40%, ${tier.shineColor} 45%, transparent 50%, ${tier.shineColor} 55%, transparent 60%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 4s ease-in-out infinite',
          }} />

          {/* Top row: Logo + Level Badge */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="font-serif text-xl font-black tracking-tighter drop-shadow-md" style={{ color: data.tier === 'gold' ? '#1A1A1A' : '#FFD700' }}>IBC</span>
                <span className="text-sm">🌴</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] uppercase tracking-[0.25em] font-bold block opacity-80">Niveau</span>
              <span
                className="inline-block text-[9px] font-extrabold uppercase tracking-[0.15em] px-3 py-0.5 rounded-full mt-0.5"
                style={{
                  background: data.tier === 'gold' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: tier.textColor,
                }}
              >
                {tier.name}
              </span>
            </div>
          </div>

          {/* Card chip area */}
          <div className="relative z-10 flex items-center gap-3 my-2 sm:my-3">
            <div className="w-9 h-7 rounded-[4px] flex items-center justify-center shadow-inner" style={{ background: tier.chipColor }}>
              <div className="w-7 h-5 rounded-[2px] border border-white/30 flex items-center justify-center">
                <div className="w-4 h-2.5 rounded-[1px]" style={{ background: tier.chipColor }} />
              </div>
            </div>
            <div className="flex gap-1 opacity-40">
              <span className="w-2 h-2 rounded-full bg-white/60" />
              <span className="w-2 h-2 rounded-full bg-white/60" />
            </div>
          </div>

          {/* Member name + Tier title */}
          <div className="relative z-10">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-light mb-0.5 opacity-80">{tier.title}</p>
            <p className="text-lg sm:text-xl font-bold tracking-wide drop-shadow-sm">{displayName}</p>
            <p className="text-[9px] opacity-60 mt-0.5 italic">{tier.profile}</p>
          </div>

          {/* Bottom: Card number + Expiry */}
          <div className="flex items-end justify-between relative z-10 mt-2">
            <div>
              <p className="text-[7px] uppercase tracking-[0.2em] opacity-50 mb-0.5">Numéro de carte</p>
              <p className="font-mono text-xs sm:text-sm tracking-[0.15em] font-medium">{cardNum}</p>
            </div>
            <div className="text-right">
              <p className="text-[7px] uppercase tracking-[0.2em] opacity-50 mb-0.5">Expire fin</p>
              <p className="font-mono text-xs sm:text-sm tracking-wider font-medium">{expireDate}</p>
            </div>
          </div>
        </div>

        {/* ─── VERSO ─── */}
        <div
          className="card-face card-back p-5 sm:p-6 flex flex-col justify-between select-none shadow-xl"
          style={{ background: tier.gradientRev, color: tier.textColor }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-8">
            <svg width="100%" height="100%" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="400" height="250" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
              <circle cx="200" cy="125" r="90" fill="white" opacity="0.05" />
            </svg>
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 35%, transparent 40%)`,
          }} />

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base font-black tracking-tighter drop-shadow-md" style={{ color: data.tier === 'gold' ? '#1A1A1A' : '#FFD700' }}>IBC</span>
                <span className="text-xs">🌴</span>
              </div>
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold px-2.5 py-0.5 rounded-full" style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {tier.name} — {tier.title}
              </span>
            </div>

            {/* Activité */}
            <div className="mb-2">
              <p className="text-[7px] uppercase tracking-[0.25em] opacity-60 font-bold">Activité moyenne</p>
              <p className="text-[10px] sm:text-xs mt-0.5 font-medium">{tier.activity}</p>
            </div>

            {/* Tarif */}
            {tier.price && tier.price !== '--' && (
              <div className="mb-1.5">
                <p className="text-[7px] uppercase tracking-[0.25em] opacity-60 font-bold">Tarif d'adhésion</p>
                <p className="text-[10px] sm:text-xs mt-0.5 font-bold" style={{ color: '#FFD700' }}>{tier.price}</p>
              </div>
            )}

            {/* Avantages */}
            <div className="flex-1">
              <p className="text-[7px] uppercase tracking-[0.25em] opacity-60 font-bold mb-1">Avantages</p>
              <div className="grid grid-cols-1 gap-0.5">
                {tier.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-[9px]" style={{ color: data.tier === 'bronze' ? '#CD7F32' : '#FFD700' }}>✓</span>
                    <span className="text-[9px] sm:text-[10px] leading-snug opacity-85">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Points */}
            {memberPoints > 0 && (
              <div className="mt-2 pt-2 border-t border-white/10 text-center">
                <span className="text-[8px] uppercase tracking-wider opacity-50">Points de fidélité</span>
                <p className="font-serif text-base font-bold drop-shadow-sm">{memberPoints.toLocaleString('fr-FR')} pts</p>
              </div>
            )}

            {/* Badge flip indicator */}
            <div className="text-center mt-1">
              <span className="text-[7px] uppercase tracking-widest opacity-40">← Retourner →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};