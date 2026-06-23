/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_SETTINGS, INITIAL_USERS, INITIAL_CARDS, 
  INITIAL_TRANSACTIONS, INITIAL_ASSISTANCES, INITIAL_NOTIFICATIONS, 
  DEFAULT_SALARY_CONFIGS, THEMES_LIST, CONGO_AGENCIES, CONGO_ZONES 
} from './initialData';
import { User, Card, Transaction, Assistance, AppNotification, SystemSetting, SalaryConfig } from './types';
import Navbar from './components/Navbar';
import ClientDashboard from './components/ClientDashboard';
import AgentDashboard from './components/AgentDashboard';
import CaisseDashboard from './components/CaisseDashboard';
import SuperviseurDashboard from './components/SuperviseurDashboard';
import AdminDashboard from './components/AdminDashboard';
import CallCenterDashboard from './components/CallCenterDashboard';
import CreationLoader from './components/CreationLoader';
import { AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Settings, Coins, Palette, Landmark, 
  Layers, MapPin, Phone, Mail, Building, Laptop, Sun, Moon 
} from 'lucide-react';

export default function App() {
  // 1. Core Persistent States from localStorage (Hydrate or Seed default data)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mobikissi_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('mobikissi_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mobikissi_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [assistances, setAssistances] = useState<Assistance[]>(() => {
    const saved = localStorage.getItem('mobikissi_assistances');
    return saved ? JSON.parse(saved) : INITIAL_ASSISTANCES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('mobikissi_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState<SystemSetting>(() => {
    const saved = localStorage.getItem('mobikissi_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [salaryConfigs, setSalaryConfigs] = useState<SalaryConfig[]>(() => {
    const saved = localStorage.getItem('mobikissi_salary_configs');
    return saved ? JSON.parse(saved) : DEFAULT_SALARY_CONFIGS;
  });

  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('mobikissi_active_theme') || 'geometric_balance';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mobikissi_dark_mode') === 'true';
  });

  const [callCenterPermissions, setCallCenterPermissions] = useState(() => {
    const saved = localStorage.getItem('mobikissi_cc_perms');
    return saved ? JSON.parse(saved) : {
      showBalance: true,
      showCards: true,
      createAppointments: true,
      createClaims: true,
      sendSms: true,
      viewAssistances: true,
      viewRefunds: true,
      accessReports: true,
      viewPersonalInfo: true,
      exportData: true
    };
  });

  useEffect(() => {
    localStorage.setItem('mobikissi_cc_perms', JSON.stringify(callCenterPermissions));
  }, [callCenterPermissions]);

  // Current logged-in user in simulator (default to the first Client so it looks gorgeous, then they can switch easily!)
  const [currentUserId, setCurrentUserId] = useState<string>('u-client-1');

  // Multi-step animated queue for premium, dynamic creation loading experience
  const [creationSequence, setCreationSequence] = useState<{
    type: 'client' | 'card';
    data: any;
    onConfirm: () => void;
  } | null>(null);

  // Trigger LocalStorage caches on adjustments
  useEffect(() => {
    localStorage.setItem('mobikissi_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mobikissi_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('mobikissi_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mobikissi_assistances', JSON.stringify(assistances));
  }, [assistances]);

  useEffect(() => {
    localStorage.setItem('mobikissi_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('mobikissi_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mobikissi_salary_configs', JSON.stringify(salaryConfigs));
  }, [salaryConfigs]);

  useEffect(() => {
    localStorage.setItem('mobikissi_active_theme', selectedThemeId);
  }, [selectedThemeId]);

  useEffect(() => {
    localStorage.setItem('mobikissi_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Extract selected theme object
  const activeTheme = THEMES_LIST.find(t => t.id === selectedThemeId) || THEMES_LIST[0];
  const currentUserObj = users.find(u => u.id === currentUserId) || users[0];

  // Helper function to create notification
  const addNotification = (userId: string, title: string, message: string, type: 'deposit' | 'withdrawal' | 'assistance' | 'info') => {
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      userId,
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // BUSINESS EVENTS:

  // 1. Open Client Account (Enrolls new CLIENT role and records account opening fees of 500 FCFA)
  const handleCreateClient = (clientData: any) => {
    const newClientId = `u-client-${Date.now()}`;
    const firstWord = clientData.name.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase() || 'MOBI';
    const cleanFirstWord = firstWord.substring(0, 6);
    const generatedReferralCode = `MOBI-${cleanFirstWord}-${Math.floor(100 + Math.random() * 900)}`;

    // Check optional referral code
    let referrerObj: User | undefined = undefined;
    if (clientData.referredBy) {
      referrerObj = users.find(u => u.referralCode && u.referralCode.trim().toUpperCase() === clientData.referredBy.trim().toUpperCase());
    }

    const startBalance = referrerObj ? 1000 : 0;

    const newClient: User = {
      id: newClientId,
      name: clientData.name,
      role: 'CLIENT',
      email: clientData.email,
      phone: clientData.phone,
      agency: clientData.agency,
      zone: clientData.zone,
      status: 'active',
      balance: startBalance, // 1000 if referred, else 0
      createdAt: new Date().toISOString(),
      seniorityWeeks: 2, // preseed as seniority 2 so they can immediately test assistances if desired!
      referralCode: generatedReferralCode,
      referredBy: referrerObj ? referrerObj.id : undefined,
      streakDays: 0,
      badges: referrerObj ? ['milestone-debutant'] : []
    };

    // 500 FCFA Account opening fees transaction automatically recorded
    const openingFeeTx: Transaction = {
      id: `tx-frais-${Date.now()}`,
      type: 'frais_ouverture',
      clientId: newClientId,
      clientName: clientData.name,
      amount: settings.openingFee, // 500 FCFA
      agentId: currentUserObj.id,
      agentName: currentUserObj.name,
      createdAt: new Date().toISOString(),
      status: 'validated', // Instantly validated as paid during signup
      zone: clientData.zone,
      agency: clientData.agency
    };

    const newTxs: Transaction[] = [openingFeeTx];

    const commitAction = () => {
      // If referred, we create referee bonus transaction and reward referrer
      if (referrerObj) {
        const refereeBonusTx: Transaction = {
          id: `tx-referee-bonus-${Date.now()}`,
          type: 'depot',
          clientId: newClientId,
          clientName: clientData.name,
          amount: 1000,
          agentId: currentUserObj.id,
          agentName: currentUserObj.name,
          createdAt: new Date().toISOString() + '-1',
          status: 'validated',
          zone: clientData.zone,
          agency: clientData.agency
        };
        
        const referrerBonusTx: Transaction = {
          id: `tx-referrer-bonus-${Date.now()}`,
          type: 'depot',
          clientId: referrerObj.id,
          clientName: referrerObj.name,
          amount: 1000,
          agentId: currentUserObj.id,
          agentName: currentUserObj.name,
          createdAt: new Date().toISOString() + '-2',
          status: 'validated',
          zone: referrerObj.zone,
          agency: referrerObj.agency
        };

        newTxs.push(refereeBonusTx);
        newTxs.push(referrerBonusTx);

        // Reward referrer user balance under the hood and increment their referral badge
        setUsers(prev => prev.map(u => {
          if (referrerObj && u.id === referrerObj.id) {
            const currentBadges = u.badges || [];
            const updatedBadges = currentBadges.includes('milestone-recruiter') 
              ? currentBadges 
              : [...currentBadges, 'milestone-recruiter'];
            return {
              ...u,
              balance: u.balance + 1000,
              badges: updatedBadges
            };
          }
          return u;
        }));

        addNotification(
          referrerObj.id,
          'Nouveau Parrainage Validé ! 🎉',
          `Votre filleul(e) ${clientData.name} s'est inscrit(e) avec votre code. Un bonus de 1 000 FCFA vous a été crédité !`,
          'deposit'
        );
      }

      setUsers(prev => [...prev, newClient]);
      setTransactions(prev => [...newTxs, ...prev]);
      
      addNotification(
        newClientId,
        'Bienvenue chez MOBIKISSI !',
        `Frais d'ouverture de 500 FCFA réglés. Votre compte a été créé avec succès par l'agent ${currentUserObj.name}. ${referrerObj ? 'Bonus de parrainage de 1 000 FCFA crédité !' : ''}`,
        'info'
      );
    };

    setCreationSequence({
      type: 'client',
      data: newClient,
      onConfirm: commitAction
    });
  };

  // 2. Modify Client Info (For Recouvreurs and Caisse admins)
  const handleUpdateClient = (clientId: string, clientData: any) => {
    setUsers(prev => prev.map(u => u.id === clientId ? { ...u, ...clientData } : u));
  };

  // 3. Create Pointing Card (Instantiates a card worth custom amount e.g. 1000 with 31st cell clause)
  const handleCreateCard = (clientId: string, amount: number) => {
    const clientObj = users.find(u => u.id === clientId);
    if (!clientObj) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      clientId,
      cardNumber: `CARTE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      amount,
      filledCells: [],
      isCompleted: false,
      rule31Applied: 'pending'
    };

    const commitAction = () => {
      setCards(prev => [...prev, newCard]);

      addNotification(
        clientId,
        'Nouvelle Carte Émise',
        `Une carte de pointage journalier de ${amount.toLocaleString()} FCFA a été créée pour vous.`,
        'info'
      );
    };

    setCreationSequence({
      type: 'card',
      data: newCard,
      onConfirm: commitAction
    });
  };

  // 4. Record Deposit contribution (Field collectors record a pointing versement)
  const handleRecordDeposit = (clientId: string, cardId: string, amount: number) => {
    const clientObj = users.find(u => u.id === clientId);
    if (!clientObj) return;

    const newTx: Transaction = {
      id: `tx-depot-${Date.now()}`,
      type: 'depot',
      clientId,
      clientName: clientObj.name,
      amount,
      agentId: currentUserObj.id,
      agentName: currentUserObj.name,
      createdAt: new Date().toISOString(),
      status: 'pending', // Pending caissier validation!
      zone: clientObj.zone,
      agency: clientObj.agency,
      cardId
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // 5. Caisse Validation: Approves deposit/withdrawal. Updates balance and increments cells.
  const handleValidateTransaction = (transactionId: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    // Check transaction type
    if (tx.type === 'depot') {
      // 1. Update Client savings balance, streak, and badges
      setUsers(prev => prev.map(u => {
        if (u.id === tx.clientId) {
          // Calculate streak
          let newStreak = u.streakDays || 0;
          const lastDate = u.lastPointingDate ? new Date(u.lastPointingDate) : null;
          const currDate = new Date(tx.createdAt);
          
          if (!lastDate) {
            newStreak = 1;
          } else {
            const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays <= 1.5) {
              newStreak = (u.streakDays || 0) + 1;
            } else if (diffDays > 3.0) {
              newStreak = 1;
            }
          }

          // Compute badges
          const currentBadges = [...(u.badges || [])];
          if (!currentBadges.includes('milestone-debutant')) {
            currentBadges.push('milestone-debutant');
          }
          
          // Check if they have >= 10 validated depots (including this one soon)
          const validDepotsCount = transactions.filter(t => t.clientId === u.id && t.type === 'depot' && (t.status === 'validated' || t.id === transactionId)).length;
          if (validDepotsCount >= 10 && !currentBadges.includes('milestone-active')) {
            currentBadges.push('milestone-active');
          }

          // Under Mobikissi rules: only multiples of the card amount are taken into account
          let depositIncrement = tx.amount;
          if (tx.cardId) {
            const associatedCard = cards.find(cardItem => cardItem.id === tx.cardId);
            if (associatedCard) {
              const cellsToFillCount = Math.floor(tx.amount / associatedCard.amount);
              const currentFilledCount = associatedCard.filledCells.length;
              const spaceAvailable = 31 - currentFilledCount;
              const actualCellsToFill = Math.max(0, Math.min(cellsToFillCount, spaceAvailable));
              depositIncrement = actualCellsToFill * associatedCard.amount;
            }
          }

          return { 
            ...u, 
            balance: u.balance + depositIncrement,
            streakDays: newStreak,
            lastPointingDate: tx.createdAt,
            badges: currentBadges
          };
        }
        return u;
      }));

      // 2. Tick card cells
      if (tx.cardId) {
        setCards(prev => prev.map(c => {
          if (c.id === tx.cardId) {
            // How many cells are already filled (out of 31)
            const currentFilledCount = c.filledCells.length;
            const cellsToFillCount = Math.floor(tx.amount / c.amount);
            
            if (cellsToFillCount > 0 && currentFilledCount < 31) {
              const spaceAvailable = 31 - currentFilledCount;
              const actualCellsToFill = Math.min(cellsToFillCount, spaceAvailable);
              
              const newCells: number[] = [];
              for (let i = 1; i <= actualCellsToFill; i++) {
                newCells.push(currentFilledCount + i);
              }
              
              const updatedFilledCells = [...c.filledCells, ...newCells];
              const completed = updatedFilledCells.length === 31;
              
              if (completed) {
                // Award card completion badge to user
                setUsers(usrPrev => usrPrev.map(u => {
                  if (u.id === tx.clientId) {
                    const currentBadges = [...(u.badges || [])];
                    if (!currentBadges.includes('milestone-champion')) {
                      currentBadges.push('milestone-champion');
                    }
                    return { ...u, badges: currentBadges };
                  }
                  return u;
                }));
              }

              return {
                ...c,
                filledCells: updatedFilledCells,
                isCompleted: completed,
                // Automatically apply 31st cell MOBIKISSI kept advantage if card is finished!
                rule31Applied: completed ? 'mobikissi_kept' : c.rule31Applied
              };
            }
          }
          return c;
        }));
      }

      // Notify
      addNotification(
        tx.clientId,
        'Pointage validé',
        `Votre versement de ${tx.amount.toLocaleString()} FCFA a été encaissé avec succès sur votre compte.`,
        'deposit'
      );

    } else if (tx.type === 'retrait') {
      // 1. Process agency cashout (Deducts full client balance as withdrawals clear whole account in Agence)
      setUsers(prev => prev.map(u => u.id === tx.clientId ? { ...u, balance: 0 } : u));

      addNotification(
        tx.clientId,
        'Retrait effectué en agence',
        `Votre demande de retrait de ${tx.amount.toLocaleString()} FCFA s'est déroulée avec succès. Solde restant : 0 FCFA.`,
        'withdrawal'
      );
    }

    // Set transaction status to 'validated'
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'validated', agentId: currentUserObj.id, agentName: currentUserObj.name } : t));
  };

  // 6. Caisse Validation: Rejects deposit/withdrawal.
  const handleRejectTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'rejected' } : t));
  };

  // 7. Recruter du personnel (Created from Cashier dashboard)
  const handleCreateStaff = (staffData: any) => {
    const newStaffId = `u-staff-${Date.now()}`;
    const newStaff: User = {
      id: newStaffId,
      name: staffData.name,
      role: staffData.role,
      email: staffData.email,
      phone: staffData.phone,
      agency: staffData.agency,
      zone: staffData.zone,
      status: 'active',
      balance: 0,
      createdAt: new Date().toISOString(),
      seniorityWeeks: 1,
      baseSalary: staffData.baseSalary,
      prime: staffData.prime,
      commission: 0
    };

    setUsers(prev => [...prev, newStaff]);
  };

  // 8. Financial Support Request (Client initiates an assistance loan)
  const handleApplyAssistance = (amount: number, domain: any, notes: string) => {
    const interestRate = settings.defaultInterestRate;
    const repaymentAmount = Math.round(amount * (1 + interestRate / 100));

    const newAst: Assistance = {
      id: `ast-${Date.now()}`,
      clientId: currentUserObj.id,
      clientName: currentUserObj.name,
      amount,
      domain,
      status: 'pending',
      interestRate,
      repaymentAmount,
      repaidAmount: 0,
      createdAt: new Date().toISOString(),
      durationMonths: 4,
      notes
    };

    setAssistances(prev => [newAst, ...prev]);

    // Send notifications
    addNotification(
      currentUserObj.id,
      'Demande de financement soumise',
      `Votre projet "${domain}" de ${amount.toLocaleString()} FCFA est en attente d'approbation d'administration.`,
      'assistance'
    );
  };

  // 9. Process Assistance Loan (PDG/Admin approves, rejects, or settles of support)
  const handleManageAssistance = (assistanceId: string, action: 'approved' | 'refused' | 'refunded') => {
    const ast = assistances.find(a => a.id === assistanceId);
    if (!ast) return;

    if (action === 'approved') {
      // Approve loan - Immediately adds financing support capital to client's account balance and unlocks investor badge!
      setUsers(prev => prev.map(u => {
        if (u.id === ast.clientId) {
          const currentBadges = [...(u.badges || [])];
          if (!currentBadges.includes('milestone-investor')) {
            currentBadges.push('milestone-investor');
          }
          return { ...u, balance: u.balance + ast.amount, badges: currentBadges };
        }
        return u;
      }));
      
      // Add fake approval deposit to audit log so caisse is balanced
      const approvalDepositTx: Transaction = {
        id: `tx-ast-deposit-${Date.now()}`,
        type: 'depot',
        clientId: ast.clientId,
        clientName: ast.clientName,
        amount: ast.amount,
        agentId: currentUserObj.id,
        agentName: currentUserObj.name,
        createdAt: new Date().toISOString(),
        status: 'validated',
        zone: 'Caisse Centrale',
        agency: 'Direction Générale'
      };
      setTransactions(prev => [approvalDepositTx, ...prev]);

      addNotification(
        ast.clientId,
        'Soutien Entrepreneurial APPROUVÉ',
        `Félicitations ! Votre financement de ${ast.amount.toLocaleString()} FCFA pour "${ast.domain}" est accordé. Capital versé sur votre solde d'épargne.`,
        'assistance'
      );
    } else if (action === 'refunded') {
      // Repaid - Marks repayment solved and subtracts repayment amount from clients account balance
      setUsers(prev => prev.map(u => u.id === ast.clientId ? { ...u, balance: Math.max(0, u.balance - ast.repaymentAmount) } : u));
      
      // Register negative cash withdraw of repayment to audit logs
      const repaymentTx: Transaction = {
        id: `tx-ast-repay-${Date.now()}`,
        type: 'retrait',
        clientId: ast.clientId,
        clientName: ast.clientName,
        amount: ast.repaymentAmount,
        agentId: currentUserObj.id,
        agentName: currentUserObj.name,
        createdAt: new Date().toISOString(),
        status: 'validated',
        zone: 'Réception remboursement',
        agency: 'Caisse Centrale'
      };
      setTransactions(prev => [repaymentTx, ...prev]);

      addNotification(
        ast.clientId,
        'Financement soldé',
        `Merci ! Votre de remboursement de ${ast.repaymentAmount.toLocaleString()} FCFA a bien été réglé. Votre financement est marqué remboursé.`,
        'assistance'
      );
    } else if (action === 'refused') {
      addNotification(
        ast.clientId,
        'Financement réfusé',
        `Votre dossier d\'assistance pour ${ast.domain} a été examiné et refusé par le comité d'accompagnement de MOBIKISSI.`,
        'assistance'
      );
    }

    setAssistances(prev => prev.map(a => {
      if (a.id === assistanceId) {
        return {
          ...a,
          status: action,
          repaidAmount: action === 'refunded' ? a.repaymentAmount : a.repaidAmount
        };
      }
      return a;
    }));
  };

  // Global triggers
  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === currentUserId ? { ...n, isRead: true } : n));
  };

  const handleQuickClientPointingSim = (cardId: string, cellNum: number) => {
    // Allows the client to click tile boxes under their dashboard to quickly simulate pointing deposits!
    const targetC = cards.find(c => c.id === cardId);
    if (!targetC) return;

    handleRecordDeposit(currentUserObj.id, cardId, targetC.amount);
    
    // Add simulator system confirmation notification
    addNotification(
      currentUserObj.id,
      'Simulation : Pointage enregistré',
      `Simulation de versement de ${targetC.amount.toLocaleString()} FCFA enclenchée par vous-même ! Allez sous le rôle de Sandrine (Gestionnaire de Caisse) pour valider celle-ci !`,
      'info'
    );
  };

  const handleMarkArticleRead = (clientId: string, articleId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === clientId) {
        const currentBadges = [...(u.badges || [])];
        const readArticlesKey = `mobikissi_reads_${clientId}`;
        const reads = JSON.parse(localStorage.getItem(readArticlesKey) || '[]');
        if (!reads.includes(articleId)) {
          reads.push(articleId);
          localStorage.setItem(readArticlesKey, JSON.stringify(reads));
        }
        if (reads.length >= 3 && !currentBadges.includes('milestone-literate')) {
          currentBadges.push('milestone-literate');
          // Add notification of unlocked badge!
          setTimeout(() => {
            addNotification(
              clientId,
              'Insigne Déverrouillé : Sage Financier 🎓',
              'Félicitations ! Vous avez lu tous les articles d\'alphabétisation financière et renforcé vos compétences entrepreneuriales !',
              'info'
            );
          }, 400);
        }
        return { ...u, badges: currentBadges };
      }
      return u;
    }));
  };

  const resetProjectToDefaultSeeding = () => {
    if (confirm('Voulez-vous réinitialiser toutes vos modifications et recharger le jeu de données d\'origine ?')) {
      localStorage.clear();
      setUsers(INITIAL_USERS);
      setCards(INITIAL_CARDS);
      setTransactions(INITIAL_TRANSACTIONS);
      setAssistances(INITIAL_ASSISTANCES);
      setNotifications(INITIAL_NOTIFICATIONS);
      setSettings(DEFAULT_SETTINGS);
      setSalaryConfigs(DEFAULT_SALARY_CONFIGS);
      setSelectedThemeId('royal_blue');
      setDarkMode(false);
      setCurrentUserId('u-client-1');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <Navbar 
        currentUser={currentUserObj}
        allUsers={users}
        settings={settings}
        notifications={notifications}
        onUserChange={(uid) => {
          setCurrentUserId(uid);
        }}
        selectedTheme={activeTheme}
        onThemeChange={(tid) => setSelectedThemeId(tid)}
        themesList={THEMES_LIST}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onResetData={resetProjectToDefaultSeeding}
      />

      {/* 2. CHOOSE SPECIFIC CORE VIEW BASED ON CURRENT LOGGED IN USER ROLE */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {currentUserObj.role === 'CLIENT' && (
          <ClientDashboard 
            client={currentUserObj}
            cards={cards}
            transactions={transactions}
            assistances={assistances}
            notifications={notifications}
            settings={settings}
            selectedTheme={activeTheme}
            onSubmitAssistance={handleApplyAssistance}
            onSimulatePointing={handleQuickClientPointingSim}
            onMarkArticleRead={handleMarkArticleRead}
            onUpdateUser={handleUpdateClient}
            onCreateCard={handleCreateCard}
            setTransactions={setTransactions}
            setUsers={setUsers}
            setNotifications={setNotifications}
          />
        )}

        {currentUserObj.role === 'RECOUVREUR' && (
          <AgentDashboard 
            agent={currentUserObj}
            clients={users}
            cards={cards}
            transactions={transactions}
            assistances={assistances}
            settings={settings}
            selectedTheme={activeTheme}
            onCreateClient={handleCreateClient}
            onUpdateClient={handleUpdateClient}
            onCreateCard={handleCreateCard}
            onRecordDeposit={handleRecordDeposit}
            setAssistances={setAssistances}
            setTransactions={setTransactions}
            setCards={setCards}
            setUsers={setUsers}
          />
        )}

        {currentUserObj.role === 'CAISSIER' && (
          <CaisseDashboard 
            cashier={currentUserObj}
            allUsers={users}
            transactions={transactions}
            cards={cards}
            assistances={assistances}
            settings={settings}
            selectedTheme={activeTheme}
            onValidateTransaction={handleValidateTransaction}
            onRejectTransaction={handleRejectTransaction}
            onCreateStaff={handleCreateStaff}
            onCreateClient={handleCreateClient}
            onUpdateClient={handleUpdateClient}
            onCreateCard={handleCreateCard}
            onRecordDeposit={handleRecordDeposit}
            onManageAssistance={handleManageAssistance}
          />
        )}

        {currentUserObj.role === 'SUPERVISEUR' && (
          <SuperviseurDashboard 
            supervisor={currentUserObj}
            allUsers={users}
            transactions={transactions}
            cards={cards}
            assistances={assistances}
            settings={settings}
            selectedTheme={activeTheme}
          />
        )}

        {currentUserObj.role === 'PDG' && (
          <AdminDashboard 
            admin={currentUserObj}
            allUsers={users}
            transactions={transactions}
            cards={cards}
            assistances={assistances}
            salaryConfigs={salaryConfigs}
            settings={settings}
            selectedTheme={activeTheme}
            onUpdateSettings={setSettings}
            onUpdateSalaryConfig={setSalaryConfigs}
            onManageAssistance={handleManageAssistance}
            themesList={THEMES_LIST}
            onThemeSelect={(themeId) => setSelectedThemeId(themeId)}
            setUsers={setUsers}
            setCards={setCards}
            setTransactions={setTransactions}
            setAssistances={setAssistances}
            callCenterPermissions={callCenterPermissions}
            onUpdateCallCenterPermissions={setCallCenterPermissions}
          />
        )}

        {currentUserObj.role === 'CALL_CENTER' && (
          <CallCenterDashboard 
            agent={currentUserObj}
            allUsers={users}
            cards={cards}
            assistances={assistances}
            notifications={notifications}
            settings={settings}
            selectedTheme={activeTheme}
            setUsers={setUsers}
            permissions={callCenterPermissions}
          />
        )}
      </main>

      {/* 3. LUXURIOUS CRAFTED FOOTER LAYOUT */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 text-center text-xs text-slate-400 mt-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <div className="flex justify-center items-center space-x-2 text-slate-800 dark:text-slate-200">
            <Coins className={`w-5 h-5 ${activeTheme.primaryText}`} />
            <span className="text-sm font-black tracking-widest uppercase">{settings.platformName}</span>
          </div>

          <p className="font-sans italic font-medium max-w-sm mx-auto text-slate-500">
            " {settings.description} "
          </p>

          <div className="h-px w-24 bg-slate-200 dark:bg-slate-700/50 mx-auto" />

          <div className="flex flex-col sm:flex-row sm:justify-center items-center gap-x-6 gap-y-2 text-slate-500 font-semibold font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {settings.address}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {settings.phone1} / {settings.phone2}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {settings.email}
            </span>
          </div>

          <div className="space-y-1 pt-2 font-semibold">
            <span className="block text-[11px] font-black uppercase text-rose-500">Propulsé par TO SOLOLA Group</span>
            <span className="block text-[10px] text-slate-400">© {new Date().getFullYear()} {settings.platformName}. Tous droits réservés.</span>
          </div>

        </div>
      </footer>

      {/* Floating Dark Mode switcher */}
      <AnimatePresence>
        {creationSequence && (
          <CreationLoader 
            type={creationSequence.type}
            data={creationSequence.data}
            onComplete={() => {
              creationSequence.onConfirm();
              setCreationSequence(null);
            }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-40 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-2 rounded-full cursor-pointer hover:scale-105 transition-all">
        <button
          id="dark-mode-floating-btn"
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 focus:outline-none flex items-center justify-center text-slate-800 dark:text-amber-400"
          title={darkMode ? "Basculer en mode clair" : "Basculer en mode sombre"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

    </div>
  );
}
