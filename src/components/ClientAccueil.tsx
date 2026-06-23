/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, ArrowUpRight, ArrowDownLeft, Landmark, 
  HelpCircle, ShieldCheck, HeartHandshake, AlertCircle, ChevronRight,
  TrendingUp, Award, Calendar, Bell, Search
} from 'lucide-react';
import { User, Card, Transaction } from '../types';

interface ClientAccueilProps {
  client: User;
  clientCards: Card[];
  clientTransactions: Transaction[];
  selectedTheme: any;
  onNavigateTo: (screen: string) => void;
  onSelectCardId: (id: string) => void;
  onSelectTxId: (id: string) => void;
  unreadNotifsCount: number;
}

export default function ClientAccueil({
  client,
  clientCards,
  clientTransactions,
  selectedTheme,
  onNavigateTo,
  onSelectCardId,
  onSelectTxId,
  unreadNotifsCount
}: ClientAccueilProps) {
  
  const activeCards = clientCards.filter(c => !c.isCompleted);
  const completedCards = clientCards.filter(c => c.isCompleted);
  
  // Quick stats
  const totalSaved = clientCards.reduce((acc, c) => acc + (c.filledCells.length * c.amount), 0);
  const currentStreak = client.streakDays || 0;

  // Recent 3 transactions
  const recentTransactions = clientTransactions.slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* 1. PROFESSIONAL PREMIUM WALLET BALANCE CARD */}
      <motion.div 
        id="balance-card"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 shadow-sm border border-slate-800 relative overflow-hidden"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Solde d'Épargne Disponible</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {client.balance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-orange-550">FCFA</span>
            </div>
          </div>
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-300">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Compte Actif
          </div>
        </div>

        {/* Mini statistics row */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/5 text-xs font-semibold text-slate-400">
          <div>
            <span className="block text-[9px] uppercase font-black text-slate-500">Cumul Épargné</span>
            <span className="text-sm font-black font-mono text-slate-200 mt-0.5 block">{totalSaved.toLocaleString()} FCFA</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-black text-slate-500">Série pointage</span>
            <span className="text-sm font-black font-mono text-slate-200 mt-0.5 block flex items-center gap-1">
              🔥 {currentStreak} j
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-black text-slate-500">Cartes Actives</span>
            <span className="text-sm font-black font-mono text-slate-200 mt-0.5 block">{activeCards.length} en cours</span>
          </div>
        </div>
      </motion.div>

      {/* 2. DYNAMIC BUSINESS BADGES SHOWCASE */}
      {client.badges && client.badges.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-600" /> Mes distinctions de commerçant
          </span>
          <div className="flex flex-wrap gap-2">
            {client.badges.map((badge) => {
              const bMap: Record<string, { label: string; icon: string; bg: string; text: string }> = {
                'milestone-debutant': { label: 'Adhérent Motivé', icon: '🌱', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-800 dark:text-emerald-400' },
                'milestone-active': { label: 'Épargnant Pilier', icon: '⚡', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-800 dark:text-amber-400' },
                'milestone-champion': { label: 'Champion tontine', icon: '🏆', bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-800 dark:text-orange-400' },
                'milestone-investor': { label: 'Commerçant Pro', icon: '💼', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-800 dark:text-purple-400' },
                'milestone-literate': { label: 'Sage Financier', icon: '🎓', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400' }
              };
              const meta = bMap[badge] || { label: badge, icon: '⭐', bg: 'bg-slate-50', text: 'text-slate-700' };

              return (
                <span 
                  key={badge} 
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${meta.bg} ${meta.text}`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. QUICK GRID NAVIGATION (EACH CLICK OPENS NEW SCREEN) */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigateTo('cartes')}
          className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800 hover:border-orange-500/50 p-5 rounded-3xl text-left shadow-xs transition-all cursor-pointer space-y-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center text-orange-600">
            <CreditCard className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase leading-none">Mes Cartes</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">Consulter mon carnet de pointages</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTo('transactions')}
          className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800 hover:border-orange-500/50 p-5 rounded-3xl text-left shadow-xs transition-all cursor-pointer space-y-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase leading-none">Historique</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">Relevés de versements & reçus</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTo('retrait')}
          className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800 hover:border-orange-500/50 p-5 rounded-3xl text-left shadow-xs transition-all cursor-pointer space-y-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center text-blue-600">
            <Landmark className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase leading-none">Retirer</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">Guichet de retrait d'espèces</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTo('assistance')}
          className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800 hover:border-orange-500/50 p-5 rounded-3xl text-left shadow-xs transition-all cursor-pointer space-y-3.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center text-purple-600">
            <HeartHandshake className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase leading-none">Financements</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">Soutien & prêts solidaires</span>
          </div>
        </button>
      </div>

      {/* 4. RECENT ACTIVITY LIST (LEDGER SUMMARY) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-3">
          <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">Activité Récente</h3>
          <button 
            onClick={() => onNavigateTo('transactions')}
            className="text-[10px] uppercase font-black text-orange-550 hover:underline cursor-pointer"
          >
            Voir tout
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-center py-6 text-xs italic text-slate-400 font-semibold">Aucune transaction enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div 
                key={tx.id}
                onClick={() => { onSelectTxId(tx.id); onNavigateTo('transactions-reçu'); }}
                className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 hover:border-orange-400/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg text-xs font-black ${
                    tx.type === 'depot' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {tx.type === 'depot' ? 'DEP' : 'RET'}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block capitalize">{tx.type}</span>
                    <span className="text-[9px] font-mono text-slate-400">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-black ${
                    tx.type === 'depot' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {tx.type === 'depot' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                  </span>
                  <span className="block text-[8px] uppercase font-black text-slate-400">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
