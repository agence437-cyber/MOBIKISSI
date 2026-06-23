/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Search, CreditCard, ArrowUpRight, 
  ArrowDownLeft, HelpCircle, History, Sparkles 
} from 'lucide-react';
import { Card, Transaction, Assistance } from '../types';

interface ClientRechercheProps {
  cards: Card[];
  transactions: Transaction[];
  assistances: Assistance[];
  selectedTheme: any;
  onGoBack: () => void;
  onSelectCard: (cardId: string) => void;
  onSelectTx: (txId: string) => void;
  onSelectAssistance: (astId: string) => void;
}

export default function ClientRecherche({
  cards,
  transactions,
  assistances,
  selectedTheme,
  onGoBack,
  onSelectCard,
  onSelectTx,
  onSelectAssistance
}: ClientRechercheProps) {
  const [query, setQuery] = useState('');

  // Filtering data in real-time
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { cards: [], txs: [], assistances: [] };

    const filteredCards = cards.filter(c => 
      c.cardNumber.toLowerCase().includes(q) || 
      c.amount.toString().includes(q)
    );

    const filteredTxs = transactions.filter(t => 
      t.id.toLowerCase().includes(q) || 
      t.amount.toString().includes(q) || 
      t.type.toLowerCase().includes(q) || 
      t.agentName.toLowerCase().includes(q)
    );

    const filteredAssistances = assistances.filter(a => 
      a.id.toLowerCase().includes(q) || 
      a.amount.toString().includes(q) || 
      a.domain.toLowerCase().includes(q) || 
      (a.notes && a.notes.toLowerCase().includes(q))
    );

    return {
      cards: filteredCards,
      txs: filteredTxs,
      assistances: filteredAssistances
    };
  }, [query, cards, transactions, assistances]);

  const totalResultsCount = searchResults.cards.length + searchResults.txs.length + searchResults.assistances.length;

  return (
    <motion.div
      id="screen-global-search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6 py-4 px-1"
    >
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onGoBack}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Moteur de recherche personnel</span>
          <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none">Recherche Globale</h2>
        </div>
      </div>

      {/* Big Search Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Saisissez un montant, n° de carte, agent ou type d'opération..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-2xl focus:ring-2 focus:ring-orange-500 font-medium dark:text-white text-xs"
            autoFocus
          />
          <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Results Rendering */}
      {!query ? (
        <div className="text-center py-16 text-slate-400 space-y-2">
          <Search className="w-10 h-10 mx-auto opacity-30 stroke-[1.5]" />
          <p className="text-xs italic font-medium">Entrez un mot-clé pour lancer la recherche.</p>
        </div>
      ) : totalResultsCount === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <HelpCircle className="w-10 h-10 mx-auto opacity-30 stroke-[1.5]" />
          <p className="text-xs italic font-medium">Aucun résultat trouvé pour "{query}".</p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{totalResultsCount} résultat(s) correspondant(s)</p>

          {/* 1. Cards matching */}
          {searchResults.cards.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-2">
                <CreditCard className="w-4 h-4 text-orange-500" /> Cartes de pointage ({searchResults.cards.length})
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
                {searchResults.cards.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCard(c.id)}
                    className="w-full py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-850/50 flex justify-between items-center px-2 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-850 dark:text-white block">{c.cardNumber}</span>
                      <span className="text-[10px] text-slate-400 block uppercase">Carte de {c.amount.toLocaleString()} FCFA • {c.filledCells.length}/31 Cases</span>
                    </div>
                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                      c.isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20'
                    }`}>
                      {c.isCompleted ? 'Clôturée' : 'Active'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Transactions matching */}
          {searchResults.txs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-2">
                <History className="w-4 h-4 text-emerald-500" /> Transactions & Reçus ({searchResults.txs.length})
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
                {searchResults.txs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTx(t.id)}
                    className="w-full py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-850/50 flex justify-between items-center px-2 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="flex gap-3 items-center">
                      <div className={`p-2 rounded-xl ${
                        t.type === 'depot' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                      }`}>
                        {t.type === 'depot' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-850 dark:text-white block uppercase">
                          {t.type === 'depot' ? 'Pointage Versement' : t.type === 'retrait' ? 'Retrait Espèces' : "Frais d'Adhésion"}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Agent : {t.agentName} • {new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-black block text-sm ${
                        t.type === 'depot' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {t.type === 'depot' ? '+' : '-'} {t.amount.toLocaleString()} FCFA
                      </span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">{t.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Assistances matching */}
          {searchResults.assistances.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Dossiers de Prêt & Assistance ({searchResults.assistances.length})
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
                {searchResults.assistances.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSelectAssistance(a.id)}
                    className="w-full py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-850/50 flex justify-between items-center px-2 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-850 dark:text-white block">Soutien {a.domain}</span>
                      <span className="text-[10px] text-slate-450 block truncate max-w-sm">{a.notes || 'Aucun détail fourni'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black block text-sm text-indigo-600 dark:text-indigo-400">
                        {a.amount.toLocaleString()} FCFA
                      </span>
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full inline-block ${
                        a.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        a.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        a.status === 'refunded' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
