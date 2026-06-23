/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRightLeft, ChevronLeft, Calendar, FileText, 
  Printer, Share2, ShieldCheck, HelpCircle, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import { User, Transaction } from '../types';

interface ClientTransactionsProps {
  client: User;
  clientTransactions: Transaction[];
  selectedTheme: any;
  currentScreen: string;
  onNavigateTo: (screen: string) => void;
  onGoBack: () => void;
  selectedTxId: string | undefined;
  onSelectTxId: (id: string) => void;
}

export default function ClientTransactions({
  client,
  clientTransactions,
  selectedTheme,
  currentScreen,
  onNavigateTo,
  onGoBack,
  selectedTxId,
  onSelectTxId
}: ClientTransactionsProps) {

  const [filterType, setFilterType] = useState<'all' | 'depot' | 'retrait'>('all');

  // Filtered transactions for Screen 4
  const filteredTransactions = useMemo(() => {
    return clientTransactions.filter(t => {
      if (filterType === 'all') return true;
      return t.type === filterType;
    });
  }, [clientTransactions, filterType]);

  // Find selected transaction
  const txId = selectedTxId || (clientTransactions[0]?.id);
  const selectedTx = useMemo(() => clientTransactions.find(t => t.id === txId), [clientTransactions, txId]);

  // SCREEN 5: PHYSICAL TICKETING RECEIPT DETAIL
  if (currentScreen === 'transactions-reçu' && selectedTx) {
    return (
      <motion.div
        id="screen-reçu"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto space-y-6 py-4 px-1"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Reçu de Caisse Officiel</span>
            <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Détail du Reçu</h2>
          </div>
        </div>

        {/* Real Physical Ticket aesthetic card */}
        <div className="bg-white text-slate-900 border-2 border-dashed border-slate-300 rounded-3xl p-6 shadow-md space-y-6 relative overflow-hidden font-mono">
          
          {/* Top circle punches for physical aesthetic */}
          <div className="absolute top-0 left-0 right-0 flex justify-around -translate-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-200" />
            ))}
          </div>

          <div className="text-center pt-4 space-y-1">
            <span className="text-base font-black tracking-widest uppercase">MOBIKISSI TONTI</span>
            <span className="text-[9px] text-slate-400 block font-bold">Agence physique : Massina</span>
            <div className="h-px bg-slate-200 my-3" />
          </div>

          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex justify-between">
              <span>RÉFÉRENCE :</span>
              <span className="font-extrabold">{selectedTx.id}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE :</span>
              <span>{new Date(selectedTx.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span>TYPE OPÉRATION :</span>
              <span className="uppercase text-orange-600 font-black">{selectedTx.type}</span>
            </div>
            <div className="flex justify-between">
              <span>AGENT COLLECTEUR :</span>
              <span className="uppercase">{selectedTx.agentName || 'Système'}</span>
            </div>
            <div className="flex justify-between">
              <span>ZONE COLLECTE :</span>
              <span className="uppercase">{selectedTx.zone || 'Centrale'}</span>
            </div>
            <div className="flex justify-between">
              <span>STATUT DE CAISSE :</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                selectedTx.status === 'validated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedTx.status}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-200 my-4" />

          <div className="text-center space-y-1.5 py-2">
            <span className="text-[10px] text-slate-400 font-extrabold block">MONTANT DE L'OPÉRATION</span>
            <span className="text-2xl font-black text-slate-950 tracking-tight block">
              {selectedTx.amount.toLocaleString()} FCFA
            </span>
          </div>

          <div className="h-px bg-slate-200 my-4" />

          <div className="text-center text-[10px] font-bold text-slate-450 uppercase leading-relaxed pt-2">
            ✓ MOBIKISSI s'engage pour l'alphabétisation financière et la sécurité physique de vos épargnes tontinières à Massina.
          </div>
        </div>

        {/* Receipt controllers */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => window.print()}
            className="p-3.5 bg-slate-900 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> IMPRIMER LE REÇU
          </button>
          <button
            onClick={() => alert("Lien de partage du reçu copié dans votre presse-papiers !")}
            className="p-3.5 bg-slate-100 text-slate-800 font-black text-xs rounded-xl hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> PARTAGER LE REÇU
          </button>
        </div>
      </motion.div>
    );
  }

  // SCREEN 11: REÇUS CATALOG LIST
  if (currentScreen === 'transactions-reçus-list') {
    const validatedReceipts = clientTransactions.filter(t => t.status === 'validated');

    return (
      <motion.div
        id="screen-reçus-catalog"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-6 py-4 px-1"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Archivage numérique</span>
            <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Catalogue de mes reçus</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          {validatedReceipts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs text-slate-400 italic font-semibold">Aucun reçu validé disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {validatedReceipts.map((tx) => (
                <div 
                  key={tx.id}
                  onClick={() => { onSelectTxId(tx.id); onNavigateTo('transactions-reçu'); }}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center font-black">R</div>
                    <div>
                      <span className="text-[11px] font-black text-slate-850 dark:text-white block uppercase">Reçu #{tx.id.slice(0, 8)}</span>
                      <span className="text-[9px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-850 dark:text-white font-black">{tx.amount.toLocaleString()} FCFA</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // SCREEN 4: HISTORIQUE DES OPERATIONS (DEFAULT)
  return (
    <motion.div
      id="screen-historique"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 py-4 px-1"
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Suivi d'activité financier</span>
          <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Historique des opérations</h2>
        </div>
        <button
          onClick={() => onNavigateTo('transactions-reçus-list')}
          className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-all"
        >
          <FileText className="w-4 h-4" />
          Mes Reçus
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-850 p-1 rounded-2xl max-w-sm">
        {([
          { id: 'all', label: 'Tous' },
          { id: 'depot', label: 'Versements' },
          { id: 'retrait', label: 'Retraits' }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`flex-1 py-1.5 text-center text-[10px] uppercase font-black rounded-xl transition-all cursor-pointer ${
              filterType === tab.id 
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' 
                : 'text-slate-450 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Operations Ledger Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {filteredTransactions.length === 0 ? (
          <p className="text-center py-12 text-xs italic text-slate-400 font-semibold">Aucune opération trouvée.</p>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id}
                onClick={() => { onSelectTxId(tx.id); onNavigateTo('transactions-reçu'); }}
                className="flex justify-between items-center p-3.5 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-2xl border border-slate-100 dark:border-slate-850 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-xs font-black ${
                    tx.type === 'depot' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {tx.type === 'depot' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-850 dark:text-white block capitalize">{tx.type}</span>
                    <span className="text-[9px] font-mono text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-black ${
                    tx.type === 'depot' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {tx.type === 'depot' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                  </span>
                  <span className={`block text-[8px] uppercase font-black font-semibold mt-0.5 ${
                    tx.status === 'validated' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
