/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowDownToLine, CheckCircle, ShieldAlert, 
  ChevronLeft, Coins, HelpCircle, AlertCircle
} from 'lucide-react';
import { User, Card, SystemSetting } from '../types';

interface ClientRetraitProps {
  client: User;
  completedCards: Card[];
  settings: SystemSetting;
  selectedTheme: any;
  onNavigateTo: (screen: string) => void;
  onGoBack: () => void;
  onRequestWithdrawal: (amount: number) => void;
}

export default function ClientRetrait({
  client,
  completedCards,
  settings,
  selectedTheme,
  onNavigateTo,
  onGoBack,
  onRequestWithdrawal
}: ClientRetraitProps) {
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'confirm'>('form');
  const [amountRequested, setAmountRequested] = useState<number>(() => {
    return Math.min(client.balance, 15000);
  });
  const [selectedCardIdForWithdrawal, setSelectedCardIdForWithdrawal] = useState<string>('');
  const [errorText, setErrorText] = useState('');

  // Calculate potential withdrawal amount based on completed cards
  const totalCompletedCapital = completedCards.reduce((acc, c) => acc + (c.amount * 30), 0);
  const totalMobikissiFees = completedCards.reduce((acc, c) => acc + c.amount, 0);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountRequested <= 0) {
      setErrorText('Le montant doit être supérieur à 0 FCFA.');
      return;
    }
    if (amountRequested > client.balance) {
      setErrorText(`Le montant dépasse votre solde disponible de ${client.balance.toLocaleString()} FCFA.`);
      return;
    }

    // Process withdrawal
    onRequestWithdrawal(amountRequested);
    setWithdrawStep('confirm');
  };

  if (withdrawStep === 'confirm') {
    return (
      <motion.div
        id="screen-retrait-confirmation"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl mx-auto space-y-8 py-4 px-1"
      >
        {/* Header bar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setWithdrawStep('form');
              onNavigateTo('accueil');
            }}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Demande enregistrée</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase">Confirmation de retrait</h2>
          </div>
        </div>

        {/* Success content */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black text-emerald-600 tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Demande en cours d'étude
            </span>
            <h3 className="text-2xl font-black text-slate-905 dark:text-white">Demande Soumise !</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Votre demande d'encaissement d'épargne a été transmise à la Caisse Centrale de Massina avec succès.
            </p>
          </div>

          {/* Receipt Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-left space-y-3 max-w-md mx-auto font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Référence Retrait :</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">#{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Montant sollicité :</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{amountRequested.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Frais Mobikissi appliqués :</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">0 FCFA (Prélevés au pointage)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mode de transfert :</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Espèces en Agence</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800/80 my-2" />
            <div className="flex justify-between text-[11px] font-black uppercase text-slate-900 dark:text-white">
              <span>Net à percevoir :</span>
              <span>{amountRequested.toLocaleString()} FCFA</span>
            </div>
          </div>

          <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 text-xs text-amber-800 dark:text-amber-400 max-w-md mx-auto flex gap-3 items-start text-left font-sans font-medium">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Prochaine étape :</strong> Pour débloquer physiquement ces espèces, veuillez vous rapprocher de votre agent recouvreur attitré ou vous rendre à la caisse de Massina avec votre ID adhérent <strong>{client.id}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => onNavigateTo('accueil')}
              className="flex-1 py-3 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md"
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() => {
                setWithdrawStep('form');
                onNavigateTo('transactions');
              }}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl text-xs transition-all cursor-pointer"
            >
              Consulter l'historique
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id="screen-retrait-guichet"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-6 py-4 px-1"
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
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tontine numérique</span>
          <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none">Guichet de Retrait d'Argent</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Withdrawal Form and rules (Col 1 to 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Account Balance Display Card */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Solde de tontine disponible</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3.5xl font-black font-mono tracking-tight text-white">{client.balance.toLocaleString()}</span>
              <span className="text-sm font-black text-orange-550 font-mono">FCFA</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Fiches clôturées :</span>
                <span className="font-extrabold text-white text-sm">{completedCards.length} cartes</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Zone d'épargne :</span>
                <span className="font-extrabold text-white text-sm">{client.zone}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Saisir le montant du retrait</h3>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Montant à retirer (FCFA)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={client.balance}
                    value={amountRequested}
                    onChange={(e) => {
                      setAmountRequested(Number(e.target.value));
                      setErrorText('');
                    }}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-orange-500 font-mono font-black text-sm dark:text-white"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-450 font-black font-mono">FCFA</span>
                </div>
                {errorText && (
                  <p className="text-rose-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorText}
                  </p>
                )}
              </div>

              {/* Instant Calculation */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs space-y-2 border border-slate-100 dark:border-slate-850/80 font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Montant brut débité :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{amountRequested.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de dossier de retrait :</span>
                  <span className="text-emerald-500 font-bold font-mono">Gratuit</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2 text-slate-900 dark:text-white font-black text-sm">
                  <span>Montant Net Remis :</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{amountRequested.toLocaleString()} FCFA</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={client.balance <= 0}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-100 disabled:to-slate-100 dark:disabled:from-slate-850 dark:disabled:to-slate-850 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                Valider la demande d'encaissement
              </button>
            </form>
          </div>

        </div>

        {/* Right: Article 5 explanations (Col 8 to 12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-3">
              <ShieldAlert className="w-4.5 h-4.5 text-orange-500" />
              Réglementation de retrait (Art. 5)
            </h3>
            
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              Le capital accumulé est reversé à l'adhérent sous déduction des frais de gestion de tontine. Le 31ème versement (dernière case de la fiche) constitue la rémunération réglementaire de MOBIKISSI.
            </p>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 text-xs">
              <div className="border-b border-slate-200 dark:border-slate-800/60 pb-3">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-orange-500" />
                  Exemple 1 : Carte de 500 FCFA
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-slate-500 font-medium">
                  <li>31 cases remplies totalisant <strong className="text-slate-800 dark:text-slate-200">15 500 FCFA</strong>.</li>
                  <li>Part administrative MOBIKISSI : <strong className="text-amber-500">500 FCFA</strong> (31e carreau).</li>
                  <li>Montant Net remis à l'adhérent : <strong className="text-emerald-600 dark:text-emerald-400">15 000 FCFA</strong>.</li>
                </ul>
              </div>

              <div>
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-orange-500" />
                  Exemple 2 : Carte de 1 000 FCFA
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-slate-500 font-medium">
                  <li>31 cases remplies totalisant <strong className="text-slate-800 dark:text-slate-200">31 000 FCFA</strong>.</li>
                  <li>Part administrative MOBIKISSI : <strong className="text-amber-500">1 000 FCFA</strong> (31e carreau).</li>
                  <li>Montant Net remis à l'adhérent : <strong className="text-emerald-600 dark:text-emerald-400">30 000 FCFA</strong>.</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/50 dark:bg-slate-800/40 rounded-xl text-[11px] text-blue-800 dark:text-blue-400 flex gap-2.5 font-medium leading-relaxed">
              <HelpCircle className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong>Besoin de précisions ?</strong> Vous pouvez échanger directement avec la Caisse de Massina ou appeler notre service d'accompagnement téléphonique pour toute interrogation d'Article 5.
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
