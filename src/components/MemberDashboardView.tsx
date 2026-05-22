import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard, Star, CreditCard, Wallet, TrendingUp,
  Banknote, Users, Gift, MapPin, Compass, User, Settings,
  LogOut, Bell, ChevronRight, ChevronDown, Copy, Check,
  HelpCircle, X, Menu, ArrowRight, Shield, Award, Calendar,
  Sparkles, Crown, BadgePercent, MessageSquare, Info
} from 'lucide-react';
import type { Member, Transaction, Offer } from '../lib/mock-api';
import { getMemberTransactions } from '../lib/transaction.service';
import { getReferralStats, getMemberReferrals } from '../lib/referral.service';
import type { Referral, ReferralStats } from '../lib/referral.service';
import ibcLogo from '../assets/ibc-logo.png';

interface MemberDashboardViewProps {
  user: Member;
  onLogout: () => void;
}

const formatPrice = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const MemberDashboardView: React.FC<MemberDashboardViewProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTxs, setIsLoadingTxs] = useState<boolean>(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState<boolean>(true);

  // Fetch transactions and referrals on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingTxs(true);
        const data = await getMemberTransactions(user.uid, 15);
        setTransactions(data);
      } catch (e) {
        console.error('Failed to load transactions:', e);
      } finally {
        setIsLoadingTxs(false);
      }

      try {
        setIsLoadingReferrals(true);
        const stats = await getReferralStats(user.uid, user.name || 'Yao K.');
        const list = await getMemberReferrals(user.uid);
        setReferralStats(stats);
        setReferrals(list);
      } catch (e) {
        console.error('Failed to load referrals:', e);
      } finally {
        setIsLoadingReferrals(false);
      }
    };
    fetchData();
  }, [user.uid, user.name]);

  // Derived calculations with fallback to match Yao K. screenshots
  const displayName = user.name || 'Yao K.';
  const balance = user.balance || 12500;
  const totalSpent = user.totalSpent || 245000;
  const visitsThisMonth = user.visitsThisMonth || 12;
  
  const avatarUrl = user.photoURL || (displayName.includes('Yao') 
    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1B3A2D&color=C9A84C`);
  
  const confirmedCashback = Math.floor(balance * 0.816) || 10200;
  const bonusCashback = balance - confirmedCashback || 2300;
  const goalTarget = 50000;
  const currentGoalProgress = 31000; // Matches screenshot Yao K.
  const goalProgressPercentage = Math.round((currentGoalProgress / goalTarget) * 100); // 62%
  const savingsBalance = 7800; // Matches Épargne active screenshot
  
  // Dynamic referral stats from the service
  const refereeCount = referralStats?.refereeCount ?? 5;
  const referralBonus = referralStats?.referralBonus ?? 2500;
  const referralLink = referralStats?.referralLink ?? `https://ibc.ci/parrain/${displayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '')}`;
  
  const memberPoints = 9450; // Points mock pour compatibilité
  // Pouvoir d'achat moyen mensuel pour évolution de statut
  const spendingLevel = 28000; // FCFA — tranche Bronze: 10k–40k
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Lien de parrainage copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  // Nav Items definition matching screenshot sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'privileges', label: 'Mes privilèges', icon: Star },
    { id: 'transactions', label: 'Mes transactions', icon: CreditCard },
    { id: 'cagnotte', label: 'Ma cagnotte', icon: Wallet },
    { id: 'objectifs', label: 'Mes objectifs', icon: TrendingUp },
    { id: 'epargne', label: 'Épargne Club', icon: Banknote },
    { id: 'cercle', label: 'Cercle Évasion', icon: Users },
    { id: 'parrainage', label: 'Parrainage', icon: Gift, badge: 'NOUVEAU' },
    { id: 'etablissements', label: 'Mes établissements', icon: MapPin },
    { id: 'experiences', label: 'Mes expériences', icon: Compass },
    { id: 'profil', label: 'Mon profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // Upcoming experiences with actual visual images matching dashboard design
  const experiences = [
    {
      id: 1,
      title: 'Sunset Lounge',
      date: 'Vendredi 24 Mai • 18h00',
      location: 'Abidjan, Cocody',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 2,
      title: 'Brunch & Chill',
      date: 'Dimanche 26 Mai • 11h00',
      location: 'Bingerville',
      imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 3,
      title: 'Weekend Assinie',
      date: '1er - 2 Juin • 2 jours',
      location: 'Assinie',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=200'
    }
  ];

  // Carousel of recommended offers at the bottom
  const recommendations = [
    { id: 1, name: 'La Plage', location: 'Grand-Bassam', discount: '-20%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300' },
    { id: 2, name: 'Azar Club', location: 'Cocody', discount: '-15%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=300' },
    { id: 3, name: 'Hôtel Tiama', location: 'Marcory', discount: '-25%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=300' },
    { id: 4, name: 'Assinie Lodge', location: 'Assinie', discount: '-20%', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=300' }
  ];

  // Sidebar Render Component
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#031d0f] border-r border-gold/10 text-white select-none">
      {/* Brand Header */}
      <div className="p-8 flex flex-col items-center border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-3xl font-black text-gold tracking-tighter">IBC</span>
          <PalmtreeIcon className="w-8 h-8 text-gold animate-bounce" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.45em] text-gold font-bold text-center block">
          Ivoire Business Club
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
                <span className="bg-[#C9A84C] text-[#031d0f] text-[7px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-[4px] shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer / Contact Support */}
      <div className="p-6 border-t border-white/5">
        <div className="rounded-2xl border border-gold/20 bg-white/5 p-4 text-center">
          <HelpCircle size={20} className="text-gold mx-auto mb-2 animate-pulse" />
          <p className="text-[11px] font-semibold text-white">Besoin d'aide ?</p>
          <p className="text-[9px] text-white/50 mt-1 leading-relaxed">Notre équipe est à votre écoute</p>
          <button 
            onClick={() => toast('Support accessible par WhatsApp ou téléphone au +225 0707070707', { icon: '📞' })}
            className="mt-3 w-full bg-gold/15 border border-gold text-gold text-[9px] uppercase tracking-widest font-bold py-2 rounded-lg hover:bg-gold hover:text-green-darker transition-all duration-300"
          >
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream font-sans flex text-text overflow-x-hidden">
      
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
              className="lg:hidden fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 z-50 shadow-premium"
            >
              <SidebarContent />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-[-48px] w-10 h-10 bg-[#031d0f] border-y border-r border-gold/10 text-gold flex items-center justify-center rounded-r-xl"
              >
                <X size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gold/10 px-6 py-4 flex items-center justify-between shadow-sm select-none">
          {/* Mobile Hamburguer */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-green-dark border border-gold/20 rounded-lg bg-cream/30 hover:bg-cream transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold text-green-dark">IBC</span>
              <span className="text-gold text-xs font-serif">🌴</span>
            </div>
            <div className="hidden lg:block">
              <span className="text-[10px] uppercase tracking-[0.45em] text-text-muted font-bold block leading-none">
                Bonjour
              </span>
              <h2 className="font-serif text-xl font-bold text-green-dark mt-1">
                Bienvenue dans votre univers IBC <span className="text-gold">🌴</span>
              </h2>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Bronze Badge */}
            <div className="flex items-center gap-2 border border-gold/20 bg-[#FAF5E9] px-4 py-1.5 rounded-full text-xs">
              <div className="w-5 h-5 rounded-full bg-[#8C6239] flex items-center justify-center text-white border border-gold/20">
                <Star size={10} fill="currentColor" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[9px] uppercase tracking-wider text-[#8C6239] font-bold">NIVEAU BRONZE</p>
                <p className="text-[8px] text-text-muted">Discovery Member</p>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setProfileDropdownOpen(false);
                }}
                className="w-10 h-10 border border-gold/20 rounded-full flex items-center justify-center text-green-dark hover:bg-cream/40 transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gold border-2 border-white rounded-full animate-ping" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gold border-2 border-white rounded-full" />
              </button>
              
              {/* Fake Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-gold/15 rounded-2xl shadow-premium p-4 z-50 text-left"
                  >
                    <h4 className="font-serif font-bold text-green-dark border-b border-gold/10 pb-2 mb-3">Notifications (2)</h4>
                    <div className="space-y-3">
                      <div className="p-2.5 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border-l-2 border-gold">
                        <p className="text-xs font-bold text-green-dark">🎉 Bienvenue dans le club IBC</p>
                        <p className="text-[10px] text-text-muted mt-1 leading-snug">Profitez dès maintenant de vos 3% de cashback Bronze chez tous nos partenaires.</p>
                      </div>
                      <div className="p-2.5 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border-l-2 border-green-dark">
                        <p className="text-xs font-bold text-green-dark">🌟 Avantage parrainage actif</p>
                        <p className="text-[10px] text-text-muted mt-1 leading-snug">Parrainez vos proches et gagnez 2 500 FCFA sur leur adhésion.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 border border-gold/20 rounded-full p-1.5 pl-3 hover:bg-cream/40 transition-all select-none"
              >
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full border border-gold/20 object-cover"
                />
                <span className="text-xs font-semibold text-green-dark hidden sm:inline">{displayName}</span>
                <ChevronDown size={14} className="text-green-dark" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-gold/15 rounded-2xl shadow-premium py-2 z-50 text-left select-none"
                  >
                    <div className="px-4 py-3 border-b border-gold/10">
                      <p className="text-xs font-bold text-green-dark leading-none">{displayName}</p>
                      <p className="text-[10px] text-text-muted mt-1 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('profil');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-text hover:bg-cream/40 transition-colors"
                    >
                      <User size={14} className="text-gold" />
                      <span>Mon Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-text hover:bg-cream/40 transition-colors"
                    >
                      <Settings size={14} className="text-gold" />
                      <span>Paramètres</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-gold/10"
                    >
                      <LogOut size={14} />
                      <span>Se déconnecter</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ─── DYNAMIC TABS ROUTER ─── */}
        <main className="flex-1 p-6 md:p-8 space-y-8 select-none">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* ─── ROW 1: CORE GRID (3 CARDS) ─── */}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1.1fr]">
                
                {/* CARD 1: MON COMPTE CASHBACK (DARK GREEN PREMIUM) */}
                <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1B5E35] to-[#0A2E18] p-8 text-white border border-gold/25 shadow-gold group min-h-[260px] flex flex-col justify-between">
                  {/* Palm Tree Glowing Vector Overlay */}
                  <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none group-hover:opacity-25 transition-opacity duration-500 overflow-hidden">
                    <span className="text-9xl absolute right-[-20px] bottom-[-20px] filter blur-[1px]">🌴</span>
                  </div>
                  
                  {/* Top Line */}
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.45em] text-gold font-bold">
                        MON COMPTE CASHBACK IBC
                      </p>
                      <p className="text-[10px] text-white/60 mt-1 leading-snug">
                        Votre cashback augmente avec votre niveau
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gold shadow-lg backdrop-blur-md">
                      <Wallet size={18} />
                    </div>
                  </div>

                  {/* Solde FCFA */}
                  <div className="my-4 relative z-10">
                    <span className="font-serif text-6xl font-extrabold tracking-tight">
                      {formatPrice(balance)}
                    </span>
                    <span className="text-gold font-serif text-xl font-bold ml-2">FCFA</span>
                    <p className="text-[10px] text-white/70 mt-3 leading-relaxed max-w-sm">
                      Cashback crédité automatiquement après chaque visite validée.
                    </p>
                  </div>

                  {/* Bottom Trigger */}
                  <div className="relative z-10 self-start">
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="flex items-center gap-2 bg-white text-green-dark px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg hover:bg-gold hover:text-green-darker -translate-y-0 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span>Voir l'historique</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* CARD 2: MON QR CODE */}
                <div className="rounded-[36px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between items-center text-center">
                  <div className="w-full flex items-center justify-between border-b border-gold/10 pb-3 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-green-dark font-bold">
                      MON QR CODE
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-gold font-bold border border-gold/20 px-2 py-0.5 rounded">
                      Pass Actif
                    </span>
                  </div>
                  
                  {/* QR Core Wrapped in Cream */}
                  <div className="bg-cream border border-gold/15 rounded-3xl p-4 flex items-center justify-center shadow-inner hover:scale-[1.02] transition-transform duration-500 cursor-pointer" onClick={() => setShowQRModal(true)}>
                    <QRCodeSVG 
                      value={user.qrCode || `IBC-MEMBER-YAOK-BRONZE-${user.uid}`} 
                      size={130}
                      level="Q"
                      fgColor="#031d0f"
                    />
                  </div>

                  <p className="text-[10px] text-text-muted leading-relaxed mt-4 max-w-[220px]">
                    Présentez ce QR Code chez nos partenaires pour cumuler vos avantages.
                  </p>
                  
                  <button 
                    onClick={() => setShowQRModal(true)}
                    className="mt-4 w-full bg-[#031d0f] hover:bg-green-dark text-white text-[9px] uppercase tracking-[0.25em] font-bold py-3 rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Voir mon pass IBC
                  </button>
                </div>

                {/* CARD 3: MES STATISTIQUES */}
                <div className="rounded-[36px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gold/10 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.4em] text-green-dark font-bold">
                        MES STATISTIQUES
                      </span>
                      <p className="text-[9px] text-text-muted mt-0.5">Toutes mes performances IBC</p>
                    </div>
                    <Award size={18} className="text-gold" />
                  </div>

                  <div className="grid gap-4 flex-1 flex flex-col justify-center">
                    {/* Stat 1: Total expenses */}
                    <div className="flex items-center gap-4 bg-cream/40 border border-gold/10 rounded-2xl p-4">
                      <div className="w-10 h-10 bg-green-dark rounded-xl flex items-center justify-center text-gold shadow-md">
                        <CreditCard size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] uppercase tracking-wider text-text-muted font-semibold">TOTAL DÉPENSES</p>
                        <p className="font-serif text-xl font-extrabold text-green-dark mt-1">
                          {formatPrice(totalSpent)} <span className="text-xs font-sans font-bold text-green-dark/80">FCFA</span>
                        </p>
                      </div>
                    </div>

                    {/* Stat 2: Visits this month */}
                    <div className="flex items-center gap-4 bg-cream/40 border border-gold/10 rounded-2xl p-4">
                      <div className="w-10 h-10 bg-green-dark rounded-xl flex items-center justify-center text-gold shadow-md">
                        <MapPin size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] uppercase tracking-wider text-text-muted font-semibold">VISITES CE MOIS</p>
                        <p className="font-serif text-xl font-extrabold text-green-dark mt-1">
                          {visitsThisMonth} <span className="text-xs font-sans font-bold text-green-dark/80">LIEUX</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => toast('Statistiques détaillées bientôt disponibles !', { icon: '📊' })}
                    className="mt-4 text-center text-green-dark hover:text-gold text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Voir mes statistiques détaillées</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>

              {/* ─── ROW 2: LOYALTY & COLLABORATIVE WIDGETS (4 CARDS) ─── */}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-[1.1fr_1.3fr_1.1fr_1fr]">
                
                {/* CARD 4: MA CAGNOTTE IBC */}
                <div className="rounded-[32px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">
                      MA CAGNOTTE IBC
                    </span>
                    <Gift size={16} className="text-gold" />
                  </div>
                  
                  <div className="my-2">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-extrabold text-green-dark">
                        {formatPrice(balance)}
                      </span>
                      <span className="text-green-dark font-serif font-bold text-sm">FCFA</span>
                    </div>
                    <p className="text-[10px] text-gold font-semibold uppercase mt-0.5 tracking-wider">Disponible</p>
                  </div>

                  <div className="bg-cream/40 border border-gold/10 rounded-xl p-3 text-[10px] text-text-muted space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span>Cashback confirmé</span>
                      <span className="font-mono text-green-dark">{formatPrice(confirmedCashback)} F</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-gold/5 pt-1.5">
                      <span>Bonus & privilèges</span>
                      <span className="font-mono text-green-dark">{formatPrice(bonusCashback)} F</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => toast('Votre cagnotte sera débitable lors de vos prochains paiements partenaires !', { icon: '💰' })}
                    className="mt-4 w-full bg-[#031d0f] hover:bg-green-dark text-gold text-[9px] uppercase tracking-[0.25em] font-bold py-2.5 rounded-xl transition-all duration-300"
                  >
                    Utiliser ma cagnotte
                  </button>
                </div>

                {/* CARD 5: MON OBJECTIF ÉVASION */}
                <div className="rounded-[32px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">
                      MON OBJECTIF ÉVASION
                    </span>
                    <span className="bg-gold/10 text-gold text-[9px] font-extrabold px-2 py-0.5 rounded">
                      {goalProgressPercentage}%
                    </span>
                  </div>

                  {/* Destination with circular image — matches mockup */}
                  <div className="flex items-center gap-3 mb-1">
                    <img
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=96&h=96"
                      alt="Weekend Assinie"
                      className="w-11 h-11 rounded-full object-cover border-2 border-gold/30 shadow-md shrink-0"
                    />
                    <div>
                      <h4 className="font-serif text-[15px] font-bold text-green-dark leading-tight flex items-center gap-1">
                        <span>Weekend Assinie</span>
                        <span>🌴</span>
                      </h4>
                      <p className="text-[9px] text-text-muted mt-0.5">Objectif : {formatPrice(goalTarget)} FCFA</p>
                    </div>
                  </div>

                  {/* Big amount */}
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="font-serif text-3xl font-extrabold text-green-dark">
                      {formatPrice(currentGoalProgress)}
                    </span>
                    <span className="text-green-dark font-serif font-bold text-sm">FCFA</span>
                  </div>

                  {/* Horizontal visual progress bar */}
                  <div className="my-1">
                    <div className="h-2.5 rounded-full bg-gold/10 border border-gold/10 overflow-hidden relative shadow-inner">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-dark to-green-mid"
                        style={{ width: `${goalProgressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-end text-[9px] font-mono font-bold text-text-muted mt-1">
                      <span>{goalProgressPercentage}%</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => toast('Configurez votre prochain objectif évasion dans le menu Mes Objectifs !', { icon: '✈️' })}
                    className="mt-1 text-center text-green-dark hover:text-gold text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition-colors border-t border-gold/10 pt-2"
                  >
                    <span>Voir mes objectifs</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {/* CARD 6: ÉPARGNE CLUB */}
                <div className="rounded-[32px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">
                      ÉPARGNE CLUB
                    </span>
                    <Sparkles size={16} className="text-gold" />
                  </div>

                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Épargnez automatiquement votre cashback pour financer vos prochaines expériences.
                  </p>

                  <div className="bg-cream/40 border border-gold/10 rounded-xl p-3 flex items-center justify-between mt-2 shadow-sm">
                    <div>
                      <p className="text-[8px] text-text-muted uppercase font-bold tracking-wider">Épargne active</p>
                      <p className="font-serif text-lg font-bold text-green-dark mt-0.5">{formatPrice(savingsBalance)} FCFA</p>
                    </div>
                    {/* Custom Green Piggybank circle */}
                    <div className="w-9 h-9 rounded-full bg-green-dark/10 text-green-dark flex items-center justify-center shadow-inner">
                      <span className="text-lg">🐷</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => toast('Gérez votre taux d’épargne automatique depuis cet espace.', { icon: '🐖' })}
                    className="mt-3 text-center text-green-dark hover:text-gold text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Gérer mon épargne</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {/* CARD 7: CERCLE ÉVASION IBC */}
                <div className="rounded-[32px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">
                      CERCLE ÉVASION IBC
                    </span>
                    <span className="bg-green-dark text-gold text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                      +8
                    </span>
                  </div>

                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Épargner à plusieurs, voyager loin. Rejoignez ou créez votre cercle privé d'amis.
                  </p>

                  {/* Row of 5 avatars stacked overlapping */}
                  <div className="flex items-center -space-x-2 my-3">
                    {[
                      { id: 1, name: 'Armand A.', initials: 'AA', bg: 'bg-[#1B5E35]', text: 'text-gold' },
                      { id: 2, name: 'Béatrice B.', initials: 'BB', bg: 'bg-[#8C6239]', text: 'text-white' },
                      { id: 3, name: 'Claude C.', initials: 'CC', bg: 'bg-[#C9A84C]', text: 'text-[#031d0f]' },
                      { id: 4, name: 'Diana D.', initials: 'DD', bg: 'bg-green-dark text-gold', initialsText: true },
                      { id: 5, name: 'Eric E.', initials: 'EE', bg: 'bg-cream text-[#031d0f]', initialsText: true },
                    ].map((avatar, idx) => (
                      <span
                        key={avatar.id}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold shadow-sm ${avatar.bg} ${avatar.text || 'text-white'}`}
                        title={avatar.name}
                      >
                        {avatar.initials}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => toast('Créez un cercle d’épargne pour voyager en groupe !', { icon: '👥' })}
                    className="text-center text-green-dark hover:text-gold text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Voir mes cercles</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

              </div>

              {/* ─── ROW 3: LOYALTY & PERKS (4 CARDS) ─── */}
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr]">
                
                {/* CARD 8: PARRAINAGE (LARGE BLOCK WITH GIFT BOX ILLUSTRATION) */}
                <div className="rounded-[36px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                  
                  {/* Top Header line */}
                  <div className="flex items-center justify-between pb-1.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] uppercase tracking-[0.05em] text-[#031d0f] font-bold">
                        PARRAINAGE
                      </span>
                      <span className="bg-[#EFA327] text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                        NOUVEAU
                      </span>
                    </div>
                    <button 
                      onClick={() => toast('Invitez vos proches à rejoindre IBC. À chaque adhésion payante, recevez 2 500 FCFA.', { icon: 'ℹ️' })}
                      className="text-text-muted hover:text-[#031d0f] transition-colors p-1"
                    >
                      <Info size={16} />
                    </button>
                  </div>

                  {/* Invitation Pitch */}
                  <p className="text-[11px] text-text-muted font-medium">
                    Invitez vos proches et gagnez des bonus !
                  </p>

                  {/* Two Sub-Cards Side by Side */}
                  <div className="grid grid-cols-2 gap-3 my-3">
                    <div className="bg-[#F9F8F6] rounded-xl p-3 flex items-center gap-3">
                      <Users size={20} className="text-green-dark shrink-0" />
                      <div>
                        <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Mes filleuls</p>
                        <p className="font-serif text-xl font-black text-green-dark mt-0.5">{refereeCount}</p>
                      </div>
                    </div>
                    <div className="bg-[#F9F8F6] rounded-xl p-3 flex items-center gap-3">
                      <User size={20} className="text-green-dark shrink-0" />
                      <div>
                        <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Bonus gagnés</p>
                        <p className="font-serif text-xl font-black text-green-dark mt-0.5">
                          {formatPrice(referralBonus)} <span className="text-[9px] font-sans font-bold">FCFA</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Copy Link Widget & Gift Box Icon Overlay */}
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-dark mb-1.5">Mon lien de parrainage</p>
                      <div className="flex items-center justify-between bg-[#FFF7EB] border border-[#FCE4C3] rounded-xl px-3.5 py-3 text-[11px] font-mono text-[#C48D3F]">
                        <span className="truncate max-w-[140px] sm:max-w-none">{referralLink}</span>
                        <button 
                          onClick={handleCopyLink}
                          className="text-[#C48D3F] hover:text-green-dark transition-colors p-1"
                        >
                          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    {/* Golden Giftbox illustration */}
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                      <svg width="50" height="50" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 24h36v32H14V24z" stroke="#C48D3F" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M10 16h44v8H10v-8z" fill="#FFF7EB" stroke="#C48D3F" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M32 16v40" stroke="#C48D3F" strokeWidth="2" />
                        <path d="M32 16c-3-6-11-6-11 0h11zM32 16c3-6 11-6 11 0H32z" stroke="#C48D3F" strokeWidth="2" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTab('parrainage');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="mt-4 text-center text-green-dark hover:text-gold text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transi                {/* CARD 9: MON ÉVOLUTION MEMBRE (SPENDING POWER TRACKER) */}
                <div className="rounded-[36px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[260px]">
                  
                  {/* Header Line */}
                  <div className="flex items-center justify-between border-b border-gold/10 pb-3 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-green-dark font-bold">
                      MON ÉVOLUTION MEMBRE
                    </span>
                    <span className="bg-[#1B5E35] text-gold text-[8px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                      {formatPrice(spendingLevel)} F
                    </span>
                  </div>

                  <p className="text-[10px] text-text-muted leading-relaxed">
                    Plus vous vivez d’expériences, plus vos privilèges évoluent. Votre pouvoir d’achat mensuel détermine votre statut.
                  </p>

                  {/* Horizontal Timeline Tracker */}
                  <div className="my-8 relative px-4 select-none">
                    {/* Line Background Track */}
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-gold/20 -translate-y-1/2" />
                    
                    {/* Line Active Fill — Bronze: 10k–40k = environ 28% du parcours */}
                    <div 
                      className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-orange-500 to-gold -translate-y-1/2" 
                      style={{ width: 'calc(31.5% * (100% - 32px))' }}
                    />

                    {/* Floating spending badge */}
                    <div 
                      className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center"
                      style={{ left: 'calc(16px + 31.5% * (100% - 32px))' }}
                    >
                      <div className="bg-[#1B5E35] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                        {formatPrice(spendingLevel)} F
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#1B5E35] rotate-45 -mt-0.5" />
                    </div>

                    {/* Timeline Milestones */}
                    <div className="flex justify-between items-center relative z-10">
                      
                      {/* Milestone 1: Bronze */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#8C6239] border-2 border-white shadow-soft flex items-center justify-center text-white text-xs">
                          <Star size={10} fill="currentColor" />
                        </div>
                        <p className="text-[8px] font-extrabold uppercase mt-2 text-[#8C6239]">BRONZE</p>
                        <p className="text-[7px] text-text-muted mt-0.5">10k – 40k F</p>
                      </div>

                      {/* Milestone 2: Or */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gold border-2 border-white shadow-soft flex items-center justify-center text-[#031d0f] text-xs">
                          <Star size={10} fill="currentColor" />
                        </div>
                        <p className="text-[8px] font-extrabold uppercase mt-2 text-gold">OR</p>
                        <p className="text-[7px] text-text-muted mt-0.5">50k – 90k F</p>
                      </div>

                      {/* Milestone 3: Platinum */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white shadow-soft flex items-center justify-center text-white text-xs">
                          <Star size={10} fill="currentColor" />
                        </div>
                        <p className="text-[8px] font-extrabold uppercase mt-2 text-slate-500">PLATINUM</p>
                        <p className="text-[7px] text-text-muted mt-0.5">100k+ F</p>
                      </div>

                    </div>
                  </div>

                  <button 
                    onClick={() => toast('Votre statut est déterminé par votre pouvoir d’achat mensuel moyen chez nos partenaires : Bronze (10 000–40 000 F), Or (50 000–90 000 F), Platinum (100 000 F et plus).', { icon: '⭐' })}
                    className="text-center text-green-dark hover:text-gold text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition-colors border-t border-gold/10 pt-3"
                  >
                    <span>Comprendre les niveaux</span>
                    <ArrowRight size={10} />
                  </button>
                </div>n-colors border-t border-gold/10 pt-3"
                  >
                    <span>Comprendre les niveaux</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

                {/* CARD 10: MES PRIVILÈGES ACTIFS (ICON LIST) */}
                <div className="rounded-[36px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[260px]">
                  
                  <div className="flex items-center justify-between border-b border-gold/10 pb-3 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-green-dark font-bold">
                      MES PRIVILÈGES ACTIFS
                    </span>
                    <button 
                      onClick={() => setActiveTab('privileges')}
                      className="text-[9px] uppercase tracking-wider text-text-muted hover:text-gold font-bold transition-colors"
                    >
                      Voir tous
                    </button>
                  </div>

                  {/* Privileges row checklist */}
                  <div className="grid grid-cols-4 gap-2 flex-1 items-center py-2">
                    
                    {/* Perk 1 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-9 h-9 rounded-xl bg-cream border border-gold/25 flex items-center justify-center text-gold shadow-sm hover:bg-gold hover:text-green-darker transition-all duration-300">
                        <BadgePercent size={18} />
                      </div>
                      <p className="text-[8px] font-bold text-green-dark mt-2 leading-tight">Réductions</p>
                      <p className="text-[7px] text-text-muted mt-0.5">Jusqu'à -30%</p>
                    </div>

                    {/* Perk 2 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-9 h-9 rounded-xl bg-cream border border-gold/25 flex items-center justify-center text-gold shadow-sm hover:bg-gold hover:text-green-darker transition-all duration-300">
                        <Crown size={18} />
                      </div>
                      <p className="text-[8px] font-bold text-green-dark mt-2 leading-tight">Accès VIP</p>
                      <p className="text-[7px] text-text-muted mt-0.5">Files prioritaires</p>
                    </div>

                    {/* Perk 3 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-9 h-9 rounded-xl bg-cream border border-gold/25 flex items-center justify-center text-gold shadow-sm hover:bg-gold hover:text-green-darker transition-all duration-300">
                        <Gift size={18} />
                      </div>
                      <p className="text-[8px] font-bold text-green-dark mt-2 leading-tight">Invitations</p>
                      <p className="text-[7px] text-text-muted mt-0.5">Événements exclusifs</p>
                    </div>

                    {/* Perk 4 */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-9 h-9 rounded-xl bg-cream border border-gold/25 flex items-center justify-center text-gold shadow-sm hover:bg-gold hover:text-green-darker transition-all duration-300">
                        <Bell size={18} />
                      </div>
                      <p className="text-[8px] font-bold text-green-dark mt-2 leading-tight">Services dédiés</p>
                      <p className="text-[7px] text-text-muted mt-0.5">Conciergerie IBC</p>
                    </div>

                  </div>

                  <div className="border-t border-gold/10 pt-3 text-center">
                    <p className="text-[8px] italic text-text-muted">Vos privilèges évoluent avec votre fidélité</p>
                  </div>
                </div>

                {/* CARD 11: MES EXPÉRIENCES À VENIR */}
                <div className="rounded-[36px] bg-white border border-gold/15 p-6 shadow-soft flex flex-col justify-between min-h-[260px]">
                  
                  <div className="flex items-center justify-between border-b border-gold/10 pb-3 mb-3">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-green-dark font-bold">
                      EXPÉRIENCES À VENIR
                    </span>
                    <button 
                      onClick={() => setActiveTab('experiences')}
                      className="text-[9px] uppercase tracking-wider text-text-muted hover:text-gold font-bold transition-colors"
                    >
                      Voir agenda
                    </button>
                  </div>

                  {/* List of 3 bookings with visual thumbnails */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                    {experiences.map((exp) => (
                      <div 
                        key={exp.id} 
                        className="flex items-center gap-3 bg-cream/40 border border-gold/10 rounded-xl p-2 hover:border-gold/30 hover:bg-cream transition-all duration-300 cursor-pointer"
                        onClick={() => toast(`Détails de la réservation "${exp.title}" envoyés par WhatsApp !`, { icon: '📱' })}
                      >
                        <img 
                          src={exp.imageUrl} 
                          alt={exp.title} 
                          className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gold/10 shadow-sm" 
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h5 className="text-[10px] font-bold text-green-dark truncate">{exp.title}</h5>
                          <p className="text-[8px] text-text-muted truncate mt-0.5">{exp.date}</p>
                          <p className="text-[7px] text-[#8C6239] font-medium truncate">{exp.location}</p>
                        </div>
                        <ChevronRight size={12} className="text-gold shrink-0" />
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* ─── RÉPARTITION DES TRANSACTIONS ─── */}
              <div className="border-t border-gold/15 pt-8">
                <div className="bg-white border border-gold/15 rounded-[36px] shadow-soft p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.4em] text-green-dark font-bold">RÉPARTITION DES TRANSACTIONS</h3>
                      <p className="text-[9px] text-text-muted mt-0.5">Par catégorie — ce mois-ci</p>
                    </div>
                    <select className="text-[9px] font-bold text-green-dark border border-gold/20 rounded-lg px-3 py-1.5 bg-cream/30 outline-none focus:border-gold cursor-pointer uppercase tracking-wider">
                      <option>Par catégorie</option>
                      <option>Par établissement</option>
                      <option>Par mois</option>
                    </select>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Donut SVG Chart */}
                    <div className="relative shrink-0">
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        {/* Restauration 45% — vert foncé */}
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#1B5E35" strokeWidth="28"
                          strokeDasharray="169.6 376.8" strokeDashoffset="94.2" />
                        {/* Boissons 25% — or */}
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#C9A84C" strokeWidth="28"
                          strokeDasharray="94.2 452.2" strokeDashoffset="-75.4" />
                        {/* Location transats 15% — vert clair */}
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#2D7A4F" strokeWidth="28"
                          strokeDasharray="56.5 489.9" strokeDashoffset="-169.6" />
                        {/* Activités 10% — or clair */}
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#8C6239" strokeWidth="28"
                          strokeDasharray="37.7 508.7" strokeDashoffset="-226.1" />
                        {/* Autres 5% — gris doré */}
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#D4AF37" strokeWidth="28"
                          strokeDasharray="18.8 527.6" strokeDashoffset="-263.9" />
                        {/* Cercle central blanc */}
                        <circle cx="80" cy="80" r="44" fill="white" />
                        <text x="80" y="77" textAnchor="middle" className="font-serif" style={{fontFamily:'serif', fontWeight:700, fontSize:11, fill:'#1B5E35'}}>Mois</text>
                        <text x="80" y="92" textAnchor="middle" style={{fontFamily:'sans-serif', fontWeight:800, fontSize:13, fill:'#1B5E35'}}>Mai</text>
                      </svg>
                    </div>

                    {/* Légende */}
                    <div className="flex-1 space-y-3 w-full">
                      {[
                        { label: 'Restauration', pct: 45, color: '#1B5E35' },
                        { label: 'Boissons', pct: 25, color: '#C9A84C' },
                        { label: 'Location & transats', pct: 15, color: '#2D7A4F' },
                        { label: 'Activités', pct: 10, color: '#8C6239' },
                        { label: 'Autres', pct: 5, color: '#D4AF37' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                          <span className="text-[11px] text-text flex-1 font-medium">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gold/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                            </div>
                            <span className="text-[11px] font-bold text-green-dark w-8 text-right">{item.pct}%</span>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setActiveTab('transactions')}
                        className="mt-2 text-[9px] font-bold text-green-dark hover:text-gold uppercase tracking-widest flex items-center gap-1 transition-colors border-t border-gold/10 pt-3"
                      >
                        Voir le détail des catégories <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── BOTTOM SECTION: RECOMMANDÉS POUR VOUS CAROUSEL ─── */}}
              <div className="border-t border-gold/15 pt-8 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="text-left">
                    <h3 className="text-lg font-serif font-black text-green-dark uppercase tracking-wider">
                      RECOMMANDÉS POUR VOUS
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-snug">
                      Des expériences sélectionnées selon vos envies
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/establishments')}
                    className="bg-green-dark text-gold font-bold rounded-lg px-6 py-2.5 uppercase tracking-widest text-[9px] hover:bg-[#031d0f] transition-colors self-start sm:self-auto"
                  >
                    Voir tout le Catalogue
                  </button>
                </div>

                <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-[1fr_1fr_1fr_1fr_0.8fr]">
                  
                  {recommendations.map((place) => (
                    <div 
                      key={place.id}
                      className="bg-white border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-soft transition-all duration-500 group cursor-pointer"
                      onClick={() => navigate('/establishments')}
                    >
                      <div className="relative overflow-hidden h-28">
                        <img 
                          src={place.img} 
                          alt={place.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        {/* Gold discount bubble */}
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-gold to-[#F0C040] text-green-darker text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full shadow-md">
                          {place.discount}
                        </span>
                      </div>
                      <div className="p-3.5 text-left">
                        <h4 className="font-serif text-sm font-bold text-green-dark truncate">{place.name}</h4>
                        <p className="flex items-center gap-1 text-text-muted text-[9px] mt-1">
                          <MapPin size={9} className="text-gold" />
                          <span>{place.location}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Discover Link block on the right */}
                  <div 
                    onClick={() => navigate('/establishments')}
                    className="bg-gold/10 border border-dashed border-gold/30 rounded-2xl p-6 flex flex-col justify-between text-left cursor-pointer group hover:bg-gold/20 hover:border-gold transition-all duration-500 col-span-2 md:col-span-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-2xl">🌴</span>
                      <ArrowRight size={20} className="text-gold group-hover:translate-x-1.5 transition-transform" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#8C6239] font-extrabold leading-snug">Découvrir plus d'expériences</p>
                      <p className="text-[8px] text-text-muted mt-1 leading-snug">Voir toutes les offres exclusives</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ─── TAB 2: PRIVILEGES TAB ─── */}
          {activeTab === 'privileges' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Mes Privilèges IBC</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-3xl">
                En tant que membre d'Ivoire Business Club sous le statut <strong>Bronze</strong>, vous bénéficiez d'une sélection de privilèges conçus pour magnifier votre quotidien. Accumulez les points de fidélité pour débloquer les niveaux d'avantages supérieurs.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2 mt-8">
                {[
                  { title: 'Réductions Partenaires', desc: 'Profitez de tarifs réduits allant jusqu’à -30% sur vos consommations, séjours et loisirs auprès de notre catalogue exclusif d’établissements.', details: 'Actif chez tous les partenaires', active: true, icon: '🎫' },
                  { title: 'Invitations Découvertes', desc: 'Soyez invité à nos soirées découvertes, vernissages et cocktails organisés par IBC ou ses partenaires.', details: 'Selon calendrier d’événements', active: true, icon: '✉️' },
                  { title: 'Accès Prioritaire Événements', desc: 'Accédez en priorité aux réservations de nos événements les plus demandés, comme nos célèbres Weekend Assinie ou Brunch & Chill.', details: 'Nécessite le statut OR', active: false, icon: '👑' },
                  { title: 'Services de Conciergerie Dédiée', desc: 'Bénéficiez d’une ligne de conciergerie dédiée sur WhatsApp pour toutes vos réservations d’hôtel, de table ou d’activités privées.', details: 'Nécessite le statut PLATINUM', active: false, icon: '🛎️' },
                ].map((perk, i) => (
                  <div key={i} className={`p-6 border rounded-2xl flex gap-4 items-start ${perk.active ? 'bg-cream/30 border-gold/25' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                    <span className="text-3xl">{perk.icon}</span>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-lg text-green-dark">{perk.title}</h4>
                      <p className="text-xs text-text-muted leading-relaxed">{perk.desc}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${perk.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{perk.details}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 3: TRANSACTIONS TAB ─── */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/10 pb-4 mb-6">
                <div>
                  <h3 className="font-serif text-3xl font-bold text-green-dark">Mes Transactions Cashback</h3>
                  <p className="text-text-muted text-xs mt-1">Retrouvez l'historique complet de vos visites et cashback cumulés.</p>
                </div>
                <div className="bg-green-dark text-white px-5 py-2 rounded-xl text-center shadow-soft">
                  <p className="text-[8px] uppercase tracking-wider text-gold font-bold">SOLDE CONFIRMÉ</p>
                  <p className="font-serif text-xl font-bold mt-0.5">{formatPrice(confirmedCashback)} FCFA</p>
                </div>
              </div>

              {isLoadingTxs ? (
                <div className="py-12 text-center text-text-muted flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Chargement de votre historique...</p>
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gold/20 text-green-dark font-bold">
                        <th className="py-3 px-4 uppercase tracking-wider">Établissement</th>
                        <th className="py-3 px-4 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 uppercase tracking-wider text-right">Montant Facture</th>
                        <th className="py-3 px-4 uppercase tracking-wider text-right">Cashback Crédité</th>
                        <th className="py-3 px-4 uppercase tracking-wider text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/10">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-cream/20 transition-colors">
                          <td className="py-4 px-4 font-bold text-green-dark">{tx.partnerName}</td>
                          <td className="py-4 px-4 text-text-muted font-mono">{tx.date}</td>
                          <td className="py-4 px-4 text-right font-semibold font-mono">{formatPrice(tx.amount)} FCFA</td>
                          <td className="py-4 px-4 text-right font-semibold font-mono text-gold">+{formatPrice(tx.cashback)} FCFA</td>
                          <td className="py-4 px-4 text-center">
                            <span className="bg-green-100 text-green-800 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Confirmé
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center text-text-muted">
                  <span className="text-5xl block mb-4">💳</span>
                  <h4 className="font-serif text-lg font-bold text-green-dark mb-1">Aucune transaction enregistrée</h4>
                  <p className="text-xs max-w-sm mx-auto leading-relaxed">
                    Présentez votre QR Code lors de votre passage dans un établissement partenaire pour accumuler votre premier cashback !
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: CAGNOTTE TAB ─── */}
          {activeTab === 'cagnotte' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Ma Cagnotte IBC</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                Votre cagnotte accumule le cashback automatique issu de vos visites ainsi que vos bonus de parrainage et privilèges d'inscription. Cet argent est entièrement utilisable chez n'importe quel établissement partenaire pour payer vos factures.
              </p>
              
              <div className="grid gap-6 md:grid-cols-3 mt-8">
                <div className="bg-cream/40 border border-gold/20 p-6 rounded-2xl text-center">
                  <span className="text-3xl">💰</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mt-3">Solde Total</h4>
                  <p className="font-serif text-2xl font-extrabold text-green-dark mt-2">{formatPrice(balance)} FCFA</p>
                </div>
                <div className="bg-[#FAF5E9]/50 border border-gold/15 p-6 rounded-2xl text-center">
                  <span className="text-3xl">✅</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mt-3">Cashback Confirmé</h4>
                  <p className="font-serif text-2xl font-extrabold text-green-dark mt-2">{formatPrice(confirmedCashback)} FCFA</p>
                </div>
                <div className="bg-[#FAF5E9]/50 border border-gold/15 p-6 rounded-2xl text-center">
                  <span className="text-3xl">🎁</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mt-3">Privilèges & Bonus</h4>
                  <p className="font-serif text-2xl font-extrabold text-green-dark mt-2">{formatPrice(bonusCashback)} FCFA</p>
                </div>
              </div>

              <div className="mt-8 border-t border-gold/15 pt-6 max-w-2xl">
                <h4 className="font-serif text-xl font-bold text-green-dark mb-4">Comment utiliser ma cagnotte ?</h4>
                <ol className="space-y-4 text-xs text-text-muted list-decimal list-inside leading-relaxed">
                  <li>Lors de votre règlement, signalez au partenaire que vous souhaitez régler tout ou partie de votre facture en utilisant votre cagnotte IBC.</li>
                  <li>Présentez votre QR Code membre.</li>
                  <li>Le partenaire enregistre la transaction et le montant choisi est automatiquement débité de votre solde.</li>
                </ol>
              </div>
            </div>
          )}

          {/* ─── TAB 5: OBJECTIFS TAB ─── */}
          {activeTab === 'objectifs' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Mes Objectifs Évasion</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                Fixez-vous des buts d'escapades et épargnez votre cashback pour financer des séjours d'exception de notre catalogue.
              </p>
              
              <div className="bg-cream/30 border border-gold/20 p-6 rounded-2xl max-w-xl mt-8">
                <div className="flex items-center justify-between border-b border-gold/10 pb-3 mb-4">
                  <h4 className="font-serif text-xl font-bold text-green-dark flex items-center gap-2">
                    <span>Weekend Assinie</span>
                    <span>🌴</span>
                  </h4>
                  <span className="bg-gold text-green-darker text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Actif - {goalProgressPercentage}% Cible
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold text-text">
                    <span>Solde Épargné</span>
                    <span className="font-mono text-green-dark">{formatPrice(currentGoalProgress)} / {formatPrice(goalTarget)} FCFA</span>
                  </div>
                  <div className="h-4 rounded-full bg-gold/15 border border-gold/20 overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-dark to-green-mid"
                      style={{ width: `${goalProgressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Il vous manque encore <strong>{formatPrice(goalTarget - currentGoalProgress)} FCFA</strong> de cashback pour atteindre votre objectif et réserver votre weekend tout compris à Assinie.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 6: EPARGNE TAB ─── */}
          {activeTab === 'epargne' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Épargne Club</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                La fonctionnalité <strong>Épargne Club</strong> vous permet d'allouer automatiquement un pourcentage choisi de votre cashback accumulé vers une tirelire dédiée à vos futurs projets voyages.
              </p>
              
              <div className="bg-cream/40 border border-gold/20 p-6 rounded-2xl flex items-center justify-between max-w-md mt-8 shadow-sm">
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Solde Épargne Active</p>
                  <p className="font-serif text-3xl font-extrabold text-green-dark mt-1">{formatPrice(savingsBalance)} FCFA</p>
                </div>
                <div className="w-14 h-14 bg-green-dark rounded-2xl flex items-center justify-center text-gold shadow-md">
                  <span className="text-3xl">🐷</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 7: CERCLE TAB ─── */}
          {activeTab === 'cercle' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Cercle Évasion IBC</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                Voyager à plusieurs est toujours plus agréable. Créez un cercle privé avec vos proches ou collègues de bureau membres d'IBC, et cumulez vos cagnottes pour vous offrir des séjours collectifs de rêve.
              </p>
              
              <div className="mt-8 border border-gold/25 p-6 rounded-2xl bg-cream/30 max-w-xl text-center">
                <span className="text-5xl">👥</span>
                <h4 className="font-serif text-xl font-bold text-green-dark mt-4">Aucun cercle de voyage actif</h4>
                <p className="text-xs text-text-muted mt-2 max-w-md mx-auto leading-relaxed">
                  Vous n'êtes pour le moment membre d'aucun cercle évasion. Créez-en un dès maintenant et invitez des membres à vous rejoindre !
                </p>
                <button 
                  onClick={() => toast('Création de cercle bientôt disponible !', { icon: '✨' })}
                  className="mt-6 bg-green-dark hover:bg-[#031d0f] text-gold font-bold px-8 py-3 rounded-xl uppercase tracking-widest text-[10px]"
                >
                  Créer un Cercle Évasion
                </button>
              </div>
            </div>
          )}

          {/* ─── TAB 8: PARRAINAGE TAB ─── */}
          {activeTab === 'parrainage' && (
            <div className="space-y-8 text-left animate-in fade-in duration-500">

              {/* Header card */}
              <div className="bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-3xl font-bold text-green-dark">Programme de Parrainage IBC</h3>
                      <span className="bg-[#C9A84C] text-[#031d0f] text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-[4px] shrink-0">NOUVEAU</span>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                      Partagez l'expérience d'Ivoire Business Club autour de vous et gagnez des bonus substantiels. Pour chaque personne s'inscrivant via votre lien exclusif et finalisant son adhésion, vous recevez un crédit de <strong className="text-green-dark">2 500 FCFA</strong> directement dans votre cagnotte.
                    </p>
                  </div>
                  <span className="text-6xl">🎁</span>
                </div>

                {/* Stats summary row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-cream/50 border border-gold/15 rounded-2xl p-4">
                    <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider mb-1">Mes filleuls</p>
                    {isLoadingReferrals ? (
                      <div className="h-7 w-10 bg-gold/10 rounded animate-pulse" />
                    ) : (
                      <p className="font-serif text-2xl font-extrabold text-green-dark">{refereeCount}</p>
                    )}
                  </div>
                  <div className="bg-cream/50 border border-gold/15 rounded-2xl p-4">
                    <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider mb-1">Filleuls actifs</p>
                    {isLoadingReferrals ? (
                      <div className="h-7 w-10 bg-gold/10 rounded animate-pulse" />
                    ) : (
                      <p className="font-serif text-2xl font-extrabold text-green-dark">{referralStats?.activeCount ?? 1}</p>
                    )}
                  </div>
                  <div className="bg-cream/50 border border-gold/15 rounded-2xl p-4 col-span-2 sm:col-span-1">
                    <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider mb-1">Bonus gagnés</p>
                    {isLoadingReferrals ? (
                      <div className="h-7 w-24 bg-gold/10 rounded animate-pulse" />
                    ) : (
                      <p className="font-serif text-2xl font-extrabold text-green-dark">{formatPrice(referralBonus)} <span className="text-sm font-sans font-bold">FCFA</span></p>
                    )}
                  </div>
                </div>

                {/* Copy link widget */}
                <div className="mt-6">
                  <p className="text-xs font-bold text-green-dark uppercase tracking-wider mb-2">Mon Lien de Parrainage Personnel</p>
                  <div className="flex items-center justify-between bg-[#FAF5E9] border border-gold/20 rounded-xl px-4 py-3 text-xs font-mono text-[#8C6239] shadow-sm gap-3">
                    <span className="truncate">{referralLink}</span>
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 flex items-center gap-1.5 bg-green-dark hover:bg-[#031d0f] text-gold text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Referrals list */}
              <div className="bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-serif text-xl font-bold text-green-dark">Historique de mes filleuls</h4>
                  <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold">{refereeCount} invité{refereeCount > 1 ? 's' : ''}</span>
                </div>

                {isLoadingReferrals ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-cream/40 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : referrals.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-5xl block mb-4">👥</span>
                    <p className="font-serif text-lg font-bold text-green-dark">Aucun filleul pour l'instant</p>
                    <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto">Partagez votre lien de parrainage avec vos amis et proches pour commencer à gagner des bonus.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((ref) => (
                      <div
                        key={ref.id}
                        className="flex items-center justify-between gap-4 p-4 bg-cream/30 border border-gold/10 rounded-2xl hover:border-gold/25 hover:bg-cream/50 transition-all duration-200"
                      >
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#1B5E35] text-gold flex items-center justify-center text-[11px] font-bold shrink-0">
                            {ref.refereeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-green-dark text-sm truncate">{ref.refereeName}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{ref.date}</p>
                          </div>
                        </div>

                        {/* Status badge + bonus */}
                        <div className="flex items-center gap-3 shrink-0">
                          {ref.status === 'active' ? (
                            <>
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                Actif
                              </span>
                              <span className="font-serif font-bold text-green-dark text-sm whitespace-nowrap">+{formatPrice(ref.bonus)} F</span>
                            </>
                          ) : (
                            <>
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                En attente
                              </span>
                              <span className="font-serif font-bold text-text-muted text-sm whitespace-nowrap">— F</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-text-muted mt-6 text-center leading-relaxed">
                  Le bonus de <strong className="text-green-dark">2 500 FCFA</strong> est crédité automatiquement dans votre cagnotte dès qu'un filleul finalise son adhésion IBC.
                </p>
              </div>

            </div>
          )}

          {/* ─── TAB 9: ETABLISSEMENTS TAB ─── */}
          {activeTab === 'etablissements' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Mes Établissements Partenaires</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                Retrouvez notre sélection d'établissements premium lifestyle en Côte d'Ivoire. Présentez votre Pass IBC à l'accueil pour bénéficier de vos réductions exclusifs et cumuler vos cashback automatiques.
              </p>
              <button
                onClick={() => navigate('/establishments')}
                className="mt-4 bg-green-dark text-gold font-bold px-8 py-3 rounded-xl uppercase tracking-widest text-[10px] hover:bg-[#031d0f] transition-all"
              >
                Accéder au Catalogue Complet
              </button>
            </div>
          )}

          {/* ─── TAB 10: EXPERIENCES TAB ─── */}
          {activeTab === 'experiences' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Mes Expériences & Agenda</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                Retrouvez l'historique et l'agenda de toutes vos participations aux escapades d'Ivoire Business Club.
              </p>
              
              <div className="space-y-4 max-w-xl mt-8">
                {experiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4 p-4 border border-gold/10 rounded-2xl bg-cream/35 items-center">
                    <img src={exp.imageUrl} alt={exp.title} className="w-16 h-16 object-cover rounded-xl border border-gold/10 shadow-sm shrink-0" />
                    <div>
                      <h4 className="font-serif font-bold text-green-dark text-lg">{exp.title}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{exp.date}</p>
                      <p className="text-xs text-[#8C6239] font-medium">{exp.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 11: PROFIL TAB ─── */}
          {activeTab === 'profil' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Mon Profil Membre</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-center mt-6 p-6 bg-cream/20 border border-gold/10 rounded-2xl max-w-xl">
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-24 h-24 rounded-full border-2 border-gold shadow-md shrink-0 object-cover" 
                />
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="font-serif text-2xl font-bold text-green-dark">{displayName}</h4>
                  <p className="text-xs text-text font-medium">Membre du Club IBC — Statut Bronze</p>
                  <p className="text-xs text-text-muted">Adresse e-mail : {user.email}</p>
                  {user.whatsapp && <p className="text-xs text-text-muted">WhatsApp : +225 {user.whatsapp}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 12: SETTINGS TAB ─── */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left animate-in fade-in duration-500 bg-white border border-gold/15 p-8 rounded-[36px] shadow-soft">
              <h3 className="font-serif text-3xl font-bold text-green-dark">Paramètres du Compte</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                Configurez la sécurité et les préférences de notification de votre compte IVOIRE BUSINESS CLUB.
              </p>
              
              <div className="mt-8 space-y-6 max-w-md">
                <div className="flex items-center justify-between p-4 border border-gold/10 rounded-xl bg-cream/20">
                  <div>
                    <h4 className="text-xs font-bold text-green-dark uppercase">Notifications WhatsApp</h4>
                    <p className="text-[10px] text-text-muted mt-1 leading-snug">Recevoir vos alertes de validation de cashback sur WhatsApp.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-green-dark cursor-pointer w-4 h-4 rounded-md" />
                </div>
                <div className="flex items-center justify-between p-4 border border-gold/10 rounded-xl bg-cream/20">
                  <div>
                    <h4 className="text-xs font-bold text-green-dark uppercase">Alertes par e-mail</h4>
                    <p className="text-[10px] text-text-muted mt-1 leading-snug">Recevoir le récapitulatif mensuel de votre solde et de vos activités évasion.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-green-dark cursor-pointer w-4 h-4 rounded-md" />
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gold/10 px-6 py-4 text-center text-[10px] text-text-muted select-none">
          <p>© {new Date().getFullYear()} IVOIRE BUSINESS CLUB. Tous droits réservés.</p>
          <p className="mt-1">Plateforme exclusive d'avantages membres et d'expériences touristiques.</p>
        </footer>

      </div>

      {/* ─── SHOW PASS QR FULLSCREEN MODAL ─── */}
      <AnimatePresence>
        {showQRModal && (
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-gold/20 p-8 max-w-xs w-full text-center relative shadow-premium"
            >
              <button 
                onClick={() => setShowQRModal(false)} 
                className="absolute top-4 right-4 text-green-dark p-1 rounded-full hover:bg-cream/50 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="font-serif text-2xl font-black text-green-dark">IBC</span>
                <span className="text-gold text-lg">🌴</span>
              </div>
              <p className="text-text-muted text-[10px] uppercase tracking-widest font-semibold">Votre Pass Exclusif</p>
              
              <h3 className="font-serif text-xl font-bold text-green-dark mt-4 mb-1">{displayName}</h3>
              <p className="text-gold text-[9px] uppercase tracking-widest font-bold border border-gold/20 rounded px-2.5 py-0.5 inline-block mx-auto">
                Membre Bronze
              </p>
              
              {/* Massive centered barcode wrapper */}
              <div className="bg-cream border border-gold/15 rounded-3xl p-5 my-6 flex justify-center shadow-inner">
                <QRCodeSVG 
                  value={user.qrCode || `IBC-MEMBER-YAOK-BRONZE-${user.uid}`} 
                  size={160} 
                  level="Q"
                  fgColor="#031d0f"
                />
              </div>
              
              <p className="text-text-muted text-[9px] leading-relaxed max-w-[200px] mx-auto">
                Présentez ce QR Code lors de votre règlement chez nos établissements partenaires pour déduire votre cagnotte ou cumuler vos points.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Simple Custom Icons to match palm tree brand
const PalmtreeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M13 8c0-2.76-2.24-5-5-5S3 5.24 3 8h10z" />
    <path d="M13 8c0 2.21 1.79 4 4 4h4c0-2.21-1.79-4-4-4h-4z" />
    <path d="M13 8c2.21 0 4-1.79 4-4V3c-2.21 0-4 1.79-4 4v1z" />
    <path d="M13 8v13" />
    <path d="M13 13c1.5 1 3 1.5 5 1.5" />
    <path d="M13 16c-1.5 1.5-3 2-5 2" />
  </svg>
);
