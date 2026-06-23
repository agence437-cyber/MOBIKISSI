/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Bell, Home, CreditCard, ArrowRightLeft, Handshake, 
  User as UserIcon, LifeBuoy, FileText, Phone, Settings, LogOut,
  AppWindow, BookOpen, ExternalLink, HelpCircle, Search, Trash2, CheckSquare, ChevronLeft
} from 'lucide-react';

import { User, Card, Transaction, Assistance, AppNotification, SystemSetting } from '../types';

import ClientAccueil from './ClientAccueil';
import ClientCards from './ClientCards';
import ClientTransactions from './ClientTransactions';
import ClientAssistance from './ClientAssistance';
import ClientCompte from './ClientCompte';
import ClientRetrait from './ClientRetrait';
import ClientSupport from './ClientSupport';
import ClientRecherche from './ClientRecherche';

// Google Workspace Hooks & Services
import { initAuth, googleSignIn, logout, getAccessToken } from '../workspaceAuth';
import { backupToGoogleDrive, createFinancialCommitmentDoc, sendGmailSummary } from '../workspaceServices';

interface ClientDashboardProps {
  client: User;
  cards: Card[];
  transactions: Transaction[];
  assistances: Assistance[];
  notifications: AppNotification[];
  settings: SystemSetting;
  selectedTheme: any;
  onSubmitAssistance: (amount: number, domain: any, notes: string) => void;
  onSimulatePointing: (cardId: string, cellIndex: number) => void;
  onMarkArticleRead: (clientId: string, articleId: string) => void;
  onUpdateUser?: (clientId: string, clientData: any) => void;
  onCreateCard?: (clientId: string, amount: number) => void;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export default function ClientDashboard({
  client,
  cards,
  transactions,
  assistances,
  notifications,
  settings,
  selectedTheme,
  onSubmitAssistance,
  onSimulatePointing,
  onMarkArticleRead,
  onUpdateUser,
  onCreateCard,
  setTransactions,
  setUsers,
  setNotifications
}: ClientDashboardProps) {
  
  // === DYNAMIC FULL SCREEN STACK ROUTER ===
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    return localStorage.getItem(`client_screen_${client.id}`) || 'accueil';
  });
  const [navHistory, setNavHistory] = useState<string[]>(['accueil']);

  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(() => {
    const activeCards = cards.filter(c => c.clientId === client.id && !c.isCompleted);
    return activeCards[0]?.id;
  });
  const [selectedTxId, setSelectedTxId] = useState<string | undefined>(undefined);

  // Navigation helpers
  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    localStorage.setItem(`client_screen_${client.id}`, screen);
    setNavHistory(prev => [...prev, screen]);
    setHamburgerOpen(false);
  };

  const goBack = () => {
    if (navHistory.length > 1) {
      const updatedHistory = [...navHistory];
      updatedHistory.pop(); // remove current screen
      const prevScreen = updatedHistory[updatedHistory.length - 1];
      setCurrentScreen(prevScreen);
      localStorage.setItem(`client_screen_${client.id}`, prevScreen);
      setNavHistory(updatedHistory);
    } else {
      setCurrentScreen('accueil');
      localStorage.setItem(`client_screen_${client.id}`, 'accueil');
      setNavHistory(['accueil']);
    }
  };

  // Hamburger drawer state
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  // Google Workspace state management
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isWorkspaceLoggingIn, setIsWorkspaceLoggingIn] = useState(false);
  const [workspaceMessage, setWorkspaceMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    initAuth((user) => {
      setGoogleUser(user);
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsWorkspaceLoggingIn(true);
    setWorkspaceMessage({ text: 'Relation client Google en attente...', type: 'pending' });
    try {
      await googleSignIn();
      setWorkspaceMessage({ text: '✓ Connexion Google réussie ! Vos exportations sont prêtes.', type: 'success' });
    } catch (err: any) {
      setWorkspaceMessage({ text: `Échec : ${err?.message || 'Erreur OAuth'}`, type: 'error' });
    } finally {
      setIsWorkspaceLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setWorkspaceMessage({ text: '✓ Services déconnectés.', type: 'success' });
    } catch (err) {
      setWorkspaceMessage({ text: 'Échec de la déconnexion.', type: 'error' });
    }
  };

  // Filter lists specific to current client session
  const clientCards = useMemo(() => cards.filter(c => c.clientId === client.id), [cards, client.id]);
  const clientTransactions = useMemo(() => transactions.filter(t => t.clientId === client.id), [transactions, client.id]);
  const clientAssistances = useMemo(() => assistances.filter(a => a.clientId === client.id), [assistances, client.id]);
  const clientNotifications = useMemo(() => notifications.filter(n => n.userId === client.id), [notifications, client.id]);
  const unreadNotifsCount = useMemo(() => clientNotifications.filter(n => !n.isRead).length, [clientNotifications]);

  const firstCard = clientCards[0];
  const firstCardNum = firstCard?.cardNumber || 'N/A';
  const firstCardAmt = firstCard?.amount || 1000;
  const firstCardFilled = firstCard?.filledCells.length || 0;

  // Cloud Actions
  const handleBackupToDrive = async () => {
    const token = await getAccessToken();
    if (!token) return;
    setWorkspaceMessage({ text: 'Archivage de votre bilan sur Google Drive...', type: 'pending' });
    try {
      const fileId = await backupToGoogleDrive(
        token,
        client.name,
        firstCardNum,
        firstCardAmt,
        firstCardFilled,
        client.balance,
        clientTransactions.length
      );
      setWorkspaceMessage({ text: `✓ Exporté sur Google Drive ! (ID : ${fileId.slice(0, 8)}...)`, type: 'success' });
    } catch (err: any) {
      setWorkspaceMessage({ text: `Erreur Drive : ${err?.message || 'Droits requis'}`, type: 'error' });
    }
  };

  const handleGenerateDocsAgreement = async () => {
    const token = await getAccessToken();
    if (!token) return;
    setWorkspaceMessage({ text: 'Rédaction du contrat sur Google Docs...', type: 'pending' });
    try {
      const docId = await createFinancialCommitmentDoc(
        token,
        client.name,
        client.referralCode || `MOBI-${client.name.substring(0,4).toUpperCase()}-111`,
        client.badges || []
      );
      setWorkspaceMessage({ text: `✓ Contrat généré sur votre Drive.`, type: 'success' });
    } catch (err: any) {
      setWorkspaceMessage({ text: `Erreur Docs : ${err?.message || 'Inconnu'}`, type: 'error' });
    }
  };

  const handleSendGmailSummary = async () => {
    const token = await getAccessToken();
    if (!token) return;
    setWorkspaceMessage({ text: 'Rédaction du relevé par e-mail...', type: 'pending' });
    try {
      await sendGmailSummary(
        token,
        client.email,
        client.name,
        firstCardNum,
        `${firstCardFilled} / 31 cases`,
        client.balance,
        client.streakDays || 0
      );
      setWorkspaceMessage({ text: `✓ Relevé expédié par e-mail à ${client.email}.`, type: 'success' });
    } catch (err: any) {
      setWorkspaceMessage({ text: `Erreur Gmail : ${err?.message || 'Invalide'}`, type: 'error' });
    }
  };

  // Dedicated withdrawal request processor
  const handleRecordWithdrawal = (amount: number) => {
    const newTx: Transaction = {
      id: `tx-retrait-${Date.now()}`,
      type: 'retrait',
      clientId: client.id,
      clientName: client.name,
      amount: amount,
      agentId: 'u-system',
      agentName: 'Guichet Automatique',
      createdAt: new Date().toISOString(),
      status: 'pending',
      zone: client.zone,
      agency: client.agency || 'Massina'
    };

    setTransactions(prev => [newTx, ...prev]);

    // Send notifications locally
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      userId: client.id,
      title: 'Retrait Soumis ⌛',
      message: `Votre demande de retrait de ${amount.toLocaleString()} FCFA est enregistrée. Rendez-vous en caisse pour recevoir vos espèces !`,
      createdAt: new Date().toISOString(),
      isRead: false,
      type: 'withdrawal'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotifsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === client.id ? { ...n, isRead: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications(prev => prev.filter(n => n.userId !== client.id));
  };

  return (
    <div className="flex flex-col min-h-[85vh] relative pb-24 font-sans">
      
      {/* HEADER SECTION (CLEAN WITH MAGNIFYING GLASS & BELL) */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Trigger */}
          <button 
            onClick={() => setHamburgerOpen(true)}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-800 dark:text-slate-100 cursor-pointer"
            title="Menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <span className="text-[9px] uppercase font-black tracking-widest text-orange-550">Tontine numérique</span>
            <h2 className="text-sm font-black text-slate-850 dark:text-white leading-none">MOBIKISSI BANQUE</h2>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Quick global search trigger */}
          <button 
            onClick={() => navigateTo('recherche')}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Recherche globale"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Fullscreen Notifications Bell Trigger */}
          <button 
            onClick={() => navigateTo('notifications')}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl relative text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Mes notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-bounce border border-white dark:border-slate-800">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* RENDER CURRENT ACTIVE ROUTER VIEW */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* SCREEN 1: TABLEAU DE BORD CLIENT */}
            {currentScreen === 'accueil' && (
              <ClientAccueil 
                client={client}
                clientCards={clientCards}
                clientTransactions={clientTransactions}
                selectedTheme={selectedTheme}
                onNavigateTo={navigateTo}
                onSelectCardId={setSelectedCardId}
                onSelectTxId={setSelectedTxId}
                unreadNotifsCount={unreadNotifsCount}
              />
            )}

            {/* SCREEN 15: RECHERCHE GLOBALE PERSONNELLE */}
            {currentScreen === 'recherche' && (
              <ClientRecherche 
                cards={clientCards}
                transactions={clientTransactions}
                assistances={clientAssistances}
                selectedTheme={selectedTheme}
                onGoBack={goBack}
                onSelectCard={(id) => { setSelectedCardId(id); navigateTo('cartes-detail'); }}
                onSelectTx={(id) => { setSelectedTxId(id); navigateTo('transactions-reçu'); }}
                onSelectAssistance={(id) => { navigateTo('assistance-dossiers'); }}
              />
            )}

            {/* SCREEN 10: FULLSCREEN NOTIFICATIONS VIEW */}
            {currentScreen === 'notifications' && (
              <motion.div
                id="screen-notifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto space-y-6 py-4 px-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={goBack}
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Caisse de tontine</span>
                      <h2 className="text-base font-black text-slate-905 dark:text-white uppercase leading-none font-sans">Mes Notifications</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkNotifsRead}
                      className="text-[10px] font-black uppercase text-orange-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Tout marquer lu
                    </button>
                    <button
                      onClick={handleClearNotifications}
                      className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Effacer
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  {clientNotifications.length === 0 ? (
                    <p className="text-center py-12 text-xs italic text-slate-400 font-semibold">Aucune notification de caisse reçue.</p>
                  ) : (
                    <div className="space-y-3">
                      {clientNotifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-4 rounded-2xl border transition-all text-xs font-semibold flex items-start gap-3.5 ${
                            notif.isRead 
                              ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850 text-slate-500' 
                              : 'bg-orange-50/10 dark:bg-orange-950/10 border-orange-200/20 text-slate-800 dark:text-slate-200 shadow-xs'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' :
                            notif.type === 'withdrawal' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Bell className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-extrabold uppercase text-[10px] block leading-none">{notif.title}</span>
                            <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-350">{notif.message}</p>
                            <span className="block text-[8px] font-mono text-slate-400 font-medium">{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SCREEN 2, 2b, 3: CARDS MODULE */}
            {currentScreen.startsWith('cartes') && (
              <ClientCards 
                client={client}
                clientCards={clientCards}
                allTransactions={transactions}
                settings={settings}
                selectedTheme={selectedTheme}
                onSimulatePointing={onSimulatePointing}
                selectedCardId={selectedCardId}
                currentScreen={currentScreen}
                onNavigateTo={navigateTo}
                onGoBack={goBack}
                onCreateCard={onCreateCard || (() => {})}
                onSelectCardId={setSelectedCardId}
              />
            )}

            {/* SCREEN 4, 5, 11: TRANSACTIONS MODULE */}
            {currentScreen.startsWith('transactions') && (
              <ClientTransactions 
                client={client}
                clientTransactions={clientTransactions}
                selectedTheme={selectedTheme}
                currentScreen={currentScreen}
                onNavigateTo={navigateTo}
                onGoBack={goBack}
                selectedTxId={selectedTxId}
                onSelectTxId={setSelectedTxId}
              />
            )}

            {/* SCREEN 6, 7: GUICHET DE RETRAIT */}
            {currentScreen === 'retrait' && (
              <ClientRetrait 
                client={client}
                completedCards={clientCards.filter(c => c.isCompleted)}
                settings={settings}
                selectedTheme={selectedTheme}
                onNavigateTo={navigateTo}
                onGoBack={goBack}
                onRequestWithdrawal={handleRecordWithdrawal}
              />
            )}

            {/* SCREEN 8, 9: ASSISTANCE MODULE */}
            {currentScreen.startsWith('assistance') && (
              <ClientAssistance 
                client={client}
                clientAssistances={clientAssistances}
                settings={settings}
                onSubmitAssistance={onSubmitAssistance}
                selectedTheme={selectedTheme}
                currentScreen={currentScreen}
                onNavigateTo={navigateTo}
                onGoBack={goBack}
              />
            )}

            {/* SCREEN 12, 13: COMPTE & PARAMETRES */}
            {currentScreen.startsWith('compte') && currentScreen !== 'compte-support' && (
              <ClientCompte 
                client={client}
                onUpdateUser={onUpdateUser}
                selectedTheme={selectedTheme}
                needsAuth={!googleUser}
                isWorkspaceLoggingIn={isWorkspaceLoggingIn}
                googleUser={googleUser}
                workspaceMessage={workspaceMessage}
                handleGoogleLogin={handleGoogleLogin}
                handleGoogleLogout={handleGoogleLogout}
                handleBackupToDrive={handleBackupToDrive}
                handleGenerateDocsAgreement={handleGenerateDocsAgreement}
                handleSendGmailSummary={handleSendGmailSummary}
                currentScreen={currentScreen}
                onNavigateTo={navigateTo}
                onGoBack={goBack}
              />
            )}

            {/* SCREEN 14: AIDE / SUPPORT TECHNICAL PORTAL */}
            {currentScreen === 'compte-support' && (
              <ClientSupport 
                settings={settings}
                selectedTheme={selectedTheme}
                onGoBack={goBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* === MENU LATÉRAL SIDEBAR DRAWER (☰ Hamburger) === */}
      <AnimatePresence>
        {hamburgerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setHamburgerOpen(false)}
              className="fixed inset-0 bg-slate-950 backdrop-blur-xs"
            />

            {/* Sliding Drawer Container */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Logo top bar */}
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">🪪</span>
                    <div>
                      <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">MOBIKISSI</h3>
                      <span className="text-[8px] font-black text-slate-400">TO SOLOLA FINTECH GROUP</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHamburgerOpen(false)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation Options list */}
                <div className="space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider pl-1 mb-2 font-black">Mon Espace Personnel</span>
                  
                  <button 
                    onClick={() => navigateTo('accueil')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentScreen === 'accueil' ? 'bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Tableau de bord</span>
                  </button>

                  <button 
                    onClick={() => navigateTo('cartes')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentScreen.startsWith('cartes') ? 'bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Mes Cartes d'Épargne</span>
                  </button>

                  <button 
                    onClick={() => navigateTo('transactions')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentScreen.startsWith('transactions') ? 'bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Historique & Relevés</span>
                  </button>

                  <button 
                    onClick={() => navigateTo('retrait')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentScreen === 'retrait' ? 'bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Guichet de Retrait</span>
                  </button>

                  <button 
                    onClick={() => navigateTo('assistance')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentScreen.startsWith('assistance') ? 'bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <Handshake className="w-4 h-4" />
                    <span>Aide & Prêt Commercial</span>
                  </button>

                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider pl-1 pt-4 mb-2 font-black">Support & Caisse</span>

                  <button 
                    onClick={() => navigateTo('transactions-reçus-list')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentScreen === 'transactions-reçus-list' ? 'bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>Mes Reçus de caisse</span>
                  </button>

                  <button 
                    onClick={() => navigateTo('compte-support')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentScreen === 'compte-support' ? 'bg-orange-500/10 text-orange-600' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>FAQ & Assistance technique</span>
                  </button>
                </div>
              </div>

              {/* Drawer bottom information panel */}
              <div className="border-t border-slate-50 dark:border-slate-850 pt-4 space-y-2">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-xs select-none">
                    {client.name.substring(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">{client.name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{client.email}</p>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg text-[9px] text-slate-400 italic">
                  💡 Mode Pilote Actif. Utilisez le sélecteur supérieur de la barre globale pour tester d'autres rôles de staff.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === STICKY BOTTOM NAVIGATION BAR === */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2.5 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center px-2">
          
          <button 
            onClick={() => navigateTo('accueil')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentScreen === 'accueil' || currentScreen === 'recherche' || currentScreen === 'notifications'
                ? 'text-orange-500 scale-105 font-black' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.3]" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans">Accueil</span>
          </button>

          <button 
            onClick={() => navigateTo('cartes')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentScreen.startsWith('cartes') 
                ? 'text-orange-500 scale-105 font-black' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-5 h-5 stroke-[2.3]" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans">Mes Cartes</span>
          </button>

          <button 
            onClick={() => navigateTo('transactions')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentScreen.startsWith('transactions') 
                ? 'text-orange-500 scale-105 font-black' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5 stroke-[2.3]" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans">Transactions</span>
          </button>

          <button 
            onClick={() => navigateTo('retrait')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentScreen === 'retrait' || currentScreen === 'retrait-confirmation'
                ? 'text-orange-500 scale-105 font-black' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <LifeBuoy className="w-5 h-5 stroke-[2.3]" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans">Retrait</span>
          </button>

          <button 
            onClick={() => navigateTo('compte')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentScreen.startsWith('compte') 
                ? 'text-orange-500 scale-105 font-black' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-5 h-5 stroke-[2.3]" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans">Profil</span>
          </button>

        </div>
      </div>

    </div>
  );
}
