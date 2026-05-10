import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  LogOut, Scan, History, Gift, Settings, 
  ChevronLeft, CheckCircle2, Lock, Unlock 
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
  
  // Transaction Steps: 'SCAN' | 'AMOUNT' | 'SUCCESS'
  const [txStep, setTxStep] = useState<'SCAN' | 'AMOUNT' | 'SUCCESS'>('SCAN');
  const [scanning, setScanning] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  const [amount, setAmount] = useState<string>('');
  const [txSuccessData, setTxSuccessData] = useState<any>(null);

  // Recent transactions
  const [recentTx, setRecentTx] = useState<any[]>([]);

  useEffect(() => {
    // Fake loading recent transactions (since we don't have real partner ID context easily available here without full auth hook)
    // In real app, we'd pass `user.uid` as partnerId
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
    // Simulated PIN check (in real app, hash and compare with Firestore)
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

    // Simulate scanning
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
        cashback: Math.round(amt * 0.05) // Placeholder display, real value is in Firestore
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
  };

  return (
    <div className="min-h-screen bg-green-darker text-white pb-32">
      {/* Partner Nav */}
      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="self-start flex items-center gap-2 text-gold hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-gold flex items-center justify-center bg-white/10 overflow-hidden">
                <img src="/assets/pullman-hotel.png" alt="Pullman Hélios" className="w-12 h-12 object-cover" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Partenaire agréé,</p>
                <h3 className="font-serif text-xl">Pullman Hélios</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => accessLevel === 'STAFF' ? setShowPinModal(true) : setAccessLevel('STAFF')}
                className={`w-10 h-10 border flex items-center justify-center transition-all ${
                  accessLevel === 'OWNER' 
                    ? 'border-gold bg-gold/20 text-gold' 
                    : 'border-white/20 text-white/50 hover:text-white'
                }`}
                title={accessLevel === 'OWNER' ? 'Repasser en mode Staff' : 'Accès Propriétaire'}
              >
                {accessLevel === 'OWNER' ? <Unlock size={18} /> : <Lock size={18} />}
              </button>
              <button 
                onClick={onLogout}
                className="w-10 h-10 border border-gold/20 flex items-center justify-center text-gold hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
          <div className="bg-green-darker border border-gold p-6 max-w-sm w-full">
            <h3 className="font-serif text-xl mb-4 text-center">🔒 Accès Propriétaire</h3>
            <p className="text-sm text-white/70 mb-4 text-center">Saisissez votre code PIN à 4 chiffres</p>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-black/50 border border-gold/30 text-white p-3 text-center tracking-[1em] font-mono text-xl mb-6"
              maxLength={4}
              placeholder="••••"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 border border-white/20 text-white hover:bg-white/10">Annuler</button>
              <button onClick={handlePinSubmit} className="flex-1 py-3 bg-gold text-green-dark font-bold hover:bg-gold/90">Valider</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-6 pt-10 space-y-10">
        
        {/* Hotel Product Image Banner */}
        <div className="relative overflow-hidden rounded-lg shadow-2xl border border-gold/30">
          <img src="/assets/pullman-hotel.png" alt="Pullman Hélios - 5 Star Luxury" className="w-full h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="font-serif text-3xl mb-2">Pullman Hélios</h2>
            <p className="text-sm text-white/80 flex items-center gap-2">
              <span className="text-xl">★★★★★</span>
              <span>Hôtel 5 étoiles - Excellence & Prestige</span>
            </p>
          </div>
        </div>
        
        {/* Transaction Validator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white text-green-dark p-6 md:p-12 border border-gold shadow-premium text-center relative overflow-hidden"
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
                <div className="w-32 h-32 border-4 border-dashed border-gold flex items-center justify-center relative cursor-pointer" onClick={() => handleScan()}>
                  <div className="absolute inset-2 border-2 border-green-dark/10" />
                  <Scan size={60} className={`text-gold transition-all duration-1000 ${scanning ? 'scale-110 opacity-50' : ''}`} />
                </div>
              </div>
              <h4 className="font-serif text-2xl mb-2">Enregistrer une visite</h4>
              <p className="text-[11px] text-text-muted mb-8 uppercase tracking-[0.2em] font-bold">Scanner le QR Code du membre</p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Saisir l'ID membre ou scanner" 
                  className="flex-1 bg-white border border-gray-300 p-3 text-sm focus:border-gold outline-none"
                />
                <button 
                  onClick={() => handleScan()}
                  disabled={scanning}
                  className={`bg-gold text-green-dark px-4 font-bold tracking-widest text-[10px] uppercase ${scanning ? 'opacity-50' : ''}`}
                >
                  Identifier
                </button>
              </div>
            </>
          )}

          {txStep === 'AMOUNT' && memberData && (
            <div className="animate-in fade-in zoom-in duration-500">
              <MemberIdentityCard memberData={memberData} />
              
              <div className="mt-8 text-left">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-green-dark mb-2">Montant de la facture (FCFA)</label>
                <input 
                  type="number" 
                  min="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gold/30 p-4 text-xl font-mono text-green-dark focus:border-gold outline-none rounded"
                  placeholder="Ex: 25000"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={resetScanner}
                  className="w-1/3 py-4 border border-red-500/50 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleConfirmTransaction}
                  className="w-2/3 py-4 bg-gold text-green-dark font-bold text-[11px] uppercase tracking-widest hover:bg-gold/90 transition-colors shadow-lg"
                >
                  Confirmer la transaction
                </button>
              </div>
            </div>
          )}

          {txStep === 'SUCCESS' && txSuccessData && (
            <div className="animate-in fade-in zoom-in duration-500 py-6">
              <CheckCircle2 size={60} className="mx-auto mb-6 text-green-500" />
              <h4 className="font-serif text-3xl mb-2 text-green-dark">Visite enregistrée avec succès</h4>
              
              <div className="bg-green-50 border border-green-200 p-6 my-8 rounded text-left space-y-4">
                <div className="flex items-center gap-3 text-green-800">
                  <span className="text-xl">📋</span>
                  <span className="font-medium">Montant de la visite : <strong className="font-mono">{txSuccessData.amount} FCFA</strong></span>
                </div>
                <div className="flex items-center gap-3 text-green-800">
                  <span className="text-xl">💰</span>
                  <span className="font-medium">Cashback crédité à {txSuccessData.firstName} : <strong className="font-mono">{txSuccessData.cashback} FCFA</strong></span>
                </div>
              </div>
              
              <button 
                onClick={resetScanner}
                className="btn-gold w-full flex items-center justify-center gap-3"
              >
                Nouvelle transaction <Scan size={18} />
              </button>
            </div>
          )}
        </motion.div>

        {/* OWNER Quick Stats */}
        {accessLevel === 'OWNER' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gold/10 border border-gold/30 p-6 text-center rounded">
              <p className="text-[9px] uppercase tracking-widest text-gold font-bold mb-2">Visites du mois</p>
              <div className="text-3xl font-serif text-white">128</div>
            </div>
            <div className="bg-gold/10 border border-gold/30 p-6 text-center rounded">
              <p className="text-[9px] uppercase tracking-widest text-gold font-bold mb-2">Revenus nets</p>
              <div className="text-xl font-serif text-white">4,250,000 <span className="text-[10px]">FCFA</span></div>
            </div>
          </div>
        )}

        {/* Recent Validations (Staff & Owner) */}
        <div className="pb-20">
          <h4 className="font-serif text-xl text-gold mb-6">Dernières visites (Aujourd'hui)</h4>
          <div className="space-y-4">
            {recentTx.length > 0 ? recentTx.map((v, i) => (
              <div key={v.id || i} className="flex items-center justify-between p-4 bg-green-dark/20 border-b border-gold/5">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <div>
                    <h5 className="font-serif text-white">{v.memberId ? `Membre ${v.memberId.slice(-4)}` : 'Membre'}</h5>
                    <p className="text-[9px] uppercase tracking-widest text-white/30">{v.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-serif">{v.amount} <span className="text-[10px]">FCFA</span></div>
                  <div className="text-[9px] uppercase tracking-widest text-gold font-bold">Validée</div>
                </div>
              </div>
            )) : (
              <p className="text-white/50 text-sm italic">Aucune transaction récente.</p>
            )}
          </div>
        </div>
      </div>

      {/* Partner Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-green-dark/95 backdrop-blur-md border-t border-gold/20 py-4 px-8 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between text-gold/40">
          <button className="flex flex-col items-center gap-1 text-gold">
            <Scan size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Scanner</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-gold transition-colors">
            <History size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Historique</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-gold transition-colors">
            <Gift size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Offres</span>
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-gold transition-colors">
            <Settings size={20} />
            <span className="text-[8px] uppercase font-bold tracking-widest">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
