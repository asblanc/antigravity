import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, LogOut, ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatPrice = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const AdminDashboardView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*, establishments (name)')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        setTransactions(data || []);
      } catch (e) {
        console.error('Erreur de chargement des transactions admin', e);
      }
    };
    fetchAllTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-green-darker text-white pb-32">
      {/* Admin Nav */}
      <div className="sticky top-0 z-40 bg-green-darker/80 backdrop-blur-md border-b border-gold/10 px-6 py-6">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <button onClick={() => navigate('/')} className="self-start flex items-center gap-2 text-gold hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-2 border-gold flex items-center justify-center bg-white/10">
                <LayoutDashboard size={24} className="text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Administration Centrale</p>
                <h3 className="font-serif text-xl">Dashboard IBC</h3>
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

      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-10">
        <h4 className="font-serif text-2xl text-gold mb-6">Transactions Globales</h4>
        
        <div className="bg-white/5 border border-gold/20 rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-dark border-b border-gold/20 text-[10px] uppercase tracking-widest text-gold">
                <th className="p-4">Date</th>
                <th className="p-4">Membre</th>
                <th className="p-4">Partenaire</th>
                <th className="p-4 text-right">Montant (FCFA)</th>
                <th className="p-4 text-right">Cashback</th>
                <th className="p-4 text-right">Part Partenaire</th>
                <th className="p-4 text-right">
                  Commission IBC
                  <div className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-red-900/50 text-red-400 rounded-full text-[8px] tracking-widest border border-red-500/30 cursor-help" title="Réservé à l'administration IBC">
                    <Lock size={10} /> CONFIDENTIEL
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-white/70">
                    {tx.createdAt?.toDate ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(tx.createdAt.toDate()) : 'N/A'}
                  </td>
                  <td className="p-4 text-sm">{tx.memberId?.slice(-4) || 'N/A'}</td>
                  <td className="p-4 text-sm">{tx.partnerName || 'N/A'}</td>
                  <td className="p-4 text-sm text-right font-mono">{formatPrice(tx.amount)}</td>
                  <td className="p-4 text-sm text-right font-mono text-gold">+{formatPrice(tx.cashback)}</td>
                  <td className="p-4 text-sm text-right font-mono text-white/70">{formatPrice(tx.partnerShare)}</td>
                  <td className="p-4 text-sm text-right font-mono text-green-400">{formatPrice(tx.platformCommission)}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/50 italic">Aucune transaction trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
