import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Users, Search, Filter, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MemberRecord {
  id: string;
  cardNumber?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  company?: string;
  tier?: string;
  points?: number;
  phone?: string;
  whatsapp?: string;
  joinDate?: any;
  expireDate?: any;
  active?: boolean;
}

const formatPoints = (num: number | undefined): string => {
  if (num == null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const TIER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  bronze: { bg: 'bg-[#8C6239]/20', text: 'text-[#8C6239]', label: 'Bronze' },
  silver: { bg: 'bg-slate-300/20', text: 'text-slate-300', label: 'Argent' },
  gold: { bg: 'bg-[#C9A84C]/20', text: 'text-gold', label: 'Or' },
};

const TIER_OPTIONS = [
  { value: '', label: 'Tous les niveaux' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Argent' },
  { value: 'gold', label: 'Or' },
];

export const MembersListView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [allMembers, setAllMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'member')
          .order('name', { ascending: true });
          
        if (error) throw error;
        setAllMembers(data as unknown as MemberRecord[]);
      } catch (e) {
        console.error('Erreur chargement membres:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return allMembers.filter(m => {
      if (tierFilter && m.tier !== tierFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const name = (m.name || m.firstName || m.lastName || '').toLowerCase();
        const card = (m.cardNumber || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        if (!name.includes(q) && !card.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [allMembers, tierFilter, searchTerm]);

  const getTierStyle = (tier?: string) => TIER_COLORS[tier || ''] || TIER_COLORS.bronze;

  return (
    <div className="min-h-screen bg-green-darker text-white pb-32">
      {/* Admin Nav */}
      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <button onClick={() => navigate('/admin-dashboard')} className="self-start flex items-center gap-2 text-gold hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Retour au dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-gold flex items-center justify-center bg-white/10">
                <Users size={24} className="text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Administration Centrale</p>
                <h3 className="font-serif text-xl">Liste des membres IBC</h3>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-6">
        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Total</p>
            <p className="font-serif text-2xl font-bold text-gold mt-1">{allMembers.length}</p>
          </div>
          <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Bronze</p>
            <p className="font-serif text-2xl font-bold text-[#8C6239] mt-1">{allMembers.filter(m => m.tier === 'bronze').length}</p>
          </div>
          <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Argent</p>
            <p className="font-serif text-2xl font-bold text-slate-300 mt-1">{allMembers.filter(m => m.tier === 'silver').length}</p>
          </div>
          <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Or</p>
            <p className="font-serif text-2xl font-bold text-gold mt-1">{allMembers.filter(m => m.tier === 'gold').length}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, carte ou email..."
              className="w-full bg-white/5 border border-gold/15 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-gold transition-colors"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-white/5 border border-gold/15 rounded-xl py-3 pl-12 pr-10 text-sm text-white outline-none focus:border-gold transition-colors appearance-none cursor-pointer min-w-[180px]"
            >
              {TIER_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-green-darker text-white">{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Desktop table — hidden on small screens */}
        {!loading && (
          <>
            <div className="hidden sm:block bg-white/5 border border-gold/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-green-dark border-b border-gold/20 text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-4">Carte N°</th>
                      <th className="p-4">Nom & Prénom</th>
                      <th className="p-4 hidden md:table-cell">Email</th>
                      <th className="p-4 hidden lg:table-cell">Compagnie</th>
                      <th className="p-4">Niveau</th>
                      <th className="p-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(m => {
                      const ts = getTierStyle(m.tier);
                      return (
                        <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-sm font-mono text-white/70">{m.cardNumber || '—'}</td>
                          <td className="p-4 text-sm font-medium">{m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || '—'}</td>
                          <td className="p-4 text-sm text-white/50 hidden md:table-cell">{m.email || '—'}</td>
                          <td className="p-4 text-sm text-white/50 hidden lg:table-cell">{m.company || '—'}</td>
                          <td className="p-4">
                            <span className={`${ts.bg} ${ts.text} text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                              {ts.label}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-right font-mono font-bold">{formatPoints(m.points)}</td>
                        </tr>
                      );
                    })}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-white/50 italic">Aucun membre trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards — shown on small screens */}
            <div className="sm:hidden space-y-3">
              {filteredMembers.map(m => {
                const ts = getTierStyle(m.tier);
                return (
                  <div key={m.id} className="bg-white/5 border border-gold/15 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
                        #{m.cardNumber || 'N/A'}
                      </span>
                      <span className={`${ts.bg} ${ts.text} text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                        {ts.label}
                      </span>
                    </div>
                    <p className="font-serif font-bold text-white text-sm">
                      {m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || '—'}
                    </p>
                    {m.email && <p className="text-xs text-white/50 truncate">{m.email}</p>}
                    {m.company && <p className="text-xs text-white/40 truncate">{m.company}</p>}
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider">Points</span>
                      <span className="font-mono font-bold text-gold text-sm">{formatPoints(m.points)}</span>
                    </div>
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <div className="text-center py-12 text-white/50 italic">
                  <p>Aucun membre trouvé.</p>
                </div>
              )}
            </div>

            {/* Bottom counter */}
            <div className="text-center text-[10px] text-white/30 uppercase tracking-widest">
              {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} affiché{filteredMembers.length !== 1 ? 's' : ''}
              {tierFilter && ` (filtre: ${TIER_OPTIONS.find(o => o.value === tierFilter)?.label})`}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
