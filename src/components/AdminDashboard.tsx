/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building, Users, CreditCard, Coins, TrendingUp, CheckCircle2, X, ArrowLeft, 
  Search, ShieldCheck, Save, Sparkles, Landmark, Phone, MapPin, Mail, 
  SlidersHorizontal, LayoutGrid, Info, Check, Wallet, HandCoins, DollarSign, Clock, 
  HeartHandshake, AlertTriangle, Settings, ShieldAlert, Send, Ban, Crown, Printer, 
  Layers, ChevronRight, Plus, Key, UserCheck, RotateCcw, FileText, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, Card, Transaction, SystemSetting, SalaryConfig, Assistance } from '../types';

interface AdminDashboardProps {
  admin: User;
  allUsers: User[];
  transactions: Transaction[];
  cards: Card[];
  assistances: Assistance[];
  salaryConfigs: SalaryConfig[];
  settings: SystemSetting;
  selectedTheme: any;
  onUpdateSettings: (newSettings: SystemSetting) => void;
  onUpdateSalaryConfig: (updatedConfigs: SalaryConfig[]) => void;
  onManageAssistance: (assistanceId: string, action: 'approved' | 'refused' | 'refunded') => void;
  themesList: any[];
  onThemeSelect: (themeId: string) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setAssistances: React.Dispatch<React.SetStateAction<Assistance[]>>;
  callCenterPermissions?: {
    showBalance: boolean;
    showCards: boolean;
    createAppointments: boolean;
    createClaims: boolean;
    sendSms: boolean;
    viewAssistances: boolean;
    viewRefunds: boolean;
    accessReports: boolean;
    viewPersonalInfo: boolean;
    exportData: boolean;
  };
  onUpdateCallCenterPermissions?: (perms: any) => void;
}

// Simulated real unalterable Audit Log entries
interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  device: string;
  ip: string;
}

export default function AdminDashboard({
  admin,
  allUsers,
  transactions,
  cards,
  assistances,
  salaryConfigs,
  settings,
  selectedTheme,
  onUpdateSettings,
  onUpdateSalaryConfig,
  onManageAssistance,
  themesList,
  onThemeSelect,
  setUsers,
  setCards,
  setTransactions,
  setAssistances,
  callCenterPermissions,
  onUpdateCallCenterPermissions
}: AdminDashboardProps) {

  // Views Router State
  // 'dashboard' | 'users' | 'dossier-client' | 'cards' | 'finance' | 'assistances' | 'personnel' | 'permissions' | 'organigramme' | 'themes' | 'audit' | 'alerts' | 'settings' | 'ia'
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  // Navigation stack to support previous page returns (e.g. returning to users list from client file)
  const [prevViewStack, setPrevViewStack] = useState<string[]>([]);

  // Search states
  const [userQuery, setUserQuery] = useState('');
  const [cardFilter, setCardFilter] = useState('all');
  const [financeTimeframe, setFinanceTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Currently inspected item refs
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Local audit logs with auto appended items
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', user: 'Admin PDG', action: 'Authentification', target: 'Caisse Centrale Brazzaville', timestamp: '2026-06-19 09:30:12', device: 'Web Chrome - Linux OS', ip: '197.158.12.94' },
    { id: '2', user: 'Admin PDG', action: 'Validation Taux Intérêt', target: 'Paramètres Généraux', timestamp: '2026-06-19 09:44:03', device: 'Web Chrome - Linux OS', ip: '197.158.12.94' },
    { id: '3', user: 'Sandrine Caisse', action: 'Approbation Versement', target: 'Client Paul Samba', timestamp: '2026-06-19 08:15:20', device: 'Android App - TECNO Camon 20', ip: '105.235.122.11' },
    { id: '4', user: 'Guy-Aimé Recouvreur', action: 'Création Client', target: 'Alice Massengo', timestamp: '2026-06-18 16:50:44', device: 'Android App - Samsung A34', ip: '105.235.120.4' },
    { id: '5', user: 'System Watchdog', action: 'Détection Anomamie', target: 'Carte #9403 Inactive', timestamp: '2026-06-18 11:00:00', device: 'Server Core Daemon', ip: '127.0.0.1' }
  ]);

  // Push New Audit Log Helper
  const recordAudit = (action: string, target: string, username = admin.name) => {
    const fresh: AuditLog = {
      id: `audit-${Date.now()}`,
      user: username,
      action,
      target,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      device: 'Navigateur Web Sécurisé (Admin)',
      ip: '197.158.20.101'
    };
    setAuditLogs(prev => [fresh, ...prev]);
  };

  // Toast System
  const [successMsg, setSuccessMsg] = useState('');
  const triggerToast = (text: string) => {
    setSuccessMsg(text);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const navigateTo = (view: string) => {
    setPrevViewStack(prev => [...prev, activeView]);
    setActiveView(view);
  };

  const navigateBack = () => {
    setPrevViewStack(prev => {
      const nextStack = [...prev];
      const target = nextStack.pop() || 'dashboard';
      setActiveView(target);
      return nextStack;
    });
  };

  // Helper selectors and groupings
  const clients = useMemo(() => allUsers.filter(u => u.role === 'CLIENT'), [allUsers]);
  const staff = useMemo(() => allUsers.filter(u => u.role !== 'CLIENT'), [allUsers]);
  const validatedTxs = useMemo(() => transactions.filter(t => t.status === 'validated'), [transactions]);

  // Count sub-roles
  const agentsCount = useMemo(() => staff.filter(s => s.role === 'RECOUVREUR').length, [staff]);
  const superviseursCount = useMemo(() => staff.filter(s => s.role === 'SUPERVISEUR').length, [staff]);
  const managersCount = useMemo(() => staff.filter(s => s.role === 'CAISSIER').length, [staff]);

  // Date constants
  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);
  const thisMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);

  // Financial statistics
  const platformClientCash = useMemo(() => {
    return clients.reduce((sum, c) => sum + (c.balance || 0), 0);
  }, [clients]);

  const moneyEncaisseToday = useMemo(() => {
    return validatedTxs
      .filter(t => t.type === 'depot' && t.createdAt.startsWith(todayStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTxs, todayStr]);

  const moneyRetireToday = useMemo(() => {
    return validatedTxs
      .filter(t => t.type === 'retrait' && t.createdAt.startsWith(todayStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTxs, todayStr]);

  const moneyEncaisseMonth = useMemo(() => {
    return validatedTxs
      .filter(t => t.type === 'depot' && t.createdAt.startsWith(thisMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTxs, thisMonthStr]);

  const moneyRetireMonth = useMemo(() => {
    return validatedTxs
      .filter(t => t.type === 'retrait' && t.createdAt.startsWith(thisMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTxs, thisMonthStr]);

  const openingFeesToday = useMemo(() => {
    return validatedTxs
      .filter(t => t.type === 'frais_ouverture' && t.createdAt.startsWith(todayStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTxs, todayStr]);

  const openingFeesMonth = useMemo(() => {
    return validatedTxs
      .filter(t => t.type === 'frais_ouverture' && t.createdAt.startsWith(thisMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTxs, thisMonthStr]);

  // Salaries expense
  const monthlySalaryExpenses = useMemo(() => {
    return salaryConfigs.reduce((total, sc) => {
      const staffInRole = staff.filter(s => s.role === sc.role).length;
      return total + ((sc.baseSalary + sc.prime) * staffInRole);
    }, 0);
  }, [salaryConfigs, staff]);

  // Rule 31 (31st Pointing completed revenue)
  const completedCardsCount = useMemo(() => cards.filter(c => c.isCompleted).length, [cards]);
  const completedCardsRevenue = useMemo(() => {
    return cards
      .filter(c => c.isCompleted)
      .reduce((sum, c) => sum + c.amount, 0); // MOBIKISSI takes 31st versement amount value
  }, [cards]);

  // Overall platform yield calculation
  const totalOpeningFeesAllTime = useMemo(() => {
    return validatedTxs.filter(t => t.type === 'frais_ouverture').reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTxs]);

  const totalInterestsAllTime = useMemo(() => {
    return assistances
      .filter(a => a.status === 'approved' || a.status === 'refunded')
      .reduce((sum, a) => sum + (a.repaymentAmount - a.amount), 0);
  }, [assistances]);

  const platformTotalRevenue = useMemo(() => {
    return totalOpeningFeesAllTime + completedCardsRevenue + totalInterestsAllTime;
  }, [totalOpeningFeesAllTime, completedCardsRevenue, totalInterestsAllTime]);

  // Net platform earnings after salaries
  const netPlatformProfit = useMemo(() => {
    return platformTotalRevenue - monthlySalaryExpenses;
  }, [platformTotalRevenue, monthlySalaryExpenses]);

  // Assistances counts
  const pendingAssistancesCount = useMemo(() => assistances.filter(a => a.status === 'pending').length, [assistances]);
  const activeAssistancesTotal = useMemo(() => assistances.filter(a => a.status === 'approved').length, [assistances]);

  // Heuristics Anomaly Detection
  const anomaliesList = useMemo(() => {
    const list: Array<{ id: string; type: string; title: string; desc: string; severity: 'critical' | 'warning' | 'info' }> = [];
    
    // Low activity agents
    staff.filter(s => s.role === 'RECOUVREUR').forEach(ag => {
      const collections = validatedTxs.filter(t => t.agentId === ag.id && t.type === 'depot').length;
      if (collections === 0) {
        list.push({
          id: `ag-idle-${ag.id}`,
          type: 'Agent Inactif',
          title: `L'Agent ${ag.name} n'a aucune collecte validée`,
          desc: `Zone d'affectation : ${ag.zone || 'Non définie'}. Veuillez planifier un entretien ou réaffecter le secteur.`,
          severity: 'critical'
        });
      }
    });

    // Abandoned Cards (Active cards that have no cells checked)
    cards.forEach(card => {
      if (!card.isCompleted && card.filledCells.length === 0) {
        const owner = clients.find(u => u.id === card.clientId);
        list.push({
          id: `card-abnx-${card.id}`,
          type: 'Carte Abandonnée',
          title: `La carte #${card.cardNumber.slice(-6)} de ${owner?.name || 'Client Inconnu'} est délaissée`,
          desc: `Créée le ${card.createdAt.substring(0, 10)}. Aucun carreau rempli.`,
          severity: 'warning'
        });
      }
    });

    // Inactive accounts with high balance remaining
    clients.forEach(cl => {
      if (cl.balance > 100000) {
        const clTxs = validatedTxs.filter(t => t.clientId === cl.id);
        if (clTxs.length === 0) {
          list.push({
            id: `client-idle-${cl.id}`,
            type: 'Compte Dormant',
            title: `Le compte ${cl.name} possède un solde significatif (${cl.balance.toLocaleString()} FCFA)`,
            desc: `Aucune transaction récente constatée. Sécurité audit requise.`,
            severity: 'info'
          });
        }
      }
    });

    // Overdue assistances (where repaid is tiny after days)
    assistances.forEach(as => {
      if (as.status === 'approved' && as.repaidAmount < (as.repaymentAmount * 0.15)) {
        list.push({
          id: `ast-delay-${as.id}`,
          type: 'Retard de Remboursement',
          title: `Accompagnement de ${as.clientName} en retard d'échéance`,
          desc: `Montant accordé: ${as.amount.toLocaleString()} FCFA. Remboursé: ${as.repaidAmount.toLocaleString()} FCFA seulement.`,
          severity: 'critical'
        });
      }
    });

    return list;
  }, [staff, cards, clients, validatedTxs, assistances]);

  // INSIDE DOSSIER CLIENT CONTROLLERS
  const activeInspectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const inspectedCards = useMemo(() => {
    if (!selectedClientId) return [];
    return cards.filter(c => c.clientId === selectedClientId);
  }, [cards, selectedClientId]);

  const inspectedTxs = useMemo(() => {
    if (!selectedClientId) return [];
    return transactions.filter(t => t.clientId === selectedClientId);
  }, [transactions, selectedClientId]);

  const inspectedAssistances = useMemo(() => {
    if (!selectedClientId) return [];
    return assistances.filter(a => a.clientId === selectedClientId);
  }, [assistances, selectedClientId]);

  // ACTIONS FOR CLIENT FILE
  const handleClientBlock = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    recordAudit('Changement de Statut Client', `Client ID: ${userId}`);
    triggerToast(`✓ Statut de l'adhérent modifié avec succès.`);
  };

  const handleClientDelete = (userId: string) => {
    if (confirm('Confirmez-vous la suppression irréversible de ce compte client ?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setCards(prev => prev.filter(c => c.clientId !== userId));
      setAssistances(prev => prev.filter(a => a.clientId !== userId));
      setSelectedClientId(null);
      recordAudit('Suppression de compte', `Client ID: ${userId}`);
      triggerToast('✕ Compte client supprimé.');
      navigateBack();
    }
  };

  const handleResetPassword = (clientName: string) => {
    recordAudit('Réinitialisation Identifiants', `Compte client de ${clientName}`);
    triggerToast(`✓ Un nouveau code de sécurité temporaire a été généré pour ${clientName} : MOBI-${Math.floor(1000 + Math.random() * 9000)}.`);
  };

  const handleCreateCardDirect = (clientId: string, val: number) => {
    const fresh: Card = {
      id: `card-${Date.now()}`,
      clientId,
      cardNumber: `CARTE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      amount: val,
      filledCells: [],
      isCompleted: false,
      rule31Applied: 'pending'
    };
    setCards(prev => [...prev, fresh]);
    recordAudit('Émission Carte Directe', `Pour le client ID: ${clientId} d'une valeur de ${val} FCFA`);
    triggerToast(`✓ Nouvelle carte de pointage ${val.toLocaleString()} FCFA initialisée.`);
  };

  // STAFF MANAGEMENT
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('RECOUVREUR');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffZone, setNewStaffZone] = useState('Zone B - Ouenze');
  const [newStaffSalary, setNewStaffSalary] = useState(120000);

  const handleCreateNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffPhone) {
      triggerToast('⚠️ Erreur : Veuillez remplir le nom et le téléphone.');
      return;
    }
    const newStaffId = `u-staff-${Date.now()}`;
    const fresh: User = {
      id: newStaffId,
      name: newStaffName,
      role: newStaffRole,
      email: newStaffEmail || 'contact@mobikissi.cg',
      phone: newStaffPhone,
      agency: 'Caisse Centrale',
      zone: newStaffZone,
      status: 'active',
      balance: 0,
      createdAt: new Date().toISOString(),
      seniorityWeeks: 1,
      baseSalary: newStaffSalary,
      prime: 15000,
      commission: 0
    };
    setUsers(prev => [...prev, fresh]);
    recordAudit('Recrutement Personnel', `Nouvel Employé : ${newStaffName} (${newStaffRole})`);
    triggerToast(`✓ ${newStaffName} enregistré en tant que ${newStaffRole} !`);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');
  };

  const handleSuspendStaff = (id: string, sName: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    recordAudit(`Changement de statut employé`, `${sName}`);
    triggerToast(`✓ Contrat de ${sName} mis à jour.`);
  };

  // SYSTEM PARAMS CUSTOMIZATION
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [address, setAddress] = useState(settings.address);
  const [phone1, setPhone1] = useState(settings.phone1);
  const [email, setEmail] = useState(settings.email);
  const [interestRate, setInterestRate] = useState(settings.defaultInterestRate);
  const [openingFee, setOpeningFee] = useState(settings.openingFee);
  const [rule31Text, setRule31Text] = useState(settings.rule31Config);

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      platformName,
      address,
      phone1,
      email,
      defaultInterestRate: Number(interestRate),
      openingFee: Number(openingFee),
      rule31Config: rule31Text
    });
    recordAudit('Paramétrage Système', 'Mise à jour des règles MOBIKISSI');
    triggerToast('✓ Les paramètres globaux de la plateforme ont été actualisés.');
  };

  // IA MOBIKISSI ASSISTANT SIMULATOR
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<{ text: string; data?: any; type?: 'chart' | 'table' | 'cards' | 'text' } | null>(null);

  const handleAiAsk = (queryStr: string) => {
    const q = queryStr.toLowerCase();
    setAiQuery(queryStr);
    
    if (q.includes('meilleur') || q.includes('top agent')) {
      // Calculate top agents by collections
      const stats = staff.filter(s => s.role === 'RECOUVREUR').map(agent => {
        const amt = validatedTxs.filter(t => t.agentId === agent.id && t.type === 'depot').reduce((sum, t) => sum + t.amount, 0);
        return { name: agent.name, Collectes: amt };
      }).sort((a, b) => b.Collectes - a.Collectes);

      setAiResponse({
        text: `Voici l'évaluation instantanée des collectes de nos agents de terrain. Le meilleur collecteur actuel est **${stats[0]?.name || 'Aucun'}** avec un total de **${(stats[0]?.Collectes || 0).toLocaleString()} FCFA** d'épargne mobilisée.`,
        data: stats,
        type: 'chart'
      });
    } else if (q.includes('massina') || q.includes('encaisse')) {
      const zoneStr = 'Zone A - Massina';
      const zoneAmt = validatedTxs.filter(t => t.zone === zoneStr && t.type === 'depot').reduce((sum, t) => sum + t.amount, 0);
      const zoneCards = cards.filter(c => {
        const cl = clients.find(clObj => clObj.id === c.clientId);
        return cl && cl.zone === zoneStr;
      }).length;

      setAiResponse({
        text: `Pour le secteur de **Massina (Secteur A)**, nous avons un flux d'activité important en cours :`,
        data: [
          { label: "Volume Encaissé Total", val: `${zoneAmt.toLocaleString()} FCFA` },
          { label: "Cartes Ouvertes En Cours", val: `${zoneCards} Cartes émises` },
          { label: "Agents affectés", val: "2 Agents Terrain" }
        ],
        type: 'table'
      });
    } else if (q.includes('eligible') || q.includes('assistance')) {
      // Clients eligible have seniority >= 2 weeks, and have at least 1 completed card or active accounts
      const eligible = clients.filter(c => (c.seniorityWeeks || 0) >= 2 && c.balance > 5000);
      setAiResponse({
        text: `Après analyse de l'ancienneté (minimum 2 semaines d'épargne continue) et de la régularité, nous détectons **${eligible.length} adhérents éligibles** à un prêt social d'accompagnement. Voici la liste des prioritaires :`,
        data: eligible.map(e => ({ name: e.name, phone: e.phone, solde: `${e.balance.toLocaleString()} F`, anciennete: `${e.seniorityWeeks} semaines` })),
        type: 'table'
      });
    } else if (q.includes('remboursement') || q.includes('cette semaine')) {
      const ongoing = assistances.filter(a => a.status === 'approved');
      setAiResponse({
        text: `Voici le calendrier de recouvrement des micro-crédits et soutiens financiers accordés. Nous avons **${ongoing.length} encours actifs** à recouvrer.`,
        data: ongoing.map(o => ({ Client: o.clientName, "Montant Dû": `${o.repaymentAmount.toLocaleString()} FCFA`, "Déjà Remboursé": `${o.repaidAmount.toLocaleString()} FCFA`, "Restant": `${(o.repaymentAmount - o.repaidAmount).toLocaleString()} F` })),
        type: 'table'
      });
    } else {
      setAiResponse({
        text: `Je suis l'assistant IA MOBIKISSI spécialement entraîné pour exécuter des requêtes analytiques en temps réel sur la plateforme. \n\nVous pouvez cliquer sur l'un des boutons d'exemples ci-dessus pour obtenir d'excellents rapports dynamiques.`,
        type: 'text'
      });
    }
  };

  // ROLE-BASED PERMISSION ASSIGNMENT
  // Locally tracked customized user features
  const [rolesPermissions, setRolesPermissions] = useState<Record<string, Record<string, boolean>>>({
    PDG: { 'Créer Client': true, 'Créer Carte': true, 'Encaisser': true, 'Retrait': true, 'Assistance': true, 'Voir Rapports': true, 'Modifier Utilisateurs': true, 'Voir Solde': true, 'Voir Salaires': true },
    SUPERVISEUR: { 'Créer Client': true, 'Créer Carte': true, 'Encaisser': false, 'Retrait': false, 'Assistance': true, 'Voir Rapports': true, 'Modifier Utilisateurs': true, 'Voir Solde': true, 'Voir Salaires': false },
    CAISSIER: { 'Créer Client': true, 'Créer Carte': true, 'Encaisser': true, 'Retrait': true, 'Assistance': false, 'Voir Rapports': true, 'Modifier Utilisateurs': false, 'Voir Solde': true, 'Voir Salaires': false },
    RECOUVREUR: { 'Créer Client': true, 'Créer Carte': true, 'Encaisser': true, 'Retrait': false, 'Assistance': false, 'Voir Rapports': false, 'Modifier Utilisateurs': false, 'Voir Solde': false, 'Voir Salaires': false },
    CALL_CENTER: { 'Créer Client': false, 'Créer Carte': false, 'Encaisser': false, 'Retrait': false, 'Assistance': false, 'Voir Rapports': true, 'Modifier Utilisateurs': false, 'Voir Solde': true, 'Voir Salaires': false }
  });

  const togglePermission = (role: string, permission: string) => {
    setRolesPermissions(prev => {
      const updated = { ...prev };
      updated[role] = { ...updated[role], [permission]: !updated[role][permission] };
      return updated;
    });
    recordAudit('Changement de Permissions', `Rôle: ${role} -> ${permission}`);
    triggerToast('✓ Commission et permission ajustées avec succès.');
  };

  // COMPUTE COMMISSIONS LEADERS
  const topCommissionsList = useMemo(() => {
    return staff.filter(s => s.role === 'RECOUVREUR' || s.role === 'SUPERVISEUR').map(stf => {
      const collectionsTotal = validatedTxs.filter(t => t.agentId === stf.id && t.type === 'depot').reduce((sum, t) => sum + t.amount, 0);
      const commissionRate = stf.role === 'RECOUVREUR' ? 0.05 : 0.02; // 5% for collectors, 2% for supervisors
      const commEarned = Math.round(collectionsTotal * commissionRate);
      return {
        id: stf.id,
        name: stf.name,
        role: stf.role,
        zone: stf.zone,
        collectionsTotal,
        commEarned
      };
    }).sort((a, b) => b.commEarned - a.commEarned);
  }, [staff, validatedTxs]);


  return (
    <div className="space-y-6 select-text text-slate-800 dark:text-slate-100 font-sans">
      
      {/* 1. TOAST ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 p-4 bg-emerald-500 text-white rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs"
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER VIEW 1: MAIN CONSOLIDATED TABLEAU DE BORD (HUD DASHBOARD) */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          
          {/* HEADER ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-5">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-550 font-mono">MOBIKISSI GROUP CORP.</span>
              <h1 className="text-2xl font-black text-slate-905 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Building className="w-7 h-7 text-indigo-500" />
                CONTRÔLE ADMINISTRATEUR EXÉCUTIF
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Directeur Principal : <strong className="text-slate-850 dark:text-white">{admin.name}</strong> • Centre d'Audit et de Gestion de Projet.
              </p>
            </div>

            {/* Quick Action System Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigateTo('ia')}
                className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/10 hover:scale-101 transition-all flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>IA MOBIKISSI</span>
              </button>
              <button
                id="view-alerts-dashboard"
                onClick={() => navigateTo('alerts')}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-650 dark:text-rose-455 border border-rose-250 dark:border-rose-900 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer position-relative"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Anomalies heuristiques ({anomaliesList.length})</span>
              </button>
            </div>
          </div>

          {/* DENSE 2X5 KPI EXECUTIVE MATRIX */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            
            {/* KPI 1 */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between h-28 transform hover:scale-101 transition-all">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-black tracking-widest uppercase">Solde Plateforme</span>
                <Landmark className="w-4 h-4 text-emerald-450" />
              </div>
              <div>
                <span className="text-sm font-black font-mono tracking-tight text-white block">
                  {platformClientCash.toLocaleString()} F
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Fonds d'Épargne Sous Garde</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-850 shadow-sm flex flex-col justify-between h-28 transform hover:scale-101 transition-all">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-black tracking-widest uppercase">Épargne Encaissée</span>
                <Coins className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                  {moneyEncaisseToday.toLocaleString()} F
                </span>
                <span className="text-[9px] text-slate-450 block font-medium">Aujourd'hui • {moneyEncaisseMonth.toLocaleString()} ce mois</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-850 shadow-sm flex flex-col justify-between h-28 transform hover:scale-101 transition-all">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-black tracking-widest uppercase">Retraits Validés</span>
                <Wallet className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                  {moneyRetireToday.toLocaleString()} F
                </span>
                <span className="text-[9px] text-slate-450 block font-medium">Auj • {moneyRetireMonth.toLocaleString()} ce mois</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-850 shadow-sm flex flex-col justify-between h-28 transform hover:scale-101 transition-all">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-black tracking-widest uppercase">Revenus de Droits</span>
                <Coins className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                  {platformTotalRevenue.toLocaleString()} F
                </span>
                <span className="text-[9px] text-slate-450 block font-medium">Inscriptions + 31è Commission</span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-850 shadow-sm flex flex-col justify-between h-28 transform hover:scale-101 transition-all col-span-2 lg:col-span-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-black tracking-widest uppercase">Bénéfice Net</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <span className={`text-md font-black font-mono block ${netPlatformProfit >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-500'}`}>
                  {netPlatformProfit.toLocaleString()} F
                </span>
                <span className="text-[9px] text-slate-450 block font-medium">Revenu Net Après Salaries</span>
              </div>
            </div>

          </div>

          {/* SYSTEM USERS HUD COUNTER STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 pt-1.5">
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-900 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Clients Adhérents</span>
              <span className="text-xs font-black font-mono text-indigo-500">{clients.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-900 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Agents Recouvreurs</span>
              <span className="text-xs font-black font-mono text-amber-500">{agentsCount}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-900 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Superviseurs</span>
              <span className="text-xs font-black font-mono text-purple-500">{superviseursCount}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-900 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Gestionnaires Caisse</span>
              <span className="text-xs font-black font-mono text-teal-500">{managersCount}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-900 flex items-center justify-between col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-slate-400">Assistances En Cours</span>
              <span className="text-xs font-black font-mono text-rose-500">{activeAssistancesTotal}</span>
            </div>
          </div>

          {/* MAIN NAVIGATION PANEL MENU GRID */}
          <div className="bg-slate-100/60 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-205 dark:border-slate-850 mt-4">
            <span className="block text-[10px] font-black uppercase text-indigo-550 tracker-wider mb-4 font-mono">PANEL DE NAVIGATION ADMINISTRATEUR</span>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Utilisateurs & Clients', icon: <Users className="w-5 h-5 text-indigo-505" />, view: 'users', count: clients.length, subtitle: "Créer, modifier et voir dossier complet" },
                { label: 'Centre des Cartes', icon: <CreditCard className="w-5 h-5 text-purple-505" />, view: 'cards', count: cards.length, subtitle: "Superviser les enveloppes actives" },
                { label: 'Journal des Encaissements', icon: <Coins className="w-5 h-5 text-emerald-505" />, view: 'finance', subtitle: "Analyse des pointages journaliers" },
                { label: 'Soutien & Assistances', icon: <HeartHandshake className="w-5 h-5 text-pink-505" />, view: 'assistances', count: pendingAssistancesCount, alert: pendingAssistancesCount > 0, subtitle: "Décider des subventions de projets" },
                { label: 'Gestion du Personnel', icon: <UserCheck className="w-5 h-5 text-orange-505" />, view: 'personnel', subtitle: "Recrutement, grilles contractuelles" },
                { label: 'Permissions & Taux', icon: <SlidersHorizontal className="w-5 h-5 text-teal-505" />, view: 'permissions', subtitle: "Ajuster les accès uniques par poste" },
                { label: 'Organigramme Visuel', icon: <Layers className="w-5 h-5 text-amber-505" />, view: 'organigramme', subtitle: "Visualiser la hiérarchie MOBIKISSI" },
                { label: 'Thèmes & Charte', icon: <Settings className="w-5 h-5 text-blue-505" />, view: 'themes', subtitle: "Changer l'identité de l'application" },
                { label: 'Journal d\'Audit', icon: <FileText className="w-5 h-5 text-slate-505" />, view: 'audit', subtitle: "Traçabilité unalterable securisée" },
                { label: 'Paramètres Généraux', icon: <Settings className="w-5 h-5 text-gray-505" />, view: 'settings', subtitle: "Modifier taux d'intérêt, adhésion" }
              ].map((m, i) => (
                <button
                  key={i}
                  onClick={() => navigateTo(m.view)}
                  className="p-4 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-205 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-xl text-left transition-all hover:scale-102 flex flex-col justify-between h-28 shadow-sm group cursor-pointer"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-colors">
                      {m.icon}
                    </div>
                    {m.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${m.alert ? 'bg-rose-550 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {m.count}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-extrabold text-[11px] block text-slate-905 dark:text-white leading-tight">{m.label}</span>
                    <span className="text-[9px] text-slate-450 block leading-normal mt-0.5 font-normal truncate max-w-full">{m.subtitle}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TWO GRAPHICS ROW IN THE BACKGROUND */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm">
              <span className="block text-[10px] font-black uppercase text-slate-400 mb-4 font-mono">COURBE DES REVENUS ET CHARGES COOPÉRATIVES</span>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Jan', Recettes: 120000, Salaires: 90000 },
                    { name: 'Fév', Recettes: 155000, Salaires: 90000 },
                    { name: 'Mar', Recettes: 210000, Salaires: 110000 },
                    { name: 'Avr', Recettes: 305000, Salaires: 110000 },
                    { name: 'Mai', Recettes: 380000, Salaires: 130000 },
                    { name: 'Juin', Recettes: platformTotalRevenue, Salaires: monthlySalaryExpenses }
                  ]}>
                    <defs>
                      <linearGradient id="gradientRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={9} />
                    <YAxis fontSize={9} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Area type="monotone" dataKey="Recettes" name="Prestations de services" stroke="#4f46e5" fillOpacity={1} fill="url(#gradientRev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Salaires" name="Charges salariales fixes" stroke="#f43f5e" fillOpacity={0} strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* QUICK TELEMETRY LOGS PREVIEW */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 font-mono">
                <span>Rapports récents de l'audit système</span>
                <button onClick={() => navigateTo('audit')} className="text-indigo-500 hover:underline">Voir le journal complet</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-805">
                {auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      <div>
                        <span className="text-slate-905 dark:text-white block">{log.action}</span>
                        <span className="text-[9px] text-slate-450 block font-medium">Cible : {log.target}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[9px] text-slate-450">
                      <span>{log.user}</span>
                      <span className="block font-sans font-medium">{log.timestamp.substring(11)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* RENDER VIEW 2: UTILISATEURS / CLIENTS CENTRE (Full screen page) */}
      {activeView === 'users' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-4 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-805">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Utilisateurs & Fiches d'adhésion</h2>
                <p className="text-[10px] text-slate-450">Fichier bancaire centralisé de la plateforme MOBIKISSI</p>
              </div>
            </div>

            {/* Quick manual user inject */}
            <button
              onClick={() => {
                const freshId = `u-[cl]-${Date.now()}`;
                const freshClient: User = {
                  id: freshId,
                  name: 'Nouveau Parrainé ' + Math.floor(10 + Math.random()*90),
                  role: 'CLIENT',
                  email: 'test@mobikissi.cg',
                  phone: '06 880 ' + Math.floor(1000 + Math.random() * 8999),
                  agency: 'Direction Générale',
                  zone: 'Zone B - Ouenze',
                  status: 'active',
                  balance: 500,
                  createdAt: new Date().toISOString(),
                  seniorityWeeks: 2
                };
                setUsers(p => [...p, freshClient]);
                recordAudit('Nouveau Client Enregistré', `${freshClient.name}`);
                triggerToast(`✓ Client créé automatiquement.`);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold uppercase flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau client</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Recherche par nom, téléphone, numéro client ou carte..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-2">Rapport d'Emplacement</th>
                  <th className="py-2">Téléphone / Contact</th>
                  <th className="py-2 text-right">Fonds Épargnés</th>
                  <th className="py-2 text-right">Ancienneté</th>
                  <th className="py-2 text-center">Statut</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[11px] font-bold">
                {clients.filter(c => c.name.toLowerCase().includes(userQuery.toLowerCase()) || c.phone.includes(userQuery)).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/10">
                    <td className="py-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 font-black text-center flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-black text-slate-905 dark:text-white block">{c.name}</span>
                        <span className="text-[9px] text-slate-450 font-mono font-medium block">Zone : {c.zone}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-500">{c.phone}</td>
                    <td className="py-3 text-right font-mono font-black text-indigo-550 dark:text-indigo-400">
                      {(c.balance || 0).toLocaleString()} FCFA
                    </td>
                    <td className="py-3 text-right text-slate-500 font-semibold">{c.seniorityWeeks || 0} sem.</td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-550'}`}>
                        {c.status === 'active' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedClientId(c.id);
                          navigateTo('dossier-client');
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-150 text-indigo-650 rounded-lg text-[10px] font-extrabold uppercase cursor-pointer"
                      >
                        Dossier complet
                      </button>
                      <button
                        onClick={() => handleClientBlock(c.id)}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer ${c.status === 'active' ? 'hover:bg-amber-500' : 'hover:bg-emerald-500'}`}
                        title={c.status === 'active' ? 'Suspendre' : 'Activer'}
                      >
                        {c.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW 3: DOSSIER CLIENT COMPLET (Full screen detailed profile page) */}
      {activeView === 'dossier-client' && activeInspectedClient && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-6 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-805">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest font-mono">Dossier Épargnant</h4>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">{activeInspectedClient.name}</h2>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleResetPassword(activeInspectedClient.name)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 dark:hover:bg-slate-800 rounded-xl text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Code d'accès</span>
              </button>
              <button 
                onClick={() => handleClientBlock(activeInspectedClient.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer ${activeInspectedClient.status === 'active' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'}`}
              >
                {activeInspectedClient.status === 'active' ? 'Suspendre' : 'Réactiver'}
              </button>
              <button 
                onClick={() => handleClientDelete(activeInspectedClient.id)}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT PROFILE CARD */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-850">
              <span className="block text-[10px] font-black uppercase text-indigo-500 font-mono">INFORMATIONS PERSONNELLES</span>
              <div className="space-y-2 text-[11px] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                <p><strong>Téléphone :</strong> <span className="font-mono">{activeInspectedClient.phone}</span></p>
                <p><strong>E-mail :</strong> {activeInspectedClient.email}</p>
                <p><strong>Agence régionale :</strong> {activeInspectedClient.agency || 'Brazzaville'}</p>
                <p><strong>Zone couverte :</strong> {activeInspectedClient.zone}</p>
                <p><strong>Ancienneté d'épargne :</strong> {activeInspectedClient.seniorityWeeks || 0} semaines</p>
                <p><strong>Créé le :</strong> {new Date(activeInspectedClient.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 text-center">
                <span className="text-[10px] text-slate-400 block font-bold">SOLDE DU COMPTE D'ÉPARGNE</span>
                <span className="text-xl font-black font-mono text-emerald-600 tracking-tight block mt-1">
                  {(activeInspectedClient.balance || 0).toLocaleString()} FCFA
                </span>
                <button
                  onClick={() => {
                    alert(`Génération de l'état de compte consolidé pour ${activeInspectedClient.name}. Total versements : ${inspectedTxs.filter(t => t.type === 'depot').length}. Document envoyé au périphérique impression.`);
                    recordAudit('Impression Fiche Client', `Fiche Épargne de ${activeInspectedClient.name}`);
                  }}
                  className="mt-3.5 w-full py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le relevé</span>
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: CARDS AND TRANSACTIONS */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Pointing cards section */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                <div className="flex justify-between items-center bg-transparent">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 font-mono">CARTES DE POINTAGE ASSOCIEES ({inspectedCards.length})</span>
                  <div className="flex gap-1.5">
                    {[500, 1000, 2000].map(v => (
                      <button
                        key={v}
                        onClick={() => handleCreateCardDirect(activeInspectedClient.id, v)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-black text-[9px] uppercase cursor-pointer"
                      >
                        + {v} F
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {inspectedCards.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Aucune de carte de pointage active sur ce compte.</p>
                  ) : (
                    inspectedCards.map(car => (
                      <div key={car.id} className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-[12px] text-slate-905 dark:text-white block">{car.cardNumber}</span>
                          <span className="text-[9px] text-slate-450 block font-medium">Cotisation : <strong className="text-slate-700 dark:text-slate-300">{car.amount.toLocaleString()} FCFA / versement</strong></span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-indigo-505 block">{car.filledCells.length} / 31 Carreaux</span>
                          <span className={`text-[8px] font-black uppercase ${car.isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {car.isCompleted ? 'Complétée (Contrat 31è validé)' : 'En cours de pointage'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transactions list */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                <span className="block text-[10px] font-black uppercase text-indigo-500 font-mono">HISTORIQUE DES TRANSACTIONS RECENTES ({inspectedTxs.length})</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {inspectedTxs.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Aucune transaction recensée pour le moment.</p>
                  ) : (
                    inspectedTxs.map(tx => (
                      <div key={tx.id} className="p-2.5 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-805 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-905 dark:text-white capitalize block">{tx.type === 'depot' ? 'Pointage Versement' : tx.type}</span>
                          <span className="text-[9px] text-slate-450 block font-medium">Par : Enregistré par agent {tx.agentName}</span>
                        </div>
                        <div className="text-right font-mono text-[11px] font-black">
                          <span className={tx.type === 'depot' ? 'text-emerald-550' : 'text-rose-500'}>
                            {tx.type === 'depot' ? '+' : '-'} {tx.amount.toLocaleString()} F
                          </span>
                          <span className="block text-[8px] text-slate-400 font-normal font-sans">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* RENDER VIEW 4: CENTRE DES CARTES */}
      {activeView === 'cards' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-5 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Centre de Gestion des Cartes Souches</h2>
                <p className="text-[10px] text-slate-450">Suivi et audit des livrets de pointage physique sur le terrain</p>
              </div>
            </div>

            <div className="flex gap-1.5 font-mono">
              {['all', 'completed', 'active'].map(f => (
                <button
                  key={f}
                  onClick={() => setCardFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer ${cardFilter === f ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 border border-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-405'}`}
                >
                  {f === 'all' ? 'Toutes' : f === 'completed' ? 'Terminées' : 'En cours'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards
              .filter(c => {
                if (cardFilter === 'completed') return c.isCompleted;
                if (cardFilter === 'active') return !c.isCompleted;
                return true;
              })
              .map(car => {
                const ownerUser = clients.find(cl => cl.id === car.clientId);
                return (
                  <div key={car.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white block">{car.cardNumber}</span>
                        <span className="text-[10px] text-indigo-500 font-extrabold block mt-0.5">{ownerUser?.name || 'Inconnu'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${car.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-805'}`}>
                        {car.isCompleted ? 'COMPLÈTE' : 'EN CONTRIBUTION'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Cases validées :</span>
                        <span className="font-mono text-slate-850 dark:text-white">{car.filledCells.length} / 31 cases</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${(car.filledCells.length / 31) * 100}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="font-mono text-slate-500">Unité : {car.amount.toLocaleString()} FCFA</span>
                      <button
                        onClick={() => {
                          if (confirm(`Voulez-vous suspendre définitivement l'adhésion associée à la carte ${car.cardNumber} ?`)) {
                            // Toggle rule31 applied to mock suspension
                            setCards(prev => prev.map(p => p.id === car.id ? { ...p, isCompleted: !p.isCompleted } : p));
                            recordAudit('Changement de Règle de Carte', `${car.cardNumber}`);
                            triggerToast('✓ Clause de la carte modifiée.');
                          }
                        }}
                        className="text-[9px] text-rose-500 hover:underline"
                      >
                        Archiver / Fermer
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* RENDER VIEW 5: CENTRE FINANCIER DETAILED LEDGER */}
      {activeView === 'finance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-5 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Registre Centralisateur des Encaissements</h2>
                <p className="text-[10px] text-slate-450">Historique général des transactions physiques sur le réseau MOBIKISSI</p>
              </div>
            </div>

            <div className="flex gap-1">
              {[
                { label: 'Jour', val: 'day' },
                { label: 'Mois', val: 'month' }
              ].map(t => (
                <button
                  key={t.val}
                  onClick={() => setFinanceTimeframe(t.val as any)}
                  className={`px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${financeTimeframe === t.val ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-black' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-2.5">Date transaction</th>
                  <th className="py-2.5">Adhérent</th>
                  <th className="py-2.5">Zone de collecte</th>
                  <th className="py-2.5">Agent d'opération</th>
                  <th className="py-2.5 text-right font-mono">Montant brut</th>
                  <th className="py-2.5 text-center">Rapport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-51 dark:divide-slate-805 text-[11px] font-bold">
                {transactions
                  .filter(tx => {
                    if (financeTimeframe === 'day') return tx.createdAt.startsWith(todayStr);
                    return true;
                  })
                  .map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="py-3 font-mono text-slate-400">{new Date(tx.createdAt).toLocaleDateString('fr-FR')} • {tx.createdAt.substring(11, 16)}</td>
                      <td className="py-3 text-slate-905 dark:text-white">{tx.clientName}</td>
                      <td className="py-3 max-w-xs truncate text-slate-500 font-medium">{tx.zone}</td>
                      <td className="py-3 text-slate-500 font-medium">{tx.agentName}</td>
                      <td className={`py-3 text-right font-mono font-black ${tx.type === 'depot' ? 'text-emerald-550' : 'text-rose-500'}`}>
                        {tx.type === 'depot' ? '+' : '-'} {tx.amount.toLocaleString()} F
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${tx.status === 'validated' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-805'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW 6: CENTRE D'ASSISTANCES & FINANCEMENTS */}
      {activeView === 'assistances' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-5 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Accompagnements Entrepreneuriaux (Soutiens)</h2>
                <p className="text-[10px] text-slate-450">Examen des demandes de prêts sociaux de la coopérative</p>
              </div>
            </div>
            <span className="font-mono text-xs font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-650 px-3 py-1 rounded-xl">
              Taux global d'intérêt : +{settings.defaultInterestRate}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-2.5">Adhérent Demandeur</th>
                  <th className="py-2.5">Domaine d'Activité</th>
                  <th className="py-2.5 text-right font-mono">Capital requis</th>
                  <th className="py-2.5 text-right font-mono">À rembourser</th>
                  <th className="py-2.5 text-right font-mono">Déjà collecté</th>
                  <th className="py-2.5 text-center">Statut d'approbation</th>
                  <th className="py-2.5 text-right">Actions administratives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[11px] font-bold">
                {assistances.map(as => {
                  const rem = as.repaymentAmount - as.repaidAmount;
                  return (
                    <tr key={as.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                      <td className="py-3">
                        <span className="font-black text-slate-900 dark:text-white block">{as.clientName}</span>
                        <span className="text-[9px] text-slate-400 italic">Notes d'accompagnement : "{as.notes || 'Aucune'}"</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded text-[9px] font-black uppercase">
                          {as.domain}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-905 dark:text-white">{as.amount.toLocaleString()} F</td>
                      <td className="py-3 text-right font-mono text-slate-500">{as.repaymentAmount.toLocaleString()} F</td>
                      <td className="py-3 text-right font-mono text-emerald-500">{as.repaidAmount.toLocaleString()} F</td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          as.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          as.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          as.status === 'refused' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                          {as.status === 'approved' ? 'En cours' : as.status === 'pending' ? 'En attente' : as.status === 'refused' ? 'Rejeté' : 'Remboursé'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {as.status === 'pending' && (
                          <div className="flex justify-end gap-1.5">
                            <button
                              id={`approve-assistance-btn-${as.id}`}
                              onClick={() => {
                                onManageAssistance(as.id, 'approved');
                                recordAudit('Validation Prêt Assistance', `Approuvé pour ${as.clientName}`);
                                triggerToast('✓ Dossier de subvention sociale validé conforment.');
                              }}
                              className="px-2 py-1 bg-emerald-500 text-white rounded text-[9px] font-black uppercase cursor-pointer border-0"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => {
                                onManageAssistance(as.id, 'refused');
                                recordAudit('Rejet Prêt Assistance', `Réfusé pour ${as.clientName}`);
                                triggerToast('✕ Demande d\'assistance rejetée.');
                              }}
                              className="px-2 py-1 bg-rose-500 text-white rounded text-[9px] font-black uppercase cursor-pointer border-0"
                            >
                              Refuser
                            </button>
                          </div>
                        )}
                        {as.status === 'approved' && (
                          <button
                            id={`solder-assistance-btn-${as.id}`}
                            onClick={() => {
                              onManageAssistance(as.id, 'refunded');
                              recordAudit('Clôture Prêt Assistance', `Financement marqué remboursé pour ${as.clientName}`);
                              triggerToast('✓ Dossier soldé et remboursé !');
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[9px] font-black uppercase cursor-pointer border-0"
                          >
                            Marquer comme soldé
                          </button>
                        )}
                        {as.status === 'refunded' && <span className="text-[10px] text-slate-400">Archivé</span>}
                        {as.status === 'refused' && <span className="text-[10px] text-rose-450 font-semibold">Refusé</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW 7: GESTION DU PERSONNEL / EMPLOYÉS */}
      {activeView === 'personnel' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-6 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Ressources Humaines & Effectif</h2>
                <p className="text-[10px] text-slate-450">Gestion des contrats et grilles de personnel</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* INJECT CONTRACT FORM */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
              <span className="block text-[10px] font-black uppercase text-indigo-500 font-mono">RECRUTER UN NOUVEL AGENT DE TERRAIN OR STAFF</span>
              <form onSubmit={handleCreateNewStaff} className="space-y-3 font-semibold">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Nom complet d'employé</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    placeholder="ex. Guy-Aimé Samba"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Grade / Rôle</label>
                    <select
                      className="w-full text-[11px] p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white focus:outline-none"
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as any)}
                    >
                      <option value="RECOUVREUR">Agent Recouvreur</option>
                      <option value="SUPERVISEUR">Superviseur Terrain</option>
                      <option value="CAISSIER">Gestionnaire Caisse</option>
                      <option value="CALL_CENTER">Conseiller Call Center</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Zone d'Affectation</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2 bg-white dark:bg-slate-900 border"
                      placeholder="ex. Zone B - Ouenze"
                      value={newStaffZone}
                      onChange={(e) => setNewStaffZone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Téléphone</label>
                    <input
                      type="text"
                      required
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      className="w-full text-xs p-2 bg-white dark:bg-slate-900 border"
                      placeholder="06 902 4580"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Fonds Base Fixe (F)</label>
                    <input
                      type="number"
                      value={newStaffSalary}
                      onChange={(e) => setNewStaffSalary(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white dark:bg-slate-900 border"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase rounded-lg border-0 cursor-pointer"
                >
                  Valider le contrat
                </button>
              </form>
            </div>

            {/* EFFECTIF LIST */}
            <div className="lg:col-span-2 space-y-3">
              <span className="block text-[10px] font-black uppercase text-indigo-500 font-mono">LISTE DES COLLEGUES ET EMPLOYÉS COOPÉRATIVE</span>
              <div className="divide-y divide-slate-100 dark:divide-slate-805">
                {staff.map(emp => (
                  <div key={emp.id} className="py-3 flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2.5 bg-transparent">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-905 dark:text-white block">{emp.name}</span>
                          <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-650 rounded text-[8px] font-black">
                            {emp.role}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-450 font-medium block">Zone : {emp.zone} • {emp.phone}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-slate-905 dark:text-white block">{(emp.baseSalary || 120000).toLocaleString()} F / mois</span>
                      <button
                        onClick={() => handleSuspendStaff(emp.id, emp.name)}
                        className={`text-[9px] uppercase font-black tracking-wider cursor-pointer ${emp.status === 'active' ? 'text-rose-500' : 'text-emerald-500'}`}
                      >
                        {emp.status === 'active' ? 'Revoquer' : 'Agréer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER VIEW 8: SYSTÈME DE PERMISSIONS GLOBAUX */}
      {activeView === 'permissions' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-6 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Système de permissions par Grade</h2>
                <p className="text-[10px] text-slate-450">Déterminez dynamiquement qui possède le droit d'exécuter des requêtes sensibles</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans font-bold">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-3">Option Fonctionnelle</th>
                  {Object.keys(rolesPermissions).map(role => (
                    <th key={role} className="py-3 text-center">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[11px]">
                {[
                  'Créer Client', 'Créer Carte', 'Encaisser', 'Retrait', 
                  'Assistance', 'Voir Rapports', 'Modifier Utilisateurs', 'Voir Solde', 'Voir Salaires'
                ].map(permission => (
                  <tr key={permission} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 text-slate-905 dark:text-white font-black">{permission}</td>
                    {Object.keys(rolesPermissions).map(role => (
                      <td key={role} className="py-3.5 text-center">
                        <input
                          id={`perm-check-${role}-${permission}`}
                          type="checkbox"
                          checked={rolesPermissions[role][permission]}
                          onChange={() => togglePermission(role, permission)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PERMISSIONS SUPPLÉMENTAIRES ADMINISTRATEUR POUR LE CALL CENTER */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider">
                Permissions supplémentaires administrateur (Call Center)
              </h3>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              En tant que Président Directeur Général (PDG), vous pouvez accorder ou révoquer les accès et permissions de manière granulaire pour le Call Center MOBIKISSI :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { key: 'showBalance', label: 'Voir les soldes clients' },
                { key: 'showCards', label: 'Voir les cartes' },
                { key: 'createAppointments', label: 'Créer des rendez-vous' },
                { key: 'createClaims', label: 'Créer des réclamations' },
                { key: 'sendSms', label: 'Envoyer SMS' },
                { key: 'viewAssistances', label: 'Voir les assistances' },
                { key: 'viewRefunds', label: 'Voir les remboursements' },
                { key: 'accessReports', label: 'Accéder aux rapports' },
                { key: 'viewPersonalInfo', label: 'Voir les informations personnelles' },
                { key: 'exportData', label: 'Exporter les données' },
              ].map(item => (
                <label 
                  key={item.key} 
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-100/50 cursor-pointer text-xs font-bold transition"
                >
                  <input
                    type="checkbox"
                    checked={callCenterPermissions?.[item.key as keyof typeof callCenterPermissions] ?? true}
                    onChange={() => {
                      if (onUpdateCallCenterPermissions) {
                        onUpdateCallCenterPermissions({
                          ...callCenterPermissions,
                          [item.key]: !callCenterPermissions?.[item.key as keyof typeof callCenterPermissions]
                        });
                      }
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 9: ORGANIGRAMME VISUEL HISTORIQUE */}
      {activeView === 'organigramme' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-6 animate-slideIn text-center">
          <div className="text-left flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-850">
            <button onClick={navigateBack} className="p-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Organigramme Hiérarchique de Décision</h2>
              <p className="text-[10px] text-slate-450">Filiation de chaîne de valeur de l'entreprise</p>
            </div>
          </div>

          {/* VISUAL DIAGRAM CANVAS */}
          <div className="py-10 max-w-2xl mx-auto space-y-8 flex flex-col items-center">
            
            {/* Level 1 */}
            <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-md w-48 text-center relative group">
              <Crown className="w-5 h-5 mx-auto text-amber-400 mb-1" />
              <span className="font-black text-xs block">PRÉSIDENT DIR. GÉNERAL</span>
              <span className="text-[9px] text-slate-400 block font-light">Contrôle Global du Réseau</span>
            </div>

            <div className="w-1 h-8 bg-neutral-300 dark:bg-neutral-800" />

            {/* Level 2 */}
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-48 text-center shadow-sm">
              <ShieldAlert className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
              <span className="font-black text-[11px] block">DIRECTEUR DES AFFAIRES</span>
              <span className="text-[9px] text-slate-450 block">Audit du District Brazzaville</span>
            </div>

            <div className="w-1 h-8 bg-neutral-300 dark:bg-neutral-800" />

            {/* Level 3 */}
            <div className="flex justify-between w-full max-w-xl">
              
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border w-40 text-center shadow-sm">
                <Users className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                <span className="font-black text-[11px] block">SUPERVISEURS (5)</span>
                <span className="text-[9px] text-slate-450 block">Contrôle de Recouvreurs</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border w-40 text-center shadow-sm">
                <Landmark className="w-4 h-4 mx-auto text-teal-500 mb-1" />
                <span className="font-black text-[11px] block">GESTIONNAIRES (2)</span>
                <span className="text-[9px] text-slate-450 block">Tenue Caisse & Coffre-Fort</span>
              </div>

            </div>

            <div className="w-1 h-8 bg-neutral-300 dark:bg-neutral-800" />

            {/* Level 4 */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-48 text-center shadow-sm">
              <UserCheck className="w-4 h-4 mx-auto text-orange-500 mb-1" />
              <span className="font-black text-[11px] block">AGENTS RECOUVREURS ({agentsCount})</span>
              <span className="text-[9px] text-slate-450 block">Saisie & Contact Épargnants</span>
            </div>

          </div>
        </div>
      )}

      {/* RENDER VIEW 10: GESTION DES THÈMES INTERFACES */}
      {activeView === 'themes' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-6 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Charte Graphique & Thèmes (10 Thèmes Premium)</h2>
                <p className="text-[10px] text-slate-450">Sélectionnez l'habillage thématique officiel de la corporation</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themesList.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  onThemeSelect(t.id);
                  recordAudit('Modication Thème Universel', `Thème ID : ${t.id}`);
                  triggerToast(`✓ Thème ${t.name} activé conforment.`);
                }}
                className={`p-5 rounded-2xl text-left border font-bold transition-all shadow-sm flex flex-col justify-between h-28 cursor-pointer ${selectedTheme.id === t.id ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-950/20' : 'bg-white dark:bg-slate-900 border-slate-150'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${t.primary} inline-block shadow-inner`} />
                  <span className="text-xs">{t.name}</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  <span>ID: {t.id}</span>
                  <span className="block font-medium mt-1">Sert de preset de base pour tous les districts interconnectés</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RENDER VIEW 11: JOURNAL D'AUDIT COMPLET */}
      {activeView === 'audit' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-5 animate-slideIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-3">
              <button onClick={navigateBack} className="p-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Registre d'Audit Global Non Alterable</h2>
                <p className="text-[10px] text-slate-450">Traçabilité complète cryptologique des actions de terrains</p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-xl">🔒 SECURE LEDGER</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-2.5">Date et Heure</th>
                  <th className="py-2.5">Opérateur</th>
                  <th className="py-2.5">Action constatée</th>
                  <th className="py-2.5">Cible d'Opération</th>
                  <th className="py-2.5">Dispositif / Appareil</th>
                  <th className="py-2.5 text-right">Adresse Reseau (IP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[10px] font-semibold text-slate-500">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 font-bold text-slate-400">{log.timestamp}</td>
                    <td className="py-3 text-slate-900 dark:text-white font-extrabold">{log.user}</td>
                    <td className="py-3 font-bold">{log.action}</td>
                    <td className="py-3 text-slate-760 dark:text-slate-350">{log.target}</td>
                    <td className="py-3 font-sans">{log.device}</td>
                    <td className="py-3 text-right">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW 12: PARAMÈTRES ET BRANDING DE LA PLATEFORME */}
      {activeView === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 max-w-3xl animate-slideIn space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-850">
            <button onClick={navigateBack} className="p-2 bg-slate-101 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Paramètres Globaux de la plateforme</h2>
              <p className="text-[10px] text-slate-450">Contrôle des taux d'intérêt, adhésion et clause contractuelle</p>
            </div>
          </div>

          <form onSubmit={handleSaveParams} className="space-y-4 font-bold text-slate-800 dark:text-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nom commercial Plateforme</label>
                <input
                  type="text"
                  className="w-full text-xs p-2.5 bg-slate-50 border"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Taux Intérêt d'Assistance (%)</label>
                <input
                  type="number"
                  className="w-full text-xs p-2.5 bg-slate-50 border font-mono"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Frais d'Adhésion (FCFA)</label>
                <input
                  type="number"
                  className="w-full text-xs p-2.5 bg-slate-50 border font-mono"
                  value={openingFee}
                  onChange={(e) => setOpeningFee(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Adresse Siège Social</label>
                <input
                  type="text"
                  className="w-full text-xs p-2.5 bg-slate-50 border"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Texte Administratif Règle du 31è Carreau</label>
              <textarea
                rows={3}
                className="w-full text-xs p-2.5 bg-slate-50 border font-semibold"
                value={rule31Text}
                onChange={(e) => setRule31Text(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-0"
            >
              Sauvegarder les règles
            </button>
          </form>
        </div>
      )}

      {/* RENDER VIEW 13: CENTRE DE DÉTECTION DES ALERTE ANOMALIES (Centre d'alertes intelligent) */}
      {activeView === 'alerts' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 space-y-5 animate-slideIn">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-105 dark:border-slate-850">
            <button onClick={navigateBack} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-905 dark:text-white uppercase tracking-tight">Centre Intelligent de Détection des Anomalies (IA-Watch)</h2>
              <p className="text-[10px] text-slate-450">Heuristiques d'analyse en temps de protection du capital coopératif</p>
            </div>
          </div>

          <div className="space-y-3">
            {anomaliesList.map(anom => (
              <div
                key={anom.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 font-bold ${
                  anom.severity === 'critical' ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/10' :
                  anom.severity === 'warning' ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/10' : 
                  'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/10'
                }`}
              >
                <div className="flex items-center gap-3 bg-transparent">
                  <div className={`p-2.5 rounded-xl ${
                    anom.severity === 'critical' ? 'bg-rose-100 text-rose-600' :
                    anom.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-indigo-100 text-indigo-500'
                  }`}>
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block opacity-75">{anom.type}</span>
                    <span className="text-xs text-slate-900 dark:text-white block mt-0.5">{anom.title}</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{anom.desc}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert(`Action corrective exécutée : Envoi immédiat d'une mise en demeure ou consigne par SMS.`);
                    recordAudit('Consigne de Correction', `${anom.type}`);
                    triggerToast("✓ Renseignements transmis.");
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-[9px] uppercase tracking-wider cursor-pointer border-0"
                >
                  Envoyer instruction
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER VIEW 14: INTERACTIVE IA MOBIKISSI ASSISTANT ENGINE */}
      {activeView === 'ia' && (
        <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-900 space-y-6 animate-slideIn">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
            <button onClick={navigateBack} className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer text-white border-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-400 font-black">ASSISTANT LOGIQUE INTÉGRÉ</span>
              <h2 className="text-md font-black text-white uppercase tracking-tight">IA MOBIKISSI CONSEILS</h2>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Interrogez en direct les indicateurs de rendement de la coopérative financière. L'intelligence locale calcule les réponses réelles à partir du registre en cours.
          </p>

          {/* Quick predefined prompt lists */}
          <div className="flex flex-wrap gap-2 pt-1 font-sans">
            {[
              { text: "Meilleurs agents de collecte", icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { text: "Revenus récoltés à Massina", icon: <MapPin className="w-3.5 h-3.5" /> },
              { text: "Adhérents éligibles à l'assistance", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
              { text: "Remboursements à suivre cette semaine", icon: <Clock className="w-3.5 h-3.5" /> }
            ].map(p => (
              <button
                key={p.text}
                type="button"
                onClick={() => handleAiAsk(p.text)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border border-slate-800"
              >
                {p.icon}
                <span>{p.text}</span>
              </button>
            ))}
          </div>

          {/* Prompt result area */}
          <AnimatePresence mode="wait">
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-5 bg-slate-900/60 rounded-2xl border border-slate-900 space-y-4"
              >
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-slate-300 font-bold whitespace-pre-line">{aiResponse.text}</p>
                </div>

                {/* GRAPH OPTION */}
                {aiResponse.type === 'chart' && (
                  <div className="h-48 pt-4 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aiResponse.data}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ background: '#020617', border: 'none' }} />
                        <Bar dataKey="Collectes" fill="#dd6b20" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* TABLE OPTION */}
                {aiResponse.type === 'table' && (
                  <div className="pt-2">
                    <table className="w-full text-left font-sans text-[11px] font-bold">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                          {Object.keys(aiResponse.data[0]).map(k => (
                            <th key={k} className="py-2">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-950">
                        {aiResponse.data.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-950/40">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="py-2.5 text-slate-305">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={(e) => { e.preventDefault(); handleAiAsk(aiQuery); }} className="relative">
            <input
              type="text"
              required
              placeholder="Posez votre question administrative personnalisée..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-3.5 top-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer border-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
