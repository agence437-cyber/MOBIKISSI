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
      paymentMethod: 'cash',
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
      
      {/* EN-TÊTE MOBILE SIMPLIFIÉE */}
      <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 mb-5 px-4 sm:px-6 lg:px-8 py-3 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => navigateTo('accueil')} className="text-left cursor-pointer">
            <span className="block text-[9px] uppercase font-black tracking-[0.2em] text-orange-550">Mon épargne</span>
            <span className="block text-base font-black text-slate-900 dark:text-white">MOBIKISSI</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => navigateTo('notifications')} className="relative p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-100 shadow-sm" title="Notifications">
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-orange-600 text-white text-[8px] font-black flex items-center justify-center">{unreadNotifsCount}</span>}
            </button>
            <button onClick={() => navigateTo('compte')} className="w-10 h-10 rounded-full bg-orange-500 text-white font-black text-sm shadow-sm ring-2 ring-orange-100 dark:ring-orange-950" title="Mon profil">
              {client.name.trim().slice(0, 1).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

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

      {/* NAVIGATION MOBILE : 4 ACTIONS ESSENTIELLES */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
        <div className="max-w-md mx-auto grid grid-cols-4 px-2">
          {[
            { id: 'accueil', label: 'Accueil', icon: Home, active: currentScreen === 'accueil' || currentScreen === 'notifications' || currentScreen === 'recherche' },
            { id: 'cartes', label: 'Épargne', icon: CreditCard, active: currentScreen.startsWith('cartes') },
            { id: 'transactions', label: 'Activité', icon: ArrowRightLeft, active: currentScreen.startsWith('transactions') || currentScreen === 'retrait' || currentScreen === 'retrait-confirmation' },
            { id: 'assistance', label: 'Aide', icon: Handshake, active: currentScreen.startsWith('assistance') || currentScreen === 'compte-support' }
          ].map(({ id, label, icon: Icon, active }) => (
            <button key={id} onClick={() => navigateTo(id)} className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all ${active ? 'text-orange-600' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`p-1 rounded-lg ${active ? 'bg-orange-100 dark:bg-orange-500/15' : ''}`}><Icon className="w-5 h-5 stroke-[2.3]" /></span>
              <span className="text-[9px] font-extrabold">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
