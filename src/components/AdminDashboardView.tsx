import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, Users, Store, CreditCard, Gift, LogOut, ChevronLeft,
  Loader2, CheckCircle, XCircle, Wallet, TrendingUp, Award, Clock, Banknote,
  Bell, Settings, Send, Trash2, Shield, Calendar, Pencil, Inbox, Check, ImagePlus,
} from 'lucide-react';
import {
  getAdminOverview, getAdminMembers, setMemberActive, setMemberTier, adjustMemberBalance,
  getAdminEstablishments, updateEstablishment, getAdminTransactions, reviewTransaction,
  getAdminReferrals, getAdminSubscriptions, reviewSubscription,
  getAdminNotifications, sendNotification, deleteNotification,
  getAdmins, setUserRole, setRoleByEmail,
  getAllExperiences, saveExperience, deleteExperience,
  getContactMessages, setMessageHandled, deleteMessage,
  uploadEstablishmentImage,
  type AdminOverview, type AdminMember, type AdminEstablishment, type AdminTransaction,
  type AdminReferral, type AdminSubscription, type AdminNotification, type AdminUser,
  type AdminExperience, type ContactMessage,
} from '../lib/admin.service';

const fmt = (n: number): string => (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'members', label: 'Membres', icon: Users },
  { id: 'partners', label: 'Établissements', icon: Store },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'subscriptions', label: 'Abonnements', icon: Banknote },
  { id: 'referrals', label: 'Parrainages', icon: Gift },
  { id: 'experiences', label: 'Expériences', icon: Calendar },
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'communication', label: 'Communication', icon: Bell },
  { id: 'settings', label: 'Paramètres', icon: Settings },
] as const;

const EMPTY_EXP = { id: null as string | null, title: '', description: '', location: '', event_date: '', image_url: '', price: '', capacity: '', active: true };

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
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [experiences, setExperiences] = useState<AdminExperience[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Formulaires
  const [notifForm, setNotifForm] = useState({ title: '', body: '', audience: 'all' });
  const [promoteForm, setPromoteForm] = useState({ email: '', role: 'admin' });
  const [expForm, setExpForm] = useState<typeof EMPTY_EXP>(EMPTY_EXP);

  const load = useCallback(async (which: string) => {
    setLoading(true);
    try {
      if (which === 'overview') setOverview(await getAdminOverview());
      else if (which === 'members') setMembers(await getAdminMembers());
      else if (which === 'partners') setEstablishments(await getAdminEstablishments());
      else if (which === 'transactions') setTransactions(await getAdminTransactions());
      else if (which === 'subscriptions') setSubscriptions(await getAdminSubscriptions());
      else if (which === 'referrals') setReferrals(await getAdminReferrals());
      else if (which === 'communication') setNotifications(await getAdminNotifications());
      else if (which === 'settings') setAdmins(await getAdmins());
      else if (which === 'experiences') setExperiences(await getAllExperiences());
      else if (which === 'messages') setMessages(await getContactMessages());
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

  const handleEstImage = async (e: AdminEstablishment, file: File) => {
    try {
      const url = await uploadEstablishmentImage(e.id, file);
      await updateEstablishment(e.id, e.active, e.cashback_rate, url);
      toast.success('Photo mise à jour');
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

  const handleReviewSub = async (s: AdminSubscription, status: 'active' | 'cancelled') => {
    try {
      await reviewSubscription(s.id, status);
      toast.success(status === 'active' ? 'Abonnement activé' : 'Abonnement annulé');
      load('subscriptions');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSendNotif = async () => {
    if (!notifForm.title.trim() || !notifForm.body.trim()) { toast.error('Titre et message requis'); return; }
    try {
      await sendNotification(notifForm.title, notifForm.body, notifForm.audience);
      toast.success('Notification envoyée');
      setNotifForm({ title: '', body: '', audience: 'all' });
      load('communication');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteNotif = async (id: string) => {
    try { await deleteNotification(id); toast.success('Notification supprimée'); load('communication'); }
    catch (e: any) { toast.error(e.message); }
  };

  const handlePromote = async () => {
    if (!promoteForm.email.trim()) { toast.error('E-mail requis'); return; }
    try {
      await setRoleByEmail(promoteForm.email, promoteForm.role);
      toast.success('Rôle mis à jour');
      setPromoteForm({ email: '', role: 'admin' });
      load('settings');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDemote = async (u: AdminUser) => {
    if (!window.confirm(`Retirer les droits admin de ${u.name} ?`)) return;
    try { await setUserRole(u.id, 'member'); toast.success('Admin rétrogradé en membre'); load('settings'); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleSaveExp = async () => {
    if (!expForm.title.trim()) { toast.error('Titre requis'); return; }
    try {
      await saveExperience({
        id: expForm.id,
        title: expForm.title,
        description: expForm.description,
        location: expForm.location,
        event_date: expForm.event_date ? new Date(expForm.event_date).toISOString() : null,
        image_url: expForm.image_url,
        price: Number(expForm.price) || 0,
        capacity: expForm.capacity ? Number(expForm.capacity) : null,
        active: expForm.active,
      });
      toast.success(expForm.id ? 'Expérience mise à jour' : 'Expérience créée');
      setExpForm(EMPTY_EXP);
      load('experiences');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleEditExp = (x: AdminExperience) => {
    setExpForm({
      id: x.id, title: x.title, description: x.description || '', location: x.location || '',
      event_date: x.event_date ? x.event_date.slice(0, 16) : '', image_url: x.image_url || '',
      price: String(x.price ?? ''), capacity: x.capacity != null ? String(x.capacity) : '', active: x.active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExp = async (x: AdminExperience) => {
    if (!window.confirm(`Supprimer « ${x.title} » ?`)) return;
    try { await deleteExperience(x.id); toast.success('Expérience supprimée'); load('experiences'); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleToggleMsg = async (m: ContactMessage) => {
    try { await setMessageHandled(m.id, !m.handled); load('messages'); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteMsg = async (m: ContactMessage) => {
    if (!window.confirm(`Supprimer le message de ${m.name} ?`)) return;
    try { await deleteMessage(m.id); toast.success('Message supprimé'); load('messages'); }
    catch (e: any) { toast.error(e.message); }
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
                <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold mb-5">Répartition des membres par niveau</h3>
                {(() => {
                  const tierColors: Record<string, string> = { bronze: '#8C6239', silver: '#C0C0C0', gold: '#C9A84C', platinum: '#94A3B8' };
                  const counts = TIERS.map((t) => overview.members_by_tier?.[t] || 0);
                  const max = Math.max(1, ...counts);
                  return (
                    <div className="space-y-3">
                      {TIERS.map((t) => {
                        const c = overview.members_by_tier?.[t] || 0;
                        return (
                          <div key={t} className="flex items-center gap-3">
                            <span className="w-16 text-[10px] uppercase tracking-wider text-white/60 shrink-0">{t}</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round((c / max) * 100)}%`, background: tierColors[t] }} />
                            </div>
                            <span className="w-8 text-right font-bold text-white text-sm shrink-0">{fmt(c)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-3">
                            <label className="cursor-pointer text-gold hover:text-white" title="Changer la photo">
                              <ImagePlus size={16} />
                              <input type="file" accept="image/*" className="hidden" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) handleEstImage(e, f); ev.currentTarget.value = ''; }} />
                            </label>
                            <button onClick={() => handleToggleEstablishment(e)} className={`text-xs px-3 py-1 rounded-full border ${e.active ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                              {e.active ? 'Suspendre' : 'Approuver'}
                            </button>
                          </div>
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

          {/* ── SUBSCRIPTIONS ── */}
          {tab === 'subscriptions' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-gold">Abonnements ({subscriptions.length})</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Kpi icon={Banknote} label="Revenu actif (MRR)" value={`${fmt(subscriptions.filter(s => s.status === 'active').reduce((t, s) => t + (s.amount || 0), 0))} F`} />
                <Kpi icon={CheckCircle} label="Abonnements actifs" value={fmt(subscriptions.filter(s => s.status === 'active').length)} />
                <Kpi icon={Clock} label="En attente de paiement" value={fmt(subscriptions.filter(s => s.status === 'pending').length)} />
              </div>
              <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-3">Membre</th><th className="p-3">Plan</th><th className="p-3">Paiement</th>
                      <th className="p-3 text-right">Montant</th><th className="p-3">Échéance</th>
                      <th className="p-3 text-center">Statut</th><th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">{s.memberName}</td>
                        <td className="p-3 uppercase text-xs">{s.plan}</td>
                        <td className="p-3 text-white/60 text-xs">{s.payment_method || '—'}</td>
                        <td className="p-3 text-right font-mono text-gold">{fmt(s.amount)} F</td>
                        <td className="p-3 text-white/60 text-xs">{s.expires_at ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(new Date(s.expires_at)) : '—'}</td>
                        <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[s.status] || STATUS_STYLE.pending}`}>{s.status}</span></td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            {s.status !== 'active' && <button onClick={() => handleReviewSub(s, 'active')} title="Activer (paiement reçu)" className="text-green-400 hover:text-green-300"><CheckCircle size={16} /></button>}
                            {s.status !== 'cancelled' && <button onClick={() => handleReviewSub(s, 'cancelled')} title="Annuler" className="text-red-400 hover:text-red-300"><XCircle size={16} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && subscriptions.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-white/40 italic">Aucun abonnement (ou table subscriptions non créée).</td></tr>}
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

          {/* ── MESSAGES ── */}
          {tab === 'messages' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-gold">Messages de contact ({messages.length})</h2>
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`bg-white/5 border rounded-2xl p-5 ${m.handled ? 'border-white/10 opacity-70' : 'border-gold/20'}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-white">{m.name} <span className="text-white/40 text-xs font-normal">· {m.email}</span></p>
                        {m.subject && <p className="text-gold text-xs mt-0.5">{m.subject}</p>}
                      </div>
                      <span className="text-[10px] text-white/40">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(m.created_at))}</span>
                    </div>
                    <p className="text-sm text-white/80 mt-3 whitespace-pre-wrap leading-relaxed">{m.message}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <a href={`mailto:${m.email}`} className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10">Répondre</a>
                      <button onClick={() => handleToggleMsg(m)} className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border flex items-center gap-1 ${m.handled ? 'border-white/20 text-white/50' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                        <Check size={12} /> {m.handled ? 'Traité' : 'Marquer traité'}
                      </button>
                      <button onClick={() => handleDeleteMsg(m)} className="text-red-400 hover:text-red-300 ml-auto" title="Supprimer"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
                {!loading && messages.length === 0 && <div className="p-8 text-center text-white/40 italic bg-white/5 border border-gold/20 rounded-2xl">Aucun message (ou table non créée).</div>}
              </div>
            </div>
          )}

          {/* ── EXPERIENCES ── */}
          {tab === 'experiences' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-gold">Expériences ({experiences.length})</h2>

              <div className="bg-white/5 border border-gold/20 rounded-2xl p-6 space-y-3 max-w-3xl">
                <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold">{expForm.id ? 'Modifier' : 'Nouvelle'} expérience</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} placeholder="Titre *" className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold" />
                  <input value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} placeholder="Lieu" className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold" />
                  <input type="datetime-local" value={expForm.event_date} onChange={(e) => setExpForm({ ...expForm, event_date: e.target.value })} className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold" />
                  <input value={expForm.image_url} onChange={(e) => setExpForm({ ...expForm, image_url: e.target.value })} placeholder="URL image" className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold" />
                  <input type="number" value={expForm.price} onChange={(e) => setExpForm({ ...expForm, price: e.target.value })} placeholder="Prix (FCFA)" className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold" />
                  <input type="number" value={expForm.capacity} onChange={(e) => setExpForm({ ...expForm, capacity: e.target.value })} placeholder="Capacité" className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold" />
                </div>
                <textarea value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold resize-none" />
                <label className="flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={expForm.active} onChange={(e) => setExpForm({ ...expForm, active: e.target.checked })} /> Active (visible par les membres)</label>
                <div className="flex gap-2">
                  <button onClick={handleSaveExp} className="bg-gold text-green-darker text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:opacity-90">{expForm.id ? 'Enregistrer' : 'Créer'}</button>
                  {expForm.id && <button onClick={() => setExpForm(EMPTY_EXP)} className="text-xs text-white/50 hover:text-white px-4">Annuler</button>}
                </div>
              </div>

              <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-3">Titre</th><th className="p-3">Date</th><th className="p-3">Lieu</th>
                      <th className="p-3 text-right">Prix</th><th className="p-3 text-center">Active</th><th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map((x) => (
                      <tr key={x.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 font-semibold">{x.title}</td>
                        <td className="p-3 text-white/60 text-xs">{x.event_date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(x.event_date)) : '—'}</td>
                        <td className="p-3 text-white/60 text-xs">{x.location || '—'}</td>
                        <td className="p-3 text-right font-mono text-gold">{x.price > 0 ? `${fmt(x.price)} F` : 'Gratuit'}</td>
                        <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${x.active ? STATUS_STYLE.active : STATUS_STYLE.pending}`}>{x.active ? 'Oui' : 'Non'}</span></td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEditExp(x)} className="text-gold hover:text-white" title="Modifier"><Pencil size={15} /></button>
                            <button onClick={() => handleDeleteExp(x)} className="text-red-400 hover:text-red-300" title="Supprimer"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && experiences.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/40 italic">Aucune expérience (ou table non créée).</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── COMMUNICATION ── */}
          {tab === 'communication' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-gold">Communication</h2>

              <div className="bg-white/5 border border-gold/20 rounded-2xl p-6 space-y-4 max-w-2xl">
                <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold">Nouvelle notification</h3>
                <input
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  placeholder="Titre"
                  className="w-full bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold"
                />
                <textarea
                  value={notifForm.body}
                  onChange={(e) => setNotifForm({ ...notifForm, body: e.target.value })}
                  placeholder="Message"
                  rows={3}
                  className="w-full bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold resize-none"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={notifForm.audience}
                    onChange={(e) => setNotifForm({ ...notifForm, audience: e.target.value })}
                    className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="all">Tout le monde</option>
                    <option value="members">Membres</option>
                    <option value="partners">Partenaires</option>
                    <option value="admins">Admins</option>
                  </select>
                  <button onClick={handleSendNotif} className="flex items-center gap-2 bg-gold text-green-darker text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:opacity-90">
                    <Send size={14} /> Envoyer
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                      <th className="p-3">Titre</th><th className="p-3">Message</th><th className="p-3">Audience</th>
                      <th className="p-3">Date</th><th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((n) => (
                      <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 font-semibold">{n.title}</td>
                        <td className="p-3 text-white/60 text-xs max-w-xs truncate">{n.body}</td>
                        <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/30 text-gold uppercase">{n.audience}</span></td>
                        <td className="p-3 text-white/50 text-xs">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(n.created_at))}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => handleDeleteNotif(n.id)} className="text-red-400 hover:text-red-300" title="Supprimer"><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))}
                    {!loading && notifications.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-white/40 italic">Aucune notification envoyée (ou table non créée).</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SETTINGS / ADMINS ── */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-gold">Paramètres & Admins</h2>

              <div className="bg-white/5 border border-gold/20 rounded-2xl p-6 space-y-4 max-w-2xl">
                <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-2"><Shield size={14} /> Désigner un administrateur</h3>
                <p className="text-xs text-white/50">L'utilisateur doit déjà avoir un compte. Saisis son e-mail pour changer son rôle.</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    value={promoteForm.email}
                    onChange={(e) => setPromoteForm({ ...promoteForm, email: e.target.value })}
                    placeholder="email@exemple.com"
                    className="flex-1 min-w-[200px] bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold"
                  />
                  <select
                    value={promoteForm.role}
                    onChange={(e) => setPromoteForm({ ...promoteForm, role: e.target.value })}
                    className="bg-green-dark border border-gold/20 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="partner">Partenaire</option>
                    <option value="member">Membre</option>
                  </select>
                  <button onClick={handlePromote} className="bg-gold text-green-darker text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:opacity-90">Appliquer</button>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold mb-3">Administrateurs actuels ({admins.length})</h3>
                <div className="bg-white/5 border border-gold/20 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-green-dark text-[10px] uppercase tracking-widest text-gold">
                        <th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-3">{u.name}</td>
                          <td className="p-3 text-white/60 text-xs">{u.email}</td>
                          <td className="p-3 text-center">
                            <button onClick={() => handleDemote(u)} className="text-xs px-3 py-1 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10">Rétrograder</button>
                          </td>
                        </tr>
                      ))}
                      {!loading && admins.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-white/40 italic">Aucun admin.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
