/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Phone, MapPin, Mail, Send, 
  HelpCircle, BookOpen, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { SystemSetting } from '../types';

interface ClientSupportProps {
  settings: SystemSetting;
  selectedTheme: any;
  onGoBack: () => void;
}

const FAQ_ITEMS = [
  {
    q: "Qu'est-ce que la règle du 31ème carreau chez MOBIKISSI ?",
    a: "Chaque carte comporte 30 carreaux d'épargne client et un 31ème carreau. Pour financer les agents recouvreurs, la gestion locale, et assurer la sécurité physique de vos fonds à Massina, le versement de ce 31ème carreau est prélevé à titre de frais de fonctionnement de tontine lors de la clôture de la carte."
  },
  {
    q: "Combien de temps faut-il pour qu'un pointage soit validé ?",
    a: "Lorsque votre agent recouvreur enregistre votre versement en face-à-face, l'opération apparaît instantanément comme 'En attente'. Notre gestionnaire de caisse valide les fonds en fin de journée, ce qui rend le pointage définitivement validé et débloque vos badges."
  },
  {
    q: "Suis-je éligible aux financements d'assistance pro ?",
    a: "Tout adhérent actif disposant d'au moins 2 semaines (14 jours) de pointages réguliers consécutifs est pleinement éligible pour solliciter un microcrédit d'assistance professionnelle allant de 5 000 FCFA à 200 000 FCFA maximum."
  },
  {
    q: "Que faire en cas d'erreur de pointage d'un agent ?",
    a: "En cas de litige ou d'erreur de pointage sur votre carte, utilisez notre formulaire de contact ci-dessous ou rendez-vous directement à notre agence physique de Massina. Les corrections de pointage sont auditées et sécurisées."
  }
];

export default function ClientSupport({
  settings,
  selectedTheme,
  onGoBack
}: ClientSupportProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    setSubmitSuccess(true);
    setSubject('');
    setMessage('');
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  return (
    <motion.div
      id="screen-client-support"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
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
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Centre d'accompagnement</span>
          <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none">Aide & Support Client</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Contacts and FAQ (Col 1 to 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contacts Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4.5 h-4.5 text-orange-500" />
              Contacts Officiels de Massina
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Adresse Physique</span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  {settings.address || "Massina PK, Brazzaville"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Téléphones d'urgence</span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {settings.phone1 || "+242 06 111 2222"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">E-mail Officiel</span>
                <span className="flex items-center gap-1.5 text-[11px] truncate">
                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{settings.email || "contact@mobikissi.cg"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive FAQs list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-orange-500" />
              Foire Aux Questions (FAQ)
            </h3>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => (
                <div 
                  key={index} 
                  className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaqIndex(activeFaqIndex === index ? null : index)}
                    className="w-full p-4 text-left text-xs font-black text-slate-800 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-850/50 flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span className="text-slate-400 font-mono text-sm">{activeFaqIndex === index ? '−' : '+'}</span>
                  </button>
                  
                  {activeFaqIndex === index && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Contact ticket form (Col 8 to 12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4.5 h-4.5 text-orange-500" />
              Ouvrir un ticket d'aide
            </h3>
            
            <p className="text-xs text-slate-450 leading-relaxed font-semibold">
              Remplissez ce formulaire d'assistance pour toute réclamation. Un conseiller TO SOLOLA prendra en charge votre dossier sous un délai moyen de 3 heures.
            </p>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Sujet du litige</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Rectifier un pointage de carte"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Message d'explications</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Veuillez fournir le numéro de carte, le montant et la date de l'incident..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium dark:text-white"
                />
              </div>

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex gap-2 items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Ticket transmis ! Nous reviendrons vers vous sous 3h.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Soumettre ma réclamation
              </button>
            </form>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
