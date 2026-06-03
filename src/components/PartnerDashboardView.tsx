import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  LogOut, Scan, History, Gift, Settings, 
  ChevronLeft, CheckCircle2, Lock, Unlock,
  LayoutDashboard, Megaphone, Star, MessageSquare,
  TrendingUp, Users, Calendar, HelpCircle, ArrowRight,
  Menu, X, ChevronRight, BadgePercent, Plus, Building,
  DollarSign, Activity, Award, Copy, Check, Palmtree, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateMemberQR } from '../lib/partner.service';
import { recordTransaction, getPartnerTransactions } from '../lib/transaction.service';
import { MemberIdentityCard } from './MemberIdentityCard';

export const PartnerDashboardView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [accessLevel, setAccessLevel] = useState<'STAFF' | 'OWNER'>('STAFF');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Transaction States
  const [txStep, setTxStep] = useState<'SCAN' | 'AMOUNT' | 'SUCCESS'>('SCAN');
  const [scanning, setScanning] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  const [amount, setAmount] = useState<string>('');
  const [txSuccessData, setTxSuccessData] = useState<any>(null);
  const [scanInput, setScanInput] = useState<string>('');

  // Recent transactions list
  const [recentTx, setRecentTx] = useState<any[]>([]);

  // Mock states for interactive toggles in Offers & Campaigns
  const [offersList, setOffersList] = useState([
    { id: 1, title: 'Cashback permanent', description: 'Reverser 10% de cashback aux membres Gold & Platinum', active: true, badge: 'Standard' },
    { id: 2, title: 'Cocktail de bienvenue', description: 'Offrir un cocktail premium aux membres Platinum dès leur arrivée', active: true, badge: 'Exclusif' },
    { id: 3, title: 'Réduction restaurant', description: '15% de réduction sur la carte du restaurant pour tous les membres IBC', active: false, badge: 'Offre temporaire' }
  ]);

  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'Brunch de Pentecôte', target: 'Membres OR & PLATINUM', reach: '450 membres', openRate: '92%', status: 'Envoyée', date: 'il y a 2 jours' },
    { id: 2, title: 'Soirée Jazz & Wine', target: 'Tous les membres Abidjan', reach: '1 250 membres', openRate: '85%', status: 'Planifiée', date: 'Prévue pour le 28 mai' }
  ]);

  const [reviews] = useState([
    { id: 1, author: 'Koffi A.', rating: 5, comment: 'Service impeccable au Pullman Hélios ! Le cashback automatique a été enregistré instantanément lors de mon paiement.', date: "Aujourd'hui, 14:20", tier: 'PLATINUM' },
    { id: 2, author: 'Saran D.', rating: 4, comment: 'Très bon accueil. Le cocktail offert pour mon statut Or était excellent. Je recommande vivement.', date: 'Hier, 19:45', tier: 'OR' },
    { id: 3, author: 'Jean-Marc K.', rating: 5, comment: "Lieu d'exception et service digne d'un 5 étoiles. Hâte de revenir pour mon prochain séjour d'affaires.", date: 'il y a 3 jours', tier: 'BRONZE' }
  ]);

  const [partnerReferrals] = useState([
    { id: 1, businessName: 'Azar Club', category: 'Nightlife', status: 'Actif', bonusEarned: '25 000 FCFA' },
    { id: 2, businessName: 'La Plage', category: 'Beach Club', status: 'En attente', bonusEarned: '0 FCFA' }
  ]);

  const [events] = useState([
    { id: 1, title: 'IBC Partner Summit 2026', date: 'Mardi 15 Juin • 09h00', location: 'Pullman Hélios (Salon VIP)', description: 'Rencontre annuelle des partenaires agréés pour échanger sur le développement du club.' },
    { id: 2, title: 'Cocktail Networking', date: 'Jeudi 4 Juin • 19h00', location: 'Sunset Lounge', description: "Soirée de réseautage et partage d'opportunités d'affaires entre membres et partenaires." }
  ]);

  useEffect(() => {
    loadRecentTx();
  }, []);

  const loadRecentTx = async () => {
    try {
      const txs = await getPartnerTransactions('demo-partner-id', 10);
      setRecentTx(txs);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePinSubmit = () => {
    if (pin === '1234') {
      setAccessLevel('OWNER');
      setShowPinModal(false);
      setPin('');
      toast.success('Mode Propriétaire activé');
    } else {
      toast.error('Code PIN incorrect');
    }
  };

  const handleScan = async (qrContent?: string) => {
    setScanning(true);
    setMemberData(null);
    toast.loading('Recherche du membre...');

    const payload = qrContent || 'IBC-MEMBER-KOUASSI-SILVER-demo';

    try {
      const result = await validateMemberQR(payload);
      setScanning(false);
      toast.dismiss();
      if (result) {
        setMemberData(result);
        setTxStep('AMOUNT');
      } else {
        toast.error('Membre introuvable ou QR invalide');
      }
    } catch (error) {
      setScanning(false);
      toast.dismiss();
      toast.error('Erreur de vérification');
    }
  };

  const handleConfirmTransaction = async () => {
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 100) {
      toast.error('Veuillez saisir un montant valide (min 100 FCFA)');
      return;
    }

    toast.loading('Enregistrement de la visite...');
    try {
      const txId = await recordTransaction({
        memberId: memberData.uid || memberData.id || 'demo-member',
        partnerId: 'demo-partner-id',
        partnerName: 'Pullman Hélios',
        amount: amt
      });
      
      toast.dismiss();
      setTxSuccessData({
        txId,
        firstName: memberData.name ? memberData.name.split(' ')[0] : memberData.firstName,
        amount: amt,
        cashback: Math.round(amt * 0.05)
      });
      setTxStep('SUCCESS');
      loadRecentTx();
    } catch (error) {
      toast.dismiss();
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const resetScanner = () => {
    setTxStep('SCAN');
    setMemberData(null);
    setAmount('');
    setTxSuccessData(null);
    setScanInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://ibc.ci/partenaires/parrain/pullman-helios');
    setCopied(true);
    toast.success('Lien de parrainage copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOffer = (id: number) => {
    setOffersList(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
    toast.success("Statut de l'offre mis à jour");
  };

  // Nav Items definition for Partner Sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scanner QR', icon: Scan, badge: 'VALIDATION' },
    { id: 'offres', label: 'Mes offres & avantages', icon: Gift },
    { id: 'campagnes', label: 'Mes campagnes', icon: Megaphone },
    { id: 'avis', label: 'Avis récents', icon: MessageSquare },
    { id: 'performances', label: 'Mes performances', icon: TrendingUp },
    { id: 'parrainage', label: 'Parrainage partenaires', icon: Building },
    { id: 'evenements', label: 'Événements à venir', icon: Calendar },
  ];

  // Sidebar Render Component
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#010f07] border-r border-gold/10 text-white select-none">
      {/* Brand Header */}
      <div className="p-8 flex flex-col items-center border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-3xl font-black text-gold tracking-tighter">IBC</span>
          <Palmtree size={20} className="text-gold" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.45em] text-gold font-bold text-center block">
          ESPACE PARTENAIRE
        </span>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-left group ${
                isActive
                  ? 'bg-green-dark text-white shadow-soft font-semibold border-l-4 border-gold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-gold' : 'text-white/40 group-hover:text-gold/80'}`} />
                <span className="text-[12px] tracking-wide font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-gold text-[#031d0f] text-[7px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-[4px] shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dedicated Support Block */}
      <div className="p-6 border-t border-white/5">
        <div className="rounded-2xl border border-gold/20 bg-white/5 p-4 text-center">
          <HelpCircle size={20} className="text-gold mx-auto block mb-2 animate-pulse" />
          <p className="text-[11px] font-semibold text-white">Support Dédié B2B</p>
          <p className="text-[9px] text-white/50 mt-1 leading-relaxed">Manager : Eric Kouamé</p>
          <button 
            onClick={() => {
              setActiveTab('support');
              setMobileMenuOpen(false);
            }}
            className="mt-3 w-full bg-gold/15 border border-gold text-gold text-[9px] uppercase tracking-widest font-bold py-2 rounded-lg hover:bg-gold hover:text-[#010f07] transition-all duration-300"
          >
            Assistance
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#02170c] text-white font-sans flex overflow-x-hidden">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* ─── MOBILE DRAWER MENU ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/85 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-50"
            >
              <SidebarContent />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-[-48px] w-10 h-10 bg-[#010f07] border-y border-r border-gold/10 text-gold flex items-center justify-center rounded-r-xl"
              >
                <X size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col pb-20">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#010f07]/90 backdrop-blur-md border-b border-gold/10 px-6 py-4 flex items-center justify-between shadow-md">
          {/* Brand header for mobile & breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gold border border-gold/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold text-gold">IBC</span>
              <Palmtree size={13} className="text-gold" />
            </div>
            <div className="hidden lg:block">
              <span className="text-[10px] uppercase tracking-[0.45em] text-white/40 font-bold block leading-none">
                Pullman Hélios
              </span>
              <h2 className="font-serif text-xl font-bold text-gold mt-1.5 flex items-center gap-2">
                Espace Partenaire Agréé <Palmtree size={14} className="inline text-gold align-text-bottom" />
              </h2>
            </div>
          </div>

          {/* Controls & PIN protection toggles */}
          <div className="flex items-center gap-4">
            {/* PIN access lock */}
            <button 
              onClick={() => accessLevel === 'STAFF' ? setShowPinModal(true) : setAccessLevel('STAFF')}
              className={`flex items-center gap-2 border px-2 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                accessLevel === 'OWNER' 
                  ? 'border-gold bg-gold/25 text-gold' 
                  : 'border-white/20 text-white/50 hover:text-white'
              }`}
            >
              {accessLevel === 'OWNER' ? <Unlock size={12} /> : <Lock size={12} />}
              <span className="uppercase tracking-widest text-[9px] hidden sm:inline">
                Mode {accessLevel === 'OWNER' ? 'Propriétaire' : 'Staff'}
              </span>
            </button>

            {/* Logout button */}
            <button 
              onClick={onLogout}
              className="w-9 h-9 rounded-lg border border-gold/20 flex items-center justify-center text-gold hover:bg-red-900/40 hover:text-white hover:border-red-500/50 transition-all"
              title="Se déconnecter"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Access validation modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-6 backdrop-blur-sm">
            <div className="bg-[#02170c] border border-gold p-6 max-w-sm w-full rounded-2xl shadow-premium">
              <h3 className="font-serif text-xl mb-3 text-center text-gold flex items-center justify-center gap-2"><Lock size={18} /> Accès Propriétaire</h3>
              <p className="text-xs text-white/60 mb-5 text-center">Saisissez votre code PIN à 4 chiffres (démo: 1234)</p>
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-black/50 border border-gold/30 text-white p-3 text-center tracking-[1em] font-mono text-2xl mb-6 rounded-xl focus:border-gold outline-none"
                maxLength={4}
                placeholder="••••"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowPinModal(false)} className="flex-1 py-2.5 border border-white/20 text-white rounded-lg hover:bg-white/5 text-xs font-bold uppercase tracking-wider">Annuler</button>
                <button onClick={handlePinSubmit} className="flex-1 py-2.5 bg-gold text-[#010f07] rounded-lg font-bold hover:bg-gold/90 text-xs font-bold uppercase tracking-wider">Valider</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB CONTENTS ─── */}
        <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* ─── TABS ROUTING PANEL ─── */}

          {/* TABS 1: MAIN DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* KPI 1 */}
                <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 shadow-soft relative overflow-hidden group hover:border-gold/35 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Chiffre d'Affaires</span>
                    <DollarSign size={14} className="text-gold" />
                  </div>
                  <h3 className="font-serif text-lg font-black text-white">4 250 000 <span className="text-[10px] font-sans font-bold text-gold">FCFA</span></h3>
                </div>

                {/* KPI 2 */}
                <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 shadow-soft relative overflow-hidden group hover:border-gold/35 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Visites</span>
                    <Scan size={14} className="text-gold" />
                  </div>
                  <h3 className="font-serif text-lg font-black text-white">128 <span className="text-[10px] font-sans font-bold text-gold">Membres</span></h3>
                </div>

                {/* KPI 3 */}
                <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 shadow-soft relative overflow-hidden group hover:border-gold/35 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Nouveaux Clients</span>
                    <Users size={14} className="text-gold" />
                  </div>
                  <h3 className="font-serif text-lg font-black text-white">42 <span className="text-[10px] font-sans font-bold text-gold">Membres</span></h3>
                </div>

                {/* KPI 4 */}
                <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 shadow-soft relative overflow-hidden group hover:border-gold/35 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Note Moyenne</span>
                    <Star size={14} className="text-gold" fill="currentColor" />
                  </div>
                  <h3 className="font-serif text-lg font-black text-white">4.8 <span className="text-[10px] font-sans text-white/40">/ 5.0</span></h3>
                </div>
                
                {/* KPI 5 */}
                <div className="bg-white/5 border border-gold/15 rounded-2xl p-4 shadow-soft relative overflow-hidden group hover:border-gold/35 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Fidélisation</span>
                    <Activity size={14} className="text-gold" />
                  </div>
                  <h3 className="font-serif text-lg font-black text-white">74% <span className="text-[10px] font-sans text-green-400">Taux</span></h3>
                </div>
              </div>

              {/* Main Content Dashboard Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Column Left (2/3 width on xl) */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* ROW 1: Chart and Repartition */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Performances Area Chart Card */}
                    <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <div>
                          <h4 className="font-serif text-lg text-gold">Évolution des transactions</h4>
                          <p className="text-xs text-white/50 mt-1">Sur les 30 derniers jours</p>
                        </div>
                      </div>
                      <div className="relative">
                        <svg viewBox="0 0 500 150" className="w-full h-32 mt-2">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.4"/>
                              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          <path d="M0,130 Q50,90 100,110 T200,60 T300,80 T400,30 T500,50 L500,150 L0,150 Z" fill="url(#chartGrad)"/>
                          <path d="M0,130 Q50,90 100,110 T200,60 T300,80 T400,30 T500,50" fill="none" stroke="#C9A84C" strokeWidth="2.5"/>
                          <circle cx="100" cy="110" r="3.5" fill="#C9A84C" />
                          <circle cx="200" cy="60" r="3.5" fill="#C9A84C" />
                          <circle cx="300" cy="80" r="3.5" fill="#C9A84C" />
                          <circle cx="400" cy="30" r="3.5" fill="#C9A84C" />
                          <circle cx="500" cy="50" r="3.5" fill="#C9A84C" className="animate-ping" />
                        </svg>
                      </div>
                    </div>

                    {/* Répartition des transactions */}
                    <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <h4 className="font-serif text-lg text-gold">Répartition par catégorie</h4>
                        <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Mai</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
                        {/* Donut SVG Chart */}
                        <div className="relative shrink-0">
                          <svg width="120" height="120" viewBox="0 0 160 160">
                            {/* Restauration 45% */}
                            <circle cx="80" cy="80" r="60" fill="none" stroke="#C9A84C" strokeWidth="24"
                              strokeDasharray="169.6 376.8" strokeDashoffset="94.2" />
                            {/* Hébergement 35% */}
                            <circle cx="80" cy="80" r="60" fill="none" stroke="#8C6239" strokeWidth="24"
                              strokeDasharray="131.9 414.5" strokeDashoffset="-75.4" />
                            {/* Loisirs 20% */}
                            <circle cx="80" cy="80" r="60" fill="none" stroke="#4a3b22" strokeWidth="24"
                              strokeDasharray="75.4 471.0" strokeDashoffset="-207.3" />
                            {/* Cercle central foncé */}
                            <circle cx="80" cy="80" r="48" fill="#010a04" />
                            <text x="80" y="85" textAnchor="middle" style={{fontFamily:'serif', fontWeight:700, fontSize:16, fill:'#C9A84C'}}>CA</text>
                          </svg>
                        </div>

                        {/* Légende */}
                        <div className="flex-1 space-y-3 w-full">
                          {[
                            { label: 'Restauration', pct: 45, color: '#C9A84C' },
                            { label: 'Hébergement', pct: 35, color: '#8C6239' },
                            { label: 'Loisirs & Spa', pct: 20, color: '#4a3b22' },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                                <span className="text-[10px] text-white/80">{item.label}</span>
                              </div>
                              <span className="text-[10px] font-bold text-white">{item.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROW 2: Offers & Campaigns side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Offers Block */}
                    <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                          <h4 className="font-serif text-gold text-sm uppercase tracking-wider">Mes offres & avantages</h4>
                          <button onClick={() => setActiveTab('offres')} className="text-[9px] font-bold text-white/40 hover:text-gold uppercase tracking-wider">Gérer</button>
                        </div>
                        <div className="space-y-3">
                          {offersList.slice(0, 2).map((off) => (
                            <div key={off.id} className="flex justify-between items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                  <span className="text-[10px] font-bold text-white">{off.title}</span>
                                </div>
                                <p className="text-[9px] text-white/55 mt-1 leading-snug">{off.description}</p>
                              </div>
                              <span className="text-[7px] border border-gold/30 text-gold px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">{off.badge}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('offres')}
                        className="mt-4 w-full bg-gold/10 border border-gold/30 py-2.5 rounded-xl text-center text-gold hover:bg-gold hover:text-[#010f07] transition-all font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1"
                      >
                        <Plus size={10} /> Créer une offre
                      </button>
                    </div>

                    {/* Marketing Campaigns Block */}
                    <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                          <h4 className="font-serif text-gold text-sm uppercase tracking-wider">Mes campagnes</h4>
                          <button onClick={() => setActiveTab('campagnes')} className="text-[9px] font-bold text-white/40 hover:text-gold uppercase tracking-wider">Voir tout</button>
                        </div>
                        <div className="space-y-3">
                          {campaigns.slice(0, 2).map((camp) => (
                            <div key={camp.id} className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-white">{camp.title}</span>
                                <span className={`text-[7px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${camp.status === 'Envoyée' ? 'bg-green-500/20 text-green-400' : 'bg-gold/20 text-gold'}`}>{camp.status}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-[9px] text-white/50">
                                <div>Cible : <strong className="text-white">{camp.reach}</strong></div>
                                <div>Taux ouv. : <strong className="text-green-400">{camp.openRate}</strong></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('campagnes')}
                        className="mt-4 w-full bg-white/5 border border-white/10 py-2.5 rounded-xl text-center text-white/80 hover:bg-white/10 hover:text-white transition-all font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1"
                      >
                        Lancer une campagne →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column Right (1/3 width on xl) */}
                <div className="space-y-6">
                  
                  {/* Validation Scan CTA Card */}
                  <div className="bg-gradient-to-br from-green-dark to-[#010a04] border border-gold rounded-3xl p-6 shadow-premium text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto shadow-inner text-gold">
                      <Scan size={32} className="animate-pulse" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-serif text-lg text-white">Validation Visite</h4>
                      <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1">Créditer le Cashback membre</p>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('scanner');
                        resetScanner();
                      }}
                      className="w-full bg-gold text-[#010f07] hover:bg-gold/90 font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2"
                    >
                      Scanner ou Saisir ID <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Répartition des transactions */}
                  <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                      <h4 className="font-serif text-gold text-sm uppercase tracking-wider">RÉPARTITION DES TRANSACTIONS</h4>
                      <select className="text-[8px] font-bold text-white/40 bg-transparent border border-white/10 rounded px-2 py-1 outline-none focus:border-gold uppercase tracking-wider cursor-pointer">
                        <option className="bg-[#02170c] text-white">Par catégorie</option>
                        <option className="bg-[#02170c] text-white">Par établissement</option>
                        <option className="bg-[#02170c] text-white">Par mois</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
                      {/* Donut SVG Chart */}
                      <div className="relative shrink-0">
                        <svg width="140" height="140" viewBox="0 0 160 160">
                          {/* Restauration 45% — or */}
                          <circle cx="80" cy="80" r="60" fill="none" stroke="#C9A84C" strokeWidth="24"
                            strokeDasharray="169.6 376.8" strokeDashoffset="94.2" />
                          {/* Boissons 25% — bronze */}
                          <circle cx="80" cy="80" r="60" fill="none" stroke="#8C6239" strokeWidth="24"
                            strokeDasharray="94.2 452.2" strokeDashoffset="-75.4" />
                          {/* Location & transats 15% — vert clair */}
                          <circle cx="80" cy="80" r="60" fill="none" stroke="#2D7A4F" strokeWidth="24"
                            strokeDasharray="56.5 489.9" strokeDashoffset="-169.6" />
                          {/* Activités 10% — or clair */}
                          <circle cx="80" cy="80" r="60" fill="none" stroke="#D4AF37" strokeWidth="24"
                            strokeDasharray="37.7 508.7" strokeDashoffset="-226.1" />
                          {/* Autres 5% — gris */}
                          <circle cx="80" cy="80" r="60" fill="none" stroke="#4a3b22" strokeWidth="24"
                            strokeDasharray="18.8 527.6" strokeDashoffset="-263.9" />
                          {/* Cercle central foncé */}
                          <circle cx="80" cy="80" r="48" fill="#010a04" />
                          <text x="80" y="85" textAnchor="middle" style={{fontFamily:'serif', fontWeight:700, fontSize:15, fill:'#C9A84C'}}>Mois</text>
                        </svg>
                      </div>

                      {/* Légende */}
                      <div className="flex-1 space-y-2.5 w-full">
                        {[
                          { label: 'Restauration', pct: 45, color: '#C9A84C' },
                          { label: 'Boissons', pct: 25, color: '#8C6239' },
                          { label: 'Location & transats', pct: 15, color: '#2D7A4F' },
                          { label: 'Activités', pct: 10, color: '#D4AF37' },
                          { label: 'Autres', pct: 5, color: '#4a3b22' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                              <span className="text-[10px] text-white/80">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white">{item.pct}%</span>
                          </div>
                        ))}
                        <button
                          onClick={() => toast('Détail des catégories bientôt disponible !')}
                          className="mt-2 w-full text-[9px] font-bold text-gold hover:text-white uppercase tracking-widest flex items-center justify-center gap-1 transition-colors border-t border-white/5 pt-3"
                        >
                          Voir le détail des catégories →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Reviews Block */}
                  <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                      <h4 className="font-serif text-gold text-sm uppercase tracking-wider">Avis récents</h4>
                      <button onClick={() => setActiveTab('avis')} className="text-[9px] font-bold text-white/40 hover:text-gold uppercase tracking-wider">Avis complets</button>
                    </div>
                    <div className="space-y-3">
                      {reviews.slice(0, 2).map((rev) => (
                        <div key={rev.id} className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white">{rev.author}</span>
                            <div className="flex gap-0.5 text-[8px] text-gold">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} size={8} fill="currentColor" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[9px] text-white/70 italic mt-1.5 line-clamp-2 leading-relaxed">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TABS 2: SCANNER & TRANSACTION VALIDATOR */}
          {activeTab === 'scanner' && (
            <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div>
                  <h3 className="font-serif text-2xl text-gold">Scanner QR Code</h3>
                  <p className="text-xs text-white/55">Enregistrer une facture et créditer le membre</p>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white text-green-dark p-6 sm:p-10 border border-gold shadow-premium text-center relative overflow-hidden rounded-3xl"
              >
                {txStep === 'SCAN' && (
                  <>
                    {scanning && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-gold z-10 shadow-[0_0_15px_gold]"
                      />
                    )}
                    
                    <div className="mb-8 flex justify-center">
                      <div 
                        className="w-32 h-32 border-4 border-dashed border-gold flex items-center justify-center relative cursor-pointer hover:bg-gold/5 transition-colors" 
                        onClick={() => handleScan()}
                        title="Simuler un scan de QR Code"
                      >
                        <div className="absolute inset-2 border-2 border-green-dark/10" />
                        <Scan size={60} className={`text-gold transition-all duration-1000 ${scanning ? 'scale-110 opacity-50' : ''}`} />
                      </div>
                    </div>
                    <h4 className="font-serif text-2xl mb-2 text-[#031d0f]">Saisie ou Scan Membre</h4>
                    <p className="text-[10px] text-text-muted mb-8 uppercase tracking-[0.2em] font-bold">Scanner ou entrer l'ID du membre IBC</p>
                    
                    <div className="flex gap-2 max-w-md mx-auto">
                      <input 
                        type="text" 
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        placeholder="Ex: Yao Kouassi ou ID membre" 
                        className="flex-1 bg-gray-50 border border-gray-300 p-3.5 text-sm focus:border-gold outline-none text-green-dark rounded-xl font-medium"
                      />
                      <button 
                        onClick={() => handleScan(scanInput)}
                        disabled={scanning}
                        className={`bg-gold text-[#010f07] px-6 font-bold tracking-widest text-[10px] uppercase rounded-xl hover:bg-gold/90 transition-all ${scanning ? 'opacity-50' : ''}`}
                      >
                        Identifier
                      </button>
                    </div>
                    <p className="text-[9px] text-text-muted mt-3 italic">Pour la démo, vous pouvez entrer n'importe quel nom et le niveau souhaité (ex: Yao Kouassi ou IBC-MEMBER-Yao_Kouassi-OR-demo)</p>
                  </>
                )}

                {txStep === 'AMOUNT' && memberData && (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <MemberIdentityCard memberData={memberData} />
                    
                    <div className="mt-8 text-left max-w-sm mx-auto">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-green-dark mb-2">Montant total de la facture (FCFA)</label>
                      <input 
                        type="number" 
                        min="100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gold/30 p-4 text-2xl font-mono text-green-dark text-center focus:border-gold outline-none rounded-xl"
                        placeholder="Saisir montant"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-4 mt-8 max-w-sm mx-auto">
                      <button 
                        onClick={resetScanner}
                        className="flex-1 py-3.5 border border-red-500 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={handleConfirmTransaction}
                        className="flex-2 py-3.5 bg-gold text-[#010f07] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-colors shadow-lg"
                      >
                        Valider transaction
                      </button>
                    </div>
                  </div>
                )}

                {txStep === 'SUCCESS' && txSuccessData && (
                  <div className="animate-in fade-in zoom-in duration-500 py-4 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={36} className="text-green-600" />
                    </div>
                    <h4 className="font-serif text-2xl mb-1 text-green-950 font-black">Visite Enregistrée</h4>
                    <p className="text-xs text-text-muted mb-6">Transaction en attente de validation par IBC. Le cashback sera crédité au membre une fois confirmée.</p>
                    
                    <div className="bg-[#FAF5E9] border border-gold/25 p-5 my-6 rounded-2xl text-left max-w-sm mx-auto space-y-3 text-[#031d0f]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted">Montant Facture :</span>
                        <strong className="font-mono text-sm">{txSuccessData.amount} FCFA</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-gold/10 pt-2.5">
                        <span className="text-text-muted">Cashback {txSuccessData.firstName} :</span>
                        <strong className="font-mono text-sm text-green-700">+{txSuccessData.cashback} FCFA</strong>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-text-muted border-t border-gold/10 pt-2">
                        <span>N° Transaction :</span>
                        <span className="font-mono">{txSuccessData.txId?.slice(0, 12)}...</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={resetScanner}
                      className="bg-gold text-[#010f07] px-6 py-3 rounded-xl font-bold tracking-widest text-[10px] uppercase hover:bg-gold/90 transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                      <span>Nouvelle opération</span>
                      <Scan size={14} />
                    </button>
                  </div>
                )}
              </motion.div>

            </div>
          )}

          {/* TABS 3: OFFERS & PRIVILEGES */}
          {activeTab === 'offres' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-gold">Offres & Privilèges Actifs</h3>
                  <p className="text-xs text-white/55 mt-1">Configurez les avantages exclusifs offerts aux membres du club.</p>
                </div>
                <button 
                  onClick={() => toast.success("Module d'édition d'offre (Démo)")}
                  className="bg-gold text-[#010f07] hover:bg-gold/90 font-bold px-5 py-2.5 rounded-xl uppercase tracking-widest text-[9px] flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <Plus size={12} /> Nouvelle Offre
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offersList.map((off) => (
                  <div key={off.id} className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft flex flex-col justify-between relative overflow-hidden group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-gold/10 border border-gold/20 text-gold text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {off.badge}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] font-bold ${off.active ? 'text-green-400' : 'text-white/40'}`}>
                            {off.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-serif text-lg text-white font-bold mb-2">{off.title}</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed mb-6">{off.description}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                      <span className="text-[10px] text-white/40">Statut :</span>
                      <button 
                        onClick={() => toggleOffer(off.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          off.active ? 'bg-gold' : 'bg-white/10'
                        }`}
                      >
                        <span 
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            off.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABS 4: PUSH MARKETING CAMPAIGNS */}
          {activeTab === 'campagnes' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-gold">Campagnes Marketing Push</h3>
                  <p className="text-xs text-white/55 mt-1">Diffusez des offres flash ou des invitations spéciales directement sur le smartphone des membres.</p>
                </div>
                <button 
                  onClick={() => toast.success("Lancement d'assistant de campagne (Démo)")}
                  className="bg-gold text-[#010f07] hover:bg-gold/90 font-bold px-5 py-2.5 rounded-xl uppercase tracking-widest text-[9px] flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <Plus size={12} /> Nouvelle Campagne
                </button>
              </div>

              <div className="space-y-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-white/5 border border-gold/15 rounded-2xl p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gold/25 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base font-bold text-white">{camp.title}</h4>
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          camp.status === 'Envoyée' ? 'bg-green-500/20 text-green-400' : 'bg-gold/25 text-gold'
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/55">Cible : <strong className="text-white">{camp.target}</strong> • Envoi : {camp.date}</p>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:items-center gap-8 text-left md:text-right border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Membres Visés</p>
                        <p className="font-serif text-sm font-bold text-white mt-0.5">{camp.reach}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Taux d'Ouverture</p>
                        <p className="font-serif text-sm font-bold text-green-400 mt-0.5">{camp.openRate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABS 5: CLIENT REVIEWS */}
          {activeTab === 'avis' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h3 className="font-serif text-2xl text-gold">Avis & Retours Clients</h3>
                <p className="text-xs text-white/55 mt-1">Consultez les commentaires laissés par les membres d'IVOIRE BUSINESS CLUB.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-white text-sm">{rev.author}</span>
                          <span className="border border-gold/25 text-gold text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Niveau {rev.tier}
                          </span>
                        </div>
                        <div className="flex gap-0.5 text-gold">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={10} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-white/70 italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-white/45 mt-6 border-t border-white/5 pt-3">
                      <span>{rev.date}</span>
                      <button 
                        onClick={() => toast.success("Ouverture de l'assistant de réponse (Démo)")}
                        className="text-gold hover:underline text-[9px] font-bold uppercase tracking-wider"
                      >
                        Répondre →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABS 6: DETAILED PERFORMANCE ANALYTICS */}
          {activeTab === 'performances' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h3 className="font-serif text-2xl text-gold">Analyses de Performances</h3>
                <p className="text-xs text-white/55 mt-1">Statistiques et rapports financiers pour Pullman Hélios.</p>
              </div>

              {/* Grid of detailed analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual graphics left panel */}
                <div className="lg:col-span-2 bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h4 className="font-serif text-white">Chiffre d'Affaires Mensuel (Historique)</h4>
                    <span className="text-xs text-gold font-mono font-bold">Année 2026</span>
                  </div>
                  
                  {/* Detailed monthly chart */}
                  <div className="h-44 flex items-end justify-between gap-4 pt-8">
                    {[
                      { m: 'Jan', val: '2.8M', h: '60%' },
                      { m: 'Fév', val: '3.1M', h: '68%' },
                      { m: 'Mar', val: '3.5M', h: '78%' },
                      { m: 'Avr', val: '3.9M', h: '88%' },
                      { m: 'Mai', val: '4.2M', h: '95%' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[9px] font-mono text-gold">{bar.val}</span>
                        <div 
                          className="w-full bg-gradient-to-t from-gold/40 to-gold rounded-t-lg transition-all duration-1000 ease-out" 
                          style={{ height: bar.h }}
                        />
                        <span className="text-[10px] text-white/40 mt-1">{bar.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytical recap right panel */}
                <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft space-y-6">
                  <h4 className="font-serif text-gold border-b border-white/5 pb-3">Statistiques Clés</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/50">Panier Moyen :</span>
                      <strong className="font-mono text-white">33 203 FCFA</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                      <span className="text-white/50">Visiteurs Gold :</span>
                      <strong className="font-mono text-white">42 membres (33%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                      <span className="text-white/50">Visiteurs Platinum :</span>
                      <strong className="font-mono text-white">22 membres (17%)</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                      <span className="text-white/50">Taux de fidélisation :</span>
                      <strong className="font-mono text-green-400">74%</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Full list of transactions */}
              <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft">
                <h4 className="font-serif text-white border-b border-white/5 pb-4 mb-4">Journal Complet des Visites</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 font-bold uppercase tracking-wider">
                        <th className="pb-3">ID Transaction</th>
                        <th className="pb-3">ID Membre</th>
                        <th className="pb-3">Date & Heure</th>
                        <th className="pb-3 text-right">Montant Facture</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {recentTx.map((tx, idx) => (
                        <tr key={tx.id || idx} className="text-white/80 hover:text-white">
                          <td className="py-3 font-mono text-[10px] text-white/50">{tx.id?.slice(0, 12) || `TX-MOCK-${idx}`}</td>
                          <td className="py-3 font-mono">{tx.memberId?.slice(0, 12) || 'IBC-MEM-Yao'}</td>
                          <td className="py-3 text-white/50">{tx.date}</td>
                          <td className="py-3 text-right font-mono text-gold font-bold">{tx.amount} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TABS 7: B2B PARTNER REFERRAL */}
          {activeTab === 'parrainage' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* Header section with layout overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-serif text-2xl text-gold">Parrainage B2B Partenaires</h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Devenez ambassadeur d'IVOIRE BUSINESS CLUB ! Invitez d'autres établissements haut de gamme à rejoindre le réseau et touchez des commissions sur leur volume d'affaires.
                  </p>
                </div>
                <div className="bg-white/5 border border-gold/15 p-5 rounded-2xl flex items-center justify-between shadow-soft">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Commissions Totales</span>
                    <h3 className="font-serif text-xl font-bold text-gold mt-1">25 000 FCFA</h3>
                  </div>
                  <Award size={36} className="text-gold" />
                </div>
              </div>

              {/* Referral Widget widget */}
              <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <h4 className="font-serif text-white font-bold">Lien de parrainage Pullman Hélios</h4>
                  <p className="text-xs text-white/55">Partagez ce lien unique avec les commerces de luxe de vos cercles d'affaires.</p>
                  
                  <div className="flex items-center justify-between bg-black/40 border border-gold/25 rounded-xl px-4 py-3 text-xs font-mono text-gold">
                    <span className="truncate">https://ibc.ci/partenaires/parrain/pullman-helios</span>
                    <button 
                      onClick={handleCopyLink}
                      className="text-gold hover:text-white transition-colors p-1"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 space-y-3">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Comment ça marche ?</h5>
                  <ul className="space-y-2 text-[11px] text-white/60 list-disc list-inside">
                    <li>Copiez et partagez votre lien exclusif.</li>
                    <li>Le nouveau partenaire s'inscrit en ligne.</li>
                    <li>À l'activation, recevez <strong>25 000 FCFA</strong> de bienvenue.</li>
                    <li>Gagnez des bonus d'apport d'affaires sur chaque adhésion parrainée.</li>
                  </ul>
                </div>
              </div>

              {/* Referred Partners Table */}
              <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft">
                <h4 className="font-serif text-white border-b border-white/5 pb-4 mb-4">Établissements Parrainés</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 font-bold uppercase tracking-wider">
                        <th className="pb-3">Nom Commerce</th>
                        <th className="pb-3">Catégorie</th>
                        <th className="pb-3">Statut Dossier</th>
                        <th className="pb-3 text-right">Commissions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {partnerReferrals.map((partner) => (
                        <tr key={partner.id} className="text-white/80">
                          <td className="py-3 font-serif text-white font-bold">{partner.businessName}</td>
                          <td className="py-3 text-white/50">{partner.category}</td>
                          <td className="py-3">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              partner.status === 'Actif' ? 'bg-green-500/20 text-green-400' : 'bg-gold/20 text-gold'
                            }`}>
                              {partner.status}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono text-gold font-bold">{partner.bonusEarned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TABS 8: IBC EVENTS */}
          {activeTab === 'evenements' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div>
                <h3 className="font-serif text-2xl text-gold">Événements de Réseau IBC</h3>
                <p className="text-xs text-white/55 mt-1">Participez aux soirées privées, sommets et sessions de networking réservés aux partenaires.</p>
              </div>

              <div className="space-y-6">
                {events.map((ev) => (
                  <div key={ev.id} className="bg-white/5 border border-gold/15 rounded-3xl p-6 shadow-soft flex flex-col md:flex-row gap-6 hover:border-gold/25 transition-colors">
                    <div className="w-full md:w-48 h-32 bg-gradient-to-br from-gold/10 to-gold/30 rounded-2xl flex items-center justify-center text-gold shrink-0 border border-gold/10">
                      <Calendar size={48} className="opacity-40" />
                    </div>

                    <div className="flex-1 space-y-3 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold">{ev.date}</span>
                        <h4 className="font-serif text-lg font-bold text-white">{ev.title}</h4>
                        <p className="text-xs text-white/50 flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> <span>{ev.location}</span></p>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">{ev.description}</p>
                      <button 
                        onClick={() => toast.success("Confirmation de présence envoyée !")}
                        className="bg-gold/10 border border-gold/30 text-gold px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest font-bold hover:bg-gold hover:text-[#010f07] transition-all flex items-center gap-1 mt-2"
                      >
                        Confirmer ma présence
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABS 9: PARTNER SUPPORT & CONTACT */}
          {activeTab === 'support' && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div>
                  <h3 className="font-serif text-2xl text-gold">Assistance & Support</h3>
                  <p className="text-xs text-white/55">Contactez l'équipe d'administration du Club</p>
                </div>
              </div>

              <div className="bg-white/5 border border-gold/15 rounded-3xl p-6 sm:p-8 shadow-soft text-center space-y-6">
                
                <div className="w-20 h-20 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center mx-auto text-gold">
                  <HelpCircle size={40} />
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-lg text-white font-bold">Votre Manager Dédié</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Pour toute question technique, modification de contrat ou soumission de campagne push, contactez directement Eric :
                  </p>
                </div>

                <div className="bg-black/30 border border-white/5 p-4 rounded-2xl max-w-sm mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">Nom :</span>
                    <strong className="text-white">Eric Kouamé</strong>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-white/40">Téléphone :</span>
                    <strong className="text-gold">+225 07 45 45 45 45</strong>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-white/40">E-mail :</span>
                    <strong className="text-gold">partners@ivoirebusinessclub.com</strong>
                  </div>
                </div>

                <div className="flex gap-4 max-w-sm mx-auto">
                  <button 
                    onClick={() => toast('Support joignable sur WhatsApp au +225 0745454545')}
                    className="flex-1 py-3 bg-[#25D366] text-white rounded-xl text-[9px] uppercase tracking-widest font-extrabold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                  >
                    WhatsApp B2B
                  </button>
                  <button 
                    onClick={() => toast('Lancement de votre application e-mail...')}
                    className="flex-1 py-3 bg-gold text-[#010f07] rounded-xl text-[9px] uppercase tracking-widest font-extrabold hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5"
                  >
                    Envoyer un E-mail
                  </button>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
};
