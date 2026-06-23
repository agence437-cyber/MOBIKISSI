/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Handshake, AlertCircle, Info, Sparkles, Check, ChevronRight, FileText, Landmark
} from 'lucide-react';
import { User, Assistance, SystemSetting } from '../types';

interface ClientAssistanceProps {
  client: User;
  clientAssistances: Assistance[];
  settings: SystemSetting;
  onSubmitAssistance: (amount: number, domain: any, notes: string) => void;
  selectedTheme: any;
  currentScreen: string;
  onNavigateTo: (screen: string) => void;
  onGoBack: () => void;
}

export default function ClientAssistance({
  client,
  clientAssistances,
  settings,
  onSubmitAssistance,
  selectedTheme,
  currentScreen,
  onNavigateTo,
  onGoBack
}: ClientAssistanceProps) {
  const isEligible = client.seniorityWeeks >= 2;
  const [amount, setAmount] = useState(15000);
  const [domain, setDomain] = useState<'Commerce' | 'Agriculture' | 'Boutique' | 'Restaurant' | 'Élevage' | 'Transport' | 'Services' | 'Projets personnels'>('Commerce');
  const [notes, setNotes] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<Assistance | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 5000 || amount > 200000) return;
    onSubmitAssistance(amount, domain, notes);
    setSubmitSuccess(true);
    setNotes('');
    setTimeout(() => {
      setSubmitSuccess(false);
      onGoBack();
    }, 2000);
  };

  // Screen routing within assistance module
  if (currentScreen === 'assistance-dossier' && selectedDossier) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-3xl mx-auto space-y-6 py-4 px-1 text-left"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setSelectedDossier(null); onGoBack(); }}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Fiche d'octroi de tontine</span>
            <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Détails de mon Assistance</h2>
          </div>
        </div>

        {/* Overview loan card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mobikissi Business Assistance</p>
              <h3 className="text-sm font-black text-slate-905 dark:text-white mt-0.5">Secteur : {selectedDossier.domain}</h3>
            </div>
            <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${selectedDossier.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-orange-50 text-orange-700 border border-orange-200/50'}`}>
              {selectedDossier.status === 'approved' ? 'Validé & Actif' : 'En attente'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div>
              <p className="text-[10px] text-slate-400 mb-0.5">Montant octroyé</p>
              <p className="font-mono text-sm text-slate-900 dark:text-white font-black">{selectedDossier.amount.toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-0.5">Taux d'intérêt tontine</p>
              <p className="font-mono text-sm text-violet-600 font-black">{selectedDossier.interestRate}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-0.5">Total à rembourser (Intérêts inclus)</p>
              <p className="font-mono text-sm text-slate-900 dark:text-white font-black">{selectedDossier.repaymentAmount.toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-0.5">Montant déjà remboursé</p>
              <p className="font-mono text-sm text-emerald-600 font-black">{selectedDossier.repaidAmount.toLocaleString()} FCFA</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reste dû à rembourser</span>
            <span className="font-mono text-sm font-black text-red-600">
              {(selectedDossier.repaymentAmount - selectedDossier.repaidAmount).toLocaleString()} FCFA
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Suivi des Amortissements</h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            Le remboursement d'assistance tontinière est prélevé de manière sécurisée de vos pointages ou acquitté au comptant à l'agence physique de Massina.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-start gap-3">
            <Info className="w-4.5 h-4.5 text-violet-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Remboursements par prélèvement progressif de 22% sur les cartes d'épargne actives à chaque clôture de grille de 31 cases.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6 py-4 px-1 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Centre financier solidaire</span>
            <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Mes demandes d'Assistance</h2>
          </div>
        </div>

        {isEligible && (
          <button
            onClick={() => onNavigateTo('assistance-demande')}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
          >
            Nouveau dossier
          </button>
        )}
      </div>

      {currentScreen === 'assistance-demande' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Demander une Assistance Financière</h3>
            
            {submitSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4" /> Votre dossier a été soumis avec succès à l'agence Mobikissi !
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Montant demandé ({amount.toLocaleString()} FCFA)</label>
              <input 
                type="range" 
                min={5000} 
                max={200000} 
                step={5000}
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold">
                <span>5 000 FCFA</span>
                <span>200 000 FCFA</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Activité Financée</label>
              <select 
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="Commerce">Commerce Général</option>
                <option value="Agriculture">Agriculture / Elevage</option>
                <option value="Boutique">Boutique / Kiosque</option>
                <option value="Restaurant">Restaurant / Alimentation</option>
                <option value="Élevage">Élevage / Volaille</option>
                <option value="Transport">Transport / Moto-taxi</option>
                <option value="Services">Services (Salon de coiffure, etc.)</option>
                <option value="Projets personnels">Autres projets d'activité</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Description brève de l'investissement</label>
              <textarea 
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Exemple : Achat de 2 sacs de braise et stocks de manioc pour revente au marché..."
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-4 rounded-xl text-center shadow-md uppercase tracking-wider transition-all"
          >
            Soumettre le dossier d'Assistance
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Eligibility alert panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${isEligible ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} shrink-0`}>
              <Landmark className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-black text-slate-905 dark:text-white uppercase">Éligibilité aux microcrédits</h3>
              <p className="text-slate-400 font-semibold leading-relaxed text-[11px]">
                Pour soutenir votre activité économique, Mobikissi accorde des assistances financières sans paperasse complexe.
              </p>
              <div className="pt-2 font-mono text-[10px] font-bold">
                Statut : {isEligible ? (
                  <span className="text-emerald-600">✓ Éligible (Adhésion active de {client.seniorityWeeks} semaines)</span>
                ) : (
                  <span className="text-amber-600">❌ Non éligible (Requis : minimum 2 semaines d'adhésion active. Ancienneté actuelle : {client.seniorityWeeks} sem.)</span>
                )}
              </div>
            </div>
          </div>

          {/* Previous/active assistances lists */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Mes Dossiers d'Assistance</h3>
            
            {clientAssistances.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Handshake className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs italic text-slate-400 font-semibold">Aucun dossier d'assistance n'a été créé pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientAssistances.map((ast) => (
                  <div 
                    key={ast.id}
                    onClick={() => {
                      setSelectedDossier(ast);
                      onNavigateTo('assistance-dossier');
                    }}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-500/30 transition-all text-xs font-semibold flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                        <Handshake className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold uppercase text-[11px] block text-slate-900 dark:text-white">{ast.domain}</span>
                        <span className="block text-[9px] font-mono text-slate-400 font-medium mt-0.5">Montant demandé : {ast.amount.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${ast.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                        {ast.status === 'approved' ? 'Validé' : 'En attente'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
