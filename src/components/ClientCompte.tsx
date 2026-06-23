/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, 
  Settings, Lock, Edit2, Check, Key, Cloud, ShieldCheck, 
  ArrowUpRight, FileCheck, LogOut, Loader2, Sparkles, ChevronLeft, HelpCircle, ChevronRight
} from 'lucide-react';
import { User as UserType } from '../types';

interface ClientCompteProps {
  client: UserType;
  onUpdateUser?: (clientId: string, clientData: any) => void;
  selectedTheme: any;
  needsAuth: boolean;
  isWorkspaceLoggingIn: boolean;
  googleUser: any;
  workspaceMessage: { text: string; type: string };
  handleGoogleLogin: () => void;
  handleGoogleLogout: () => void;
  handleBackupToDrive: () => void;
  handleGenerateDocsAgreement: () => void;
  handleSendGmailSummary: () => void;
  currentScreen: string;
  onNavigateTo: (screen: string) => void;
  onGoBack: () => void;
}

const AVATAR_TEMPLATES = [
  { id: 'av-1', label: 'Boutiquier', emoji: '🏬', bg: 'bg-orange-100' },
  { id: 'av-2', label: 'Restauratrice', emoji: '🧑‍🍳', bg: 'bg-rose-100' },
  { id: 'av-3', label: 'Maraîcher', emoji: '🥬', bg: 'bg-emerald-100' },
  { id: 'av-4', label: 'Chauffeur', emoji: '🏍️', bg: 'bg-blue-100' },
  { id: 'av-5', label: 'Éleveuse', emoji: '🐔', bg: 'bg-amber-100' },
  { id: 'av-6', label: 'Artisane', emoji: '🧵', bg: 'bg-purple-100' },
  { id: 'av-7', label: 'Épargneur Sage', emoji: '🎓', bg: 'bg-indigo-100' },
  { id: 'av-8', label: 'Commerçante de gros', emoji: '👜', bg: 'bg-pink-100' },
];

export default function ClientCompte({
  client,
  onUpdateUser,
  selectedTheme,
  needsAuth,
  isWorkspaceLoggingIn,
  googleUser,
  workspaceMessage,
  handleGoogleLogin,
  handleGoogleLogout,
  handleBackupToDrive,
  handleGenerateDocsAgreement,
  handleSendGmailSummary,
  currentScreen,
  onNavigateTo,
  onGoBack
}: ClientCompteProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(client.name);
  const [profilePhone, setProfilePhone] = useState(client.phone);
  const [profileEmail, setProfileEmail] = useState(client.email);
  const [profileZone, setProfileZone] = useState(client.zone);
  const [profileAddress, setProfileAddress] = useState(client.agency || 'Massina');
  
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(() => {
    return localStorage.getItem(`avatar_${client.id}`) || 'av-1';
  });

  const [passOld, setPassOld] = useState('');
  const [passNew, setPassNew] = useState('');
  const [passToast, setPassToast] = useState('');

  const currentAvatar = AVATAR_TEMPLATES.find(a => a.id === customAvatar) || AVATAR_TEMPLATES[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(client.id, {
        name: profileName,
        phone: profilePhone,
        email: profileEmail,
        zone: profileZone,
        agency: profileAddress
      });
      setEditingProfile(false);
    }
  };

  const handleSaveAvatar = (id: string) => {
    setCustomAvatar(id);
    localStorage.setItem(`avatar_${client.id}`, id);
    setEditingAvatar(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOld || !passNew) return;
    setPassToast("✓ Mot de passe mis à jour de manière sécurisée.");
    setPassOld('');
    setPassNew('');
    setTimeout(() => {
      setPassToast('');
    }, 3000);
  };

  // SCREEN 13: PARAMÈTRES DU COMPTE & GOOGLE INTEGRATIONS
  if (currentScreen === 'compte-parametres') {
    return (
      <motion.div
        id="screen-parametres"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6 py-4 px-1"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateTo('compte')}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Securité & Cloud</span>
            <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none">Paramètres du compte</h2>
          </div>
        </div>

        {/* Change password Form block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-2">
            <Lock className="w-4 h-4 text-orange-500" /> Réinitialiser le mot de passe
          </h3>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passOld}
                  onChange={(e) => setPassOld(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-xs dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passNew}
                  onChange={(e) => setPassNew(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-xs dark:text-white"
                />
              </div>
            </div>

            {passToast && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
                {passToast}
              </div>
            )}

            <button
              type="submit"
              className="py-2.5 px-5 bg-slate-900 dark:bg-slate-800 text-white font-black text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              Enregistrer le mot de passe
            </button>
          </form>
        </div>

        {/* Google Workspace Cloud Integrations Console */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-50 dark:border-slate-850 pb-3">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Services Tiers</span>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <Cloud className="w-4.5 h-4.5 text-blue-500" /> Intégration Google Workspace
            </h3>
          </div>

          <p className="text-xs text-slate-450 font-semibold leading-relaxed">
            Reliez votre tontine Mobikissi à vos applications Google pour sauvegarder vos relevés sur Drive et recevoir des notifications Gmail.
          </p>

          {needsAuth ? (
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4" /> Activer l'Intégration Google Workspace
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 rounded-xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">✓</div>
                  <div>
                    <span className="text-emerald-850 dark:text-emerald-400 block font-extrabold uppercase text-[10px]">Compte Google lié</span>
                    <span className="text-[10px] text-slate-400">{googleUser?.email || 'Services Connectés'}</span>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="text-[10px] font-black uppercase text-red-650 hover:underline cursor-pointer"
                >
                  Déconnecter
                </button>
              </div>

              {/* Quick Workspace actions console */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleBackupToDrive}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Sauvegarde Drive</span>
                </button>

                <button
                  onClick={handleGenerateDocsAgreement}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Rédiger Contrat Doc</span>
                </button>

                <button
                  onClick={handleSendGmailSummary}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Mail className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Envoyer Relevé Mail</span>
                </button>
              </div>
            </div>
          )}

          {workspaceMessage.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              workspaceMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
              workspaceMessage.type === 'pending' ? 'bg-blue-50 text-blue-800 animate-pulse' : 'bg-rose-50 text-rose-800'
            }`}>
              {workspaceMessage.text}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // SCREEN 12: PROFIL PAGE (DEFAULT)
  return (
    <motion.div
      id="screen-profil"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 py-4 px-1"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Avatar block (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-center space-y-4">
          <div className="relative inline-block mx-auto">
            <div className={`w-24 h-24 rounded-full ${currentAvatar.bg} border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center text-4xl select-none shadow-sm`}>
              {currentAvatar.emoji}
            </div>
            <button
              onClick={() => setEditingAvatar(!editingAvatar)}
              className="absolute bottom-0 right-0 p-2 bg-orange-500 hover:bg-orange-600 rounded-full text-white cursor-pointer border border-white"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-905 dark:text-white leading-tight uppercase">{client.name}</h3>
            <span className="text-[10px] uppercase font-black text-slate-400 mt-1 block">Tontine PK • Épargnant</span>
          </div>

          <div className="pt-3 border-t border-slate-50 dark:border-slate-850 text-left text-xs font-semibold text-slate-500 space-y-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Zone : <strong className="text-slate-850 dark:text-white">{client.zone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>Tel : <strong className="text-slate-850 dark:text-white">{client.phone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="truncate">Email : <strong className="text-slate-850 dark:text-white truncate">{client.email}</strong></span>
            </div>
          </div>
        </div>

        {/* Info modifier and tools block (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Change Avatar Picker block */}
          {editingAvatar && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Choisissez votre avatar d'activité</h4>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_TEMPLATES.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => handleSaveAvatar(av.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      customAvatar === av.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-slate-100 dark:border-slate-800'
                    }`}
                    title={av.label}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 block truncate w-full">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Profile information modifier sheet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Informations d'Adhésion</h4>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="text-[10px] uppercase font-black text-orange-550 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {editingProfile ? 'Fermer' : 'Modifier'}
              </button>
            </div>

            {editingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nom complet</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-xs dark:text-white font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-xs dark:text-white font-extrabold"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-all"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div>
                  <span>Ancienneté certifiée :</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 block text-sm font-extrabold mt-0.5">{client.seniorityWeeks} semaines</span>
                </div>
                <div>
                  <span>Code parrainage :</span>
                  <span className="font-mono text-slate-850 dark:text-slate-200 block text-sm font-extrabold mt-0.5">{client.referralCode || 'Aucun'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick navigations sheet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3.5">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">Contrôles du compte</h4>
            
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTo('compte-parametres')}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex justify-between items-center hover:border-orange-400 transition-all cursor-pointer text-left font-semibold text-xs text-slate-800 dark:text-slate-205"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4.5 h-4.5 text-orange-500" />
                  <div>
                    <span className="font-black uppercase block text-[10px]">Paramètres de sécurité</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">Modifier mot de passe, relier l'API Google Cloud</span>
                  </div>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTo('compte-support')}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex justify-between items-center hover:border-orange-400 transition-all cursor-pointer text-left font-semibold text-xs text-slate-800 dark:text-slate-205"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4.5 h-4.5 text-orange-500" />
                  <div>
                    <span className="font-black uppercase block text-[10px]">Aide & Assistance technique</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">FAQ interactive, tickets de support, contacts d'agence</span>
                  </div>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
