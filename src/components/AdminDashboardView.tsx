import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, Users, Store, CreditCard, Gift, LogOut, ChevronLeft,
  Loader2, CheckCircle, XCircle, Wallet, TrendingUp, Award, Clock,
} from 'lucide-react';
import {
  getAdminOverview, getAdminMembers, setMemberActive, setMemberTier, adjustMemberBalance,
  getAdminEstablishments, updateEstablishment, getAdminTransactions, reviewTransaction,
  getAdminReferrals,
  type AdminOverview, type AdminMember, type AdminEstablishment, type AdminTransaction, type AdminReferral,
} from '../lib/admin.service';

const fmt = (n: number): string => (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'members', label: 'Membres', icon: Users },
  { id: 'partners', label: 'Établissements', icon: Store },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'referrals', label: 'Parrainages', icon: Gift },
] as const;

const TIERS = ['bronze', 'silver', 'gold', 'platinum'];

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
};

export const AdminDashboardView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>('overview');
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [establishments, setEstablishments] = useState<AdminEstablishment[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);

  const load = useCallback(async (which: string) => {
    setLoading(true);
    try {
      if (which === 'overview') setOverview(await getAdminOverview());
      else if (which === 'members') setMembers(await getAdminMembers());
      else if (which === 'partners') setEstablishments(await getAdminEstablishments());
      else if (which === 'transactions') setTransactions(await getAdminTransactions());
      else if (which === 'referrals') setReferrals(await getAdminReferrals());
    } catch (e: any) {
      toast.error(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleToggleMember = async (m: AdminMember) => {
    try {
      await setMemberActive(m.id, !m.active);
      toast.success(m.active ? 'Membre désactivé' : 'Membre activé');
      load('members');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleTierChange = async (m: AdminMember, tier: string) => {
    try {
      await setMemberTier(m.id, tier);
      toast.success(`Tier → ${tier}`);
      load('members');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAdjustBalance = async (m: AdminMember) => {
    const input = window.prompt(`Ajuster la cagnotte de ${m.name} (FCFA, négatif pour débiter) :`, '0');
    if (input === null) return;
    const amount = Number(input);
    if (Number.isNaN(amount) || amount === 0) return;
    try {
      await adjustMemberBalance(m.id, amount);
      toast.success('Cagnotte mise à jour');
      load('members');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleToggleEstablishment = async (e: AdminEstablishment) => {
    try {
      await updateEstablishment(e.id, !e.active, e.cashback_rate);
      toast.success(e.active ? 'Établissement suspendu' : 'Établissement approuvé');
      load('partners');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRateChange = async (e: AdminEstablishment) => {
    const input = window.prompt(`Taux de cashback pour ${e.name} (%) :`, String(e.cashback_rate));
    if (input === null) return;
    const rate = Number(input);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) { toast.error('Taux invalide'); return; }
    try {
      await updateEstablishment(e.id, e.active, rate);
      toast.success('Taux mis à jour');
      load('partners');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleReview = async (t: AdminTransaction, status: 'confirmed' | 'rejected') => {
    try {
      await reviewTransaction(t.id, status);
      toast.success(status === 'confirmed' ? 'Transaction confirmée' : 'Transaction rejetée');
      load('transactions');
    } catch (e: any) { toast.error(e.message); }
  };

  // ─── UI helpers ──────────────────────────────────────────────────────────
  const Kpi = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
    <div className="bg-white/5 border border-gold/20 rounded-2xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-gold font-bold">{label}</span>
        <Icon size={18} className="text-gold/70" />
      </div>
      <span className="font-serif text-3xl font-bold text-white">{value}</span>
      {sub && <span className="text-[11px] text-white/50">{sub}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-green-darker text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#031d0f] border-r border-gold/10 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-white/5">
          <p className="text-[9px] uppercase tracking-[0.4em] text-gold font-bold">Administration</p>
          <h3 className="font-serif text-xl text-white mt-1">Dashboard IBC</h3>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] transition-all ${
                tab === id ? 'bg-green-dark text-white border-l-4 border-gold font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} className={tab === id ? 'text-gold' : 'text-white/40'} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 text-white/50 hover:text-gold text-xs px-2 py-2">
            <ChevronLeft size={14} /> Retour au site
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-xs px-2 py-2">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        {/* Mobile tab bar */}
        <div className="md:hidden sticky top-0 z-30 bg-[#031d0f] border-b border-gold/10 flex overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-4 py-3 text-[11px] whitespace-nowrap ${tab === id ? 'text-gold border-b-2 border-gold' : 'text-white/50'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-5 md:p-8">
          {loading && (
            <div className="flex items-center gap-2 text-gold text-sm mb-6"><Loader2 size={16} className="animate-spin" /> Chargement…</div>
          )}

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && overview && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-gold">Vue d'ensemble</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi icon={Users} label="Membres" value={fmt(overview.members_total)} sub={`${fmt(overview.members_active)} actifs`} />
                <Kpi icon={Store} label="Établissements" value={fmt(overview.establishments_total)} sub={`${fmt(overview.establishments_pending)} en attente`} />
                <Kpi icon={TrendingUp} label="Volume confirmé" value={`${fmt(overview.tx_volume)} F`} sub={`${fmt(overview.tx_total)} transactions`} />
                <Kpi icon={Wallet} label="Cashback distribué" value={`${fmt(overview.cashback_distributed)} F`} />
                <Kpi icon={Clock} label="Transactions en attente" value={fmt(overview.tx_pending)} />
                <Kpi icon={Award} label="Partenaires" value={fmt(overview.partners_total)} />
                <Kpi icon={Gift} label="Parrainages" value={fmt(overview.referrals_total)} sub={`${fmt(overview.referral_bonus_total)} F de bonus`} />
              </div>

              <div className="bg-white/5 border border-gold/20 rounded-2xl p-6">
                <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold mb-4">Répartition par niveau</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {TIERS.map((t) => (
                    <div key={t} className="text-center">
                      <p className="font-serif text-2xl font-bold text-white">{fmt(overview.members_by_tier?.[t] || 0)}</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/50 mt-1">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MEMBERS ── */}
          {tab === 'members' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-gold">Membres ({members.length})</h2>
              <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Tier</th>
                      <th className="p-3 text-right">Cagnotte</th><th className="p-3 text-right">Dépensé</th>
                      <th className="p-3 text-center">Statut</th><th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">{m.name}</td>
                        <td className="p-3 text-white/60 text-xs">{m.email}</td>
                        <td className="p-3">
                          <select value={m.tier} onChange={(e) => handleTierChange(m, e.target.value)}
                            className="bg-green-dark border border-gold/20 rounded px-2 py-1 text-xs text-white">
                            {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="p-3 text-right font-mono text-gold">{fmt(m.balance)} F</td>
                        <td className="p-3 text-right font-mono text-white/70">{fmt(m.total_spent)} F</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${m.active ? STATUS_STYLE.active : STATUS_STYLE.rejected}`}>
                            {m.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleAdjustBalance(m)} title="Ajuster la cagnotte" className="text-gold hover:text-white"><Wallet size={16} /></button>
                            <button onClick={() => handleToggleMember(m)} title={m.active ? 'Désactiver' : 'Activer'} className={m.active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}>
                              {m.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && members.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-white/40 italic">Aucun membre.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PARTNERS / ESTABLISHMENTS ── */}
          {tab === 'partners' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-gold">Établissements ({establishments.length})</h2>
              <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-3">Nom</th><th className="p-3">Catégorie</th><th className="p-3">Zone</th>
                      <th className="p-3 text-right">Cashback</th><th className="p-3 text-center">Statut</th><th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {establishments.map((e) => (
                      <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">{e.name}</td>
                        <td className="p-3 text-white/60 text-xs">{e.category}</td>
                        <td className="p-3 text-white/60 text-xs">{e.zone}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleRateChange(e)} className="font-mono text-gold hover:underline">{e.cashback_rate}%</button>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${e.active ? STATUS_STYLE.active : STATUS_STYLE.pending}`}>
                            {e.active ? 'Actif' : 'En attente'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => handleToggleEstablishment(e)} className={`text-xs px-3 py-1 rounded-full border ${e.active ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                            {e.active ? 'Suspendre' : 'Approuver'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!loading && establishments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/40 italic">Aucun établissement.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {tab === 'transactions' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-gold">Transactions ({transactions.length})</h2>
              <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-3">Date</th><th className="p-3">Membre</th><th className="p-3">Établissement</th>
                      <th className="p-3 text-right">Montant</th><th className="p-3 text-right">Cashback</th>
                      <th className="p-3 text-center">Statut</th><th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 text-white/60 text-xs">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(t.created_at))}</td>
                        <td className="p-3">{t.memberName}</td>
                        <td className="p-3 text-white/70">{t.establishmentName}</td>
                        <td className="p-3 text-right font-mono">{fmt(t.amount)} F</td>
                        <td className="p-3 text-right font-mono text-gold">+{fmt(t.cashback_earned)} F</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[t.status] || ''}`}>{t.status}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            {t.status !== 'confirmed' && <button onClick={() => handleReview(t, 'confirmed')} title="Confirmer" className="text-green-400 hover:text-green-300"><CheckCircle size={16} /></button>}
                            {t.status !== 'rejected' && <button onClick={() => handleReview(t, 'rejected')} title="Rejeter" className="text-red-400 hover:text-red-300"><XCircle size={16} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && transactions.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-white/40 italic">Aucune transaction.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REFERRALS ── */}
          {tab === 'referrals' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-gold">Parrainages ({referrals.length})</h2>
              <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-3">Filleul</th><th className="p-3">Email</th><th className="p-3">Date</th>
                      <th className="p-3 text-center">Statut</th><th className="p-3 text-right">Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">{r.referee_name || '—'}</td>
                        <td className="p-3 text-white/60 text-xs">{r.referee_email || '—'}</td>
                        <td className="p-3 text-white/60 text-xs">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(r.created_at))}</td>
                        <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[r.status] || ''}`}>{r.status}</span></td>
                        <td className="p-3 text-right font-mono text-gold">{fmt(r.bonus)} F</td>
                      </tr>
                    ))}
                    {!loading && referrals.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-white/40 italic">Aucun parrainage (ou table referrals non créée).</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
