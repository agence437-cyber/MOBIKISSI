/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, ChevronLeft, Plus, CheckCircle, 
  Sparkles, HelpCircle, AlertCircle, Coins, ArrowRight, Play
} from 'lucide-react';
import { User, Card, Transaction, SystemSetting } from '../types';

interface ClientCardsProps {
  client: User;
  clientCards: Card[];
  allTransactions: Transaction[];
  settings: SystemSetting;
  selectedTheme: any;
  onSimulatePointing: (cardId: string, cellIndex: number) => void;
  selectedCardId: string | undefined;
  currentScreen: string;
  onNavigateTo: (screen: string) => void;
  onGoBack: () => void;
  onCreateCard: (clientId: string, amount: number) => void;
  onSelectCardId: (id: string) => void;
}

export default function ClientCards({
  client,
  clientCards,
  allTransactions,
  settings,
  selectedTheme,
  onSimulatePointing,
  selectedCardId,
  currentScreen,
  onNavigateTo,
  onGoBack,
  onCreateCard,
  onSelectCardId
}: ClientCardsProps) {

  // Subscription state
  const [subscribeAmount, setSubscribeAmount] = useState<number>(1000);
  const [subscribeMsg, setSubscribeMsg] = useState('');

  // Find selected card
  const selectedId = selectedCardId || (clientCards[0]?.id);
  const selectedCard = useMemo(() => clientCards.find(c => c.id === selectedId), [clientCards, selectedId]);

  // Card transactions
  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return allTransactions.filter(t => t.cardId === selectedCard.id);
  }, [allTransactions, selectedCard]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCard(client.id, subscribeAmount);
    setSubscribeMsg('Félicitations ! Votre nouvelle carte de tontine a bien été émise.');
    setTimeout(() => {
      setSubscribeMsg('');
      onNavigateTo('cartes');
    }, 1500);
  };

  // SCREEN 2b: SOUSCRIPTION NOUVELLE CARTE
  if (currentScreen === 'cartes-nouvelle') {
    const totalProj = subscribeAmount * 30;
    const rule31Cost = subscribeAmount;

    return (
      <motion.div
        id="screen-cartes-nouvelle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6 py-4 px-1"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Émission instantanée</span>
            <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">S'abonner à une carte</h2>
          </div>
        </div>

        <form onSubmit={handleSubscribe} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide">Montant du pointage quotidien (FCFA)</label>
            <select
              value={subscribeAmount}
              onChange={(e) => setSubscribeAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-xs dark:text-white font-extrabold"
            >
              <option value={500}>500 FCFA / jour</option>
              <option value={1000}>1 000 FCFA / jour</option>
              <option value={2000}>2 000 FCFA / jour</option>
              <option value={5000}>5 000 FCFA / jour</option>
            </select>
          </div>

          {/* Rule 31 Information sheet */}
          <div className="p-4 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-200/30 rounded-2xl text-[11px] font-semibold text-slate-500 space-y-2 leading-relaxed">
            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-extrabold uppercase text-[9px] tracking-wider mb-1">
              <Coins className="w-4 h-4" /> La règle du 31ème carreau
            </div>
            <p>
              Chaque carte comporte 30 carreaux d'épargne et un 31ème carreau. Pour couvrir les frais de gestion et assurer la sécurité de vos fonds à Massina, le 31ème versement ({subscribeAmount.toLocaleString()} FCFA) est conservé comme commission lors de la clôture de la carte.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 space-y-2">
            <div className="flex justify-between">
              <span>Durée de pointage :</span>
              <span className="text-slate-850 dark:text-slate-200 font-extrabold">30 jours (+1)</span>
            </div>
            <div className="flex justify-between">
              <span>Capital tontine cible :</span>
              <span className="text-slate-850 dark:text-slate-200 font-extrabold font-mono">{totalProj.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de tontine (carreau 31) :</span>
              <span className="text-slate-850 dark:text-slate-200 font-extrabold font-mono">{rule31Cost.toLocaleString()} FCFA</span>
            </div>
          </div>

          {subscribeMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold text-center">
              {subscribeMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
          >
            Confirmer la souscription
          </button>
        </form>
      </motion.div>
    );
  }

  // SCREEN 3: FICHE D'ÉPARGNE DETAILS BOARD (31-CELL GRID)
  if (currentScreen === 'cartes-detail' && selectedCard) {
    const filledCount = selectedCard.filledCells.length;
    const progress = Math.round((filledCount / 31) * 100);

    return (
      <motion.div
        id="screen-cartes-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto space-y-6 py-4 px-1"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigateTo('cartes')}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Carnet de pointages</span>
              <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Détail de ma carte</h2>
            </div>
          </div>

          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
            selectedCard.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {selectedCard.isCompleted ? 'Carte Complète' : 'En cours'}
          </span>
        </div>

        {/* Card Specifications banner */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-sm space-y-4 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-black uppercase font-mono tracking-wide">{selectedCard.cardNumber}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Valeur quotidienne : <strong className="font-mono text-orange-400">{selectedCard.amount.toLocaleString()} FCFA</strong></p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-slate-300 block">{filledCount} / 31 cases</span>
              <span className="text-[9px] text-slate-400 uppercase font-black block mt-0.5">{progress}% validé</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* INTERACTIVE 31-CELL POINTING GRID CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2.5">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Grille de pointages tontine</h4>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Cliquez sur une case vide pour enregistrer votre versement</span>
            </div>
            <span className="text-[10px] uppercase font-black text-orange-600 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-orange-550" /> Versement Rapide
            </span>
          </div>

          {/* Grid list (31 squares) */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const cellNum = i + 1;
              const isFilled = selectedCard.filledCells.includes(cellNum);
              const isRule31Cell = cellNum === 31;

              return (
                <button
                  key={cellNum}
                  disabled={isFilled || selectedCard.isCompleted}
                  onClick={() => onSimulatePointing(selectedCard.id, cellNum)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs font-mono font-black relative transition-all cursor-pointer ${
                    isFilled 
                      ? isRule31Cell 
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                        : 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : isRule31Cell
                        ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-250 hover:bg-purple-100 text-purple-700 dark:text-purple-450 border-dashed'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-150 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                  title={isRule31Cell ? "31ème carreau : Frais de caisse Mobikissi" : `Carreau d'épargne #${cellNum}`}
                >
                  <span className="text-[10px]">{cellNum}</span>
                  {isFilled && <span className="text-[7px] uppercase font-black absolute bottom-0.5">OK</span>}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600" />
              <span>Versement validé (Dépôt)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-purple-600 border border-purple-700" />
              <span>Carreau 31 (Frais de service)</span>
            </div>
          </div>
        </div>

        {/* Associated pointings timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">Versements sur cette carte</h4>
          {cardTransactions.length === 0 ? (
            <p className="text-center py-6 text-xs italic text-slate-400 font-semibold">Aucun pointage encore effectué.</p>
          ) : (
            <div className="space-y-2.5">
              {cardTransactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex justify-between items-center text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl"
                >
                  <div>
                    <span className="text-slate-800 dark:text-slate-250 block">Versement de pointage</span>
                    <span className="text-[9px] font-mono text-slate-400">{new Date(tx.createdAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <span className="font-mono text-slate-900 dark:text-white font-extrabold">{tx.amount.toLocaleString()} FCFA</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // SCREEN 2: MES CARTES CATALOG LIST (DEFAULT)
  return (
    <motion.div
      id="screen-cartes"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 py-4 px-1"
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Carnet de tontines</span>
          <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Mes Cartes d'Épargne</h2>
        </div>
        <button
          onClick={() => onNavigateTo('cartes-nouvelle')}
          className="py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Carte
        </button>
      </div>

      {clientCards.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <CreditCard className="w-10 h-10 mx-auto opacity-30 text-slate-400 stroke-[1.5]" />
          <p className="text-xs text-slate-400 italic font-semibold mt-2">Vous n'avez souscrit aucune carte d'épargne.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientCards.map((card) => {
            const filledCount = card.filledCells.length;
            const progress = Math.round((filledCount / 31) * 100);

            return (
              <div 
                key={card.id}
                onClick={() => { onSelectCardId(card.id); onNavigateTo('cartes-detail'); }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-orange-500/50 shadow-sm cursor-pointer transition-all space-y-4 relative group"
              >
                <div className="flex justify-between items-start border-b border-slate-50 dark:border-slate-850 pb-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">
                      Tontine journalière
                    </span>
                    <h4 className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 mt-1">{card.cardNumber}</h4>
                  </div>
                  <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                    card.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {card.isCompleted ? 'Complète' : 'En cours'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
                  <div>
                    <span>Pointage :</span>
                    <span className="font-mono text-slate-800 dark:text-slate-205 block text-sm font-extrabold mt-0.5">
                      {card.amount.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div>
                    <span>Cases cochées :</span>
                    <span className="font-mono text-slate-800 dark:text-slate-205 block text-sm font-extrabold mt-0.5">
                      {filledCount} / 31
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-1">
                    <span>Progression</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase text-orange-550 pt-2 group-hover:translate-x-1 transition-all">
                  <span>Afficher la grille de pointages</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
