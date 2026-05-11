import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import ibcLogo from '../assets/ibc-logo.png';

export interface MemberPublicView {
  firstName: string;
  lastInitial: string;
  status: 'BRONZE' | 'SILVER' | 'GOLD';
  isActive: boolean;
  maskedId: string;
}

export const buildMemberPublicView = (userData: any): MemberPublicView => {
  // Safe extraction of names
  let firstName = 'Membre';
  let lastInitial = '';
  
  if (userData.name) {
    const parts = userData.name.split(' ');
    firstName = parts[0];
    if (parts.length > 1) {
      lastInitial = parts[parts.length - 1].charAt(0).toUpperCase() + '.';
    }
  } else {
    if (userData.firstName) firstName = userData.firstName;
    if (userData.lastName) lastInitial = userData.lastName.charAt(0).toUpperCase() + '.';
  }

  return {
    firstName,
    lastInitial,
    status: userData.status || userData.plan?.toUpperCase() || 'BRONZE',
    isActive: userData.subscription?.active ?? (userData.status !== 'inactive'),
    maskedId: maskMemberId(userData.memberId || userData.uid || userData.id),
  };
};

export const maskMemberId = (id: string): string => {
  if (!id) return 'IBC-***';
  // Attempt to split by '-' if it's formatted like IBC-MEMBER-SOMETHING
  const parts = id.split('-');
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    const visible = last.slice(-3);
    return `${parts[0]}-***${visible}`;
  }
  // Otherwise mask the middle
  const visible = id.slice(-3);
  return `IBC-***${visible}`;
};

interface Props {
  memberData: any;
}

export const MemberIdentityCard: React.FC<Props> = ({ memberData }) => {
  const publicView = buildMemberPublicView(memberData);

  if (!publicView.isActive) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg text-center max-w-sm mx-auto shadow-lg backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full border-2 border-red-500/50 overflow-hidden bg-black/20 mx-auto mb-4 flex items-center justify-center">
          <img src={ibcLogo} alt="IBC" className="w-10 h-10 object-contain opacity-50 grayscale" />
        </div>
        <div className="flex items-center justify-center gap-2 text-red-400 font-bold mb-2">
          <XCircle className="w-5 h-5" />
          <span>MEMBRE NON ÉLIGIBLE</span>
        </div>
        <p className="text-red-300 text-sm">
          Invitez-le à régulariser<br />son abonnement IBC
        </p>
      </div>
    );
  }

  const statusColors = {
    BRONZE: 'text-orange-400',
    SILVER: 'text-gray-300',
    GOLD: 'text-yellow-400',
  };

  return (
    <div className="bg-white/5 border border-gold/20 p-6 rounded-lg max-w-sm mx-auto shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Decorative background glow based on status */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-gold/50 overflow-hidden bg-green-dark flex-shrink-0 flex items-center justify-center shadow-lg">
          <img src={ibcLogo} alt="IBC" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h3 className="font-serif text-2xl text-white tracking-wide">
            {publicView.firstName} {publicView.lastInitial}
          </h3>
          <p className="text-gold/80 font-mono text-sm tracking-wider mt-1">{publicView.maskedId}</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded">
          <div className={`w-2 h-2 rounded-full bg-current ${statusColors[publicView.status as keyof typeof statusColors] || 'text-gold'}`}></div>
          <span className="font-medium tracking-widest text-sm uppercase text-white/90">
            Niveau {publicView.status}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">MEMBRE IBC ACTIF</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">ÉLIGIBLE AU CASHBACK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
