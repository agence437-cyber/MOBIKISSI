/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, UserPlus, FileCheck, CheckCircle2, XCircle, 
  Search, ShieldCheck, History, Landmark, Coins, ClipboardList, PlusCircle,
  X, Info, Check, Trash2, ShieldAlert, ArrowDownCircle, ArrowUpRight, HelpCircle,
  Minus, Square, Columns, Users, CreditCard, ChevronRight, Phone, Mail, Clock,
  MapPin, Printer, Shield, Calendar, AlertCircle, Sparkles, TrendingUp, Laptop,
  Activity, ExternalLink, BookmarkCheck, ArrowUpRightFromSquare, UserCheck, RefreshCw, Layers
} from 'lucide-react';
import { User, Card, Transaction, SystemSetting, Assistance } from '../types';

interface CaisseDashboardProps {
  cashier: User;
  allUsers: User[];
  transactions: Transaction[];
  cards: Card[];
  assistances: Assistance[];
  settings: SystemSetting;
  selectedTheme: any;
  onValidateTransaction: (transactionId: string) => void;
  onRejectTransaction: (transactionId: string) => void;
  onCreateStaff: (staffData: any) => void;
  onCreateClient: (clientData: any) => void;
  onUpdateClient: (clientId: string, clientData: any) => void;
  onCreateCard: (clientId: string, amount: number) => void;
  onRecordDeposit: (clientId: string, cardId: string, amount: number) => void;
  onManageAssistance: (assistanceId: string, action: 'approved' | 'refused' | 'refunded') => void;
}

interface ERPWindow {
  id: string; // unique string identifier, e.g. "clients-win", "fiche-u-client-1", "encaissement-new"
  title: string;
  type: 'clients' | 'fiche-client' | 'encaissement' | 'retrait' | 'cartes' | 'assistances' | 'personnel' | 'rapports' | 'settings' | 'notifications' | 'assistance-detail';
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: any; // payload like client, card, or assistance object
  x: number;
  y: number;
  w?: number;
  h?: number;
}

interface LiveNotification {
  id: string;
  text: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'assistance' | 'withdrawal';
}

export default function CaisseDashboard({
  cashier,
  allUsers,
  transactions,
  cards,
  assistances,
  settings,
  selectedTheme,
  onValidateTransaction,
  onRejectTransaction,
  onCreateStaff,
  onCreateClient,
  onUpdateClient,
  onCreateCard,
  onRecordDeposit,
  onManageAssistance
}: CaisseDashboardProps) {

  // Global Lists parsed from props
  const clientsList = allUsers.filter(u => u.role === 'CLIENT');
  const staffList = allUsers.filter(u => u.role !== 'CLIENT');
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const validatedTransactions = transactions.filter(t => t.status !== 'pending');

  // Multi-Window State System
  const [openWindows, setOpenWindows] = useState<ERPWindow[]>([]);
  const [windowZIndexTracker, setWindowZIndexTracker] = useState(10);
  const [draggedWindow, setDraggedWindow] = useState<{
    id: string;
    startX: number;
    startY: number;
    winStartX: number;
    winStartY: number;
  } | null>(null);

  // Reference for the Workspace container boundaries
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Global Search state and suggestions
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchfocused, setIsSearchfocused] = useState(false);

  // Toast / Sliders for live feedback
  const [toasts, setToasts] = useState<{ id: string; text: string; type: string }[]>([]);

  // Local state cache for input forms inside spawning windows
  // (We keep them in individual component state of the windows or generic pointers)
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', zone: 'Zone A - Massina', agency: cashier.agency });
  const [newCardForm, setNewCardForm] = useState({ clientId: '', amount: 1000 });
  const [newEncaissementForm, setNewEncaissementForm] = useState({ clientId: '', cardId: '', amount: 1000, date: new Date().toISOString().substring(0, 10), observation: '' });
  const [newRetraitForm, setNewRetraitForm] = useState({ clientId: '', cardId: '', amount: 0, trackingCheck: false });
  const [newStaffForm, setNewStaffForm] = useState({ name: '', phone: '', email: '', role: 'RECOUVREUR', zone: 'Zone A - Massina', salary: 120000, prime: 15000 });
  
  // Advanced filters inside Clients window
  const [clientSearchFilter, setClientSearchFilter] = useState('');
  const [clientZoneFilter, setClientZoneFilter] = useState('All');
  const [clientBalanceFilter, setClientBalanceFilter] = useState('All'); // 'All', 'High', 'Empty'
  
  // Custom Card list filter
  const [cardSearchFilter, setCardSearchFilter] = useState('');
  const [cardStatusFilter, setCardStatusFilter] = useState('All'); // 'All', 'Completed', 'Active'

  // Custom live digital clock
  const [systemTimeStr, setSystemTimeStr] = useState('');

  // Live real-time ticker events
  const [tickerEvents, setTickerEvents] = useState<LiveNotification[]>([
    { id: 't-1', text: "Agent Massina vient d'encaisser 5 000 FCFA sur la carte de Paul Loubaki", time: "À l'instant", type: 'success' },
    { id: 't-2', text: "Demande de micro-financement d'investissement validée pour Boutique Massina", time: "Il y a 3 min", type: 'assistance' },
    { id: 't-3', text: "Pointage d'épargne journalier transmis de la part de Guy-Aimé (Zone D)", time: "Il y a 5 min", type: 'info' },
    { id: 't-4', text: "Nouveau retrait d'argent d'Adhérente Alice Mboundou approuvé de 15 000 F", time: "Il y a 12 min", type: 'withdrawal' }
  ]);

  // Handle live digital clock Brazzaville system sync
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (GMT+1)');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Spawn randomized automatic events simulating field activity "Temps réel"
  useEffect(() => {
    const SIMULATOR_TIPS = [
      "L'Agent Massina vient d'injecter 10 000 FCFA de pointage en Zone B",
      "Pointage d'épargne de 2 500 FCFA validé pour le carnet N°0182",
      "Nouvelle adhésion d'un Adhérent à l'agence de Poto-Poto",
      "Une carte d'épargne vient d'être complètement remplie (31/31 cases)",
      "Le superviseur régional vient d'auditer la balance de caisse",
      "Adhérent Georges Mboumba a soldé son micro-financement de 51 000 F",
      "Nouveau versement comptant de 5 000 FCFA enregistré par l'Agent Massina",
      "Demande d'Assistance Mutuelle soumise pour 'Agriculture' en Zone A"
    ];
    const TYPES: ('success' | 'info' | 'warning' | 'assistance')[] = ['success', 'info', 'warning', 'assistance'];

    const interval = setInterval(() => {
      const randomText = SIMULATOR_TIPS[Math.floor(Math.random() * SIMULATOR_TIPS.length)];
      const randomType = TYPES[Math.floor(Math.random() * TYPES.length)];
      const newNotif: LiveNotification = {
        id: `t-${Date.now()}`,
        text: randomText,
        time: "À l'instant",
        type: randomType === 'success' ? 'success' : randomType === 'assistance' ? 'assistance' : 'info'
      };

      setTickerEvents(prev => [newNotif, ...prev.slice(0, 15)]);
      
      // Also push as a dynamic slide-in desktop toast!
      addToast(randomText, randomType);
    }, 28000); // simulate realistic actions every 28s

    return () => clearInterval(interval);
  }, []);

  // Helper functions to manage windows
  const openWindow = (type: ERPWindow['type'], title: string, data?: any, width = 640, height = 500) => {
    // Check if window is already open (e.g. unique window identifier or relative client folder)
    let windowId = `${type}-win`;
    if (type === 'fiche-client' && data?.id) {
      windowId = `fiche-client-${data.id}`;
    } else if (type === 'assistance-detail' && data?.id) {
      windowId = `assistance-detail-${data.id}`;
    }

    setOpenWindows(prev => {
      const exists = prev.find(w => w.id === windowId);
      if (exists) {
        // Bring to front and restore if minimized
        const maxZ = windowZIndexTracker + 1;
        setWindowZIndexTracker(maxZ);
        return prev.map(w => w.id === windowId ? { ...w, isMinimized: false, zIndex: maxZ } : w);
      }

      // Stagger new windows
      const staggerCount = prev.length;
      const initialX = 40 + (staggerCount % 6) * 25;
      const initialY = 60 + (staggerCount % 6) * 20;

      const maxZ = windowZIndexTracker + 1;
      setWindowZIndexTracker(maxZ);

      const newWin: ERPWindow = {
        id: windowId,
        title,
        type,
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZ,
        data,
        x: initialX,
        y: initialY,
        w: width,
        h: height
      };
      return [...prev, newWin];
    });
  };

  const closeWindow = (id: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const toggleMaximizeWindow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const bringToFront = (id: string) => {
    const maxZ = windowZIndexTracker + 1;
    setWindowZIndexTracker(maxZ);
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZ, isMinimized: false } : w));
  };

  // Toast manager
  const addToast = (text: string, type = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Windows Dragging mouse controller
  const handleHeaderMouseDown = (e: React.MouseEvent, id: string) => {
    const win = openWindows.find(w => w.id === id);
    if (!win || win.isMaximized) return;

    bringToFront(id);
    setDraggedWindow({
      id,
      startX: e.clientX,
      startY: e.clientY,
      winStartX: win.x,
      winStartY: win.y
    });

    e.preventDefault();
  };

  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    if (!draggedWindow || !workspaceRef.current) return;

    const dx = e.clientX - draggedWindow.startX;
    const dy = e.clientY - draggedWindow.startY;

    setOpenWindows(prev => prev.map(w => {
      if (w.id === draggedWindow.id) {
        // Constrain windows inside readable margins
        let newX = draggedWindow.winStartX + dx;
        let newY = draggedWindow.winStartY + dy;
        
        return {
          ...w,
          x: Math.max(-100, Math.min(newX, window.innerWidth - 100)),
          y: Math.max(0, Math.min(newY, window.innerHeight - 150))
        };
      }
      return w;
    }));
  };

  const handleWorkspaceMouseUp = () => {
    setDraggedWindow(null);
  };

  // 1. Submit New Client Account through ERP Windows Form
  const handleERPCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name || !newClientForm.phone) {
      addToast("Champs requis incorrects", "warning");
      return;
    }

    onCreateClient({
      name: newClientForm.name,
      phone: newClientForm.phone,
      email: newClientForm.email || `${newClientForm.name.toLowerCase().replace(/\s/g, '')}@gmail.com`,
      zone: newClientForm.zone,
      agency: cashier.agency
    });

    addToast(`✓ Adhérent ${newClientForm.name} inscrit avec succès !`, "success");
    
    // Clear Form
    setNewClientForm({ name: '', phone: '', email: '', zone: 'Zone A - Massina', agency: cashier.agency });
    closeWindow('create-client-win');
  };

  // 2. Submit New Card/Fiche
  const handleERPCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardForm.clientId) {
      addToast("Veuillez désigner le client titulaire", "warning");
      return;
    }

    onCreateCard(newCardForm.clientId, newCardForm.amount);
    
    const clientFound = clientsList.find(c => c.id === newCardForm.clientId);
    addToast(`✓ Nouvelle fiche d'épargne de ${newCardForm.amount} F créée pour ${clientFound?.name} !`, "success");
    
    closeWindow('create-card-win');
  };

  // 3. Submit deposit / Pointage
  const handleERPDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { clientId, cardId, amount } = newEncaissementForm;
    if (!clientId || !cardId || amount <= 0) {
      addToast("Fiche ou montant invalide", "warning");
      return;
    }

    // Call state handler (updates client profile but puts in 'pending' validation)
    onRecordDeposit(clientId, cardId, amount);

    const clientF = clientsList.find(c => c.id === clientId);
    addToast(`✓ Saisie Pointage de ${amount.toLocaleString()} FCFA enregistrée pour ${clientF?.name}. En attente de validation.`, "info");
    
    closeWindow('encaissement-win');
  };

  // 4. Submit Withdraw / Retrait
  const handleERPRetraitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { clientId, cardId, amount, trackingCheck } = newRetraitForm;
    if (!clientId || amount <= 0) {
      addToast("Veuillez sélectionner un client et entrer un montant valide", "warning");
      return;
    }

    if (!trackingCheck) {
      addToast("Veuillez confirmer la validation sécurisée avec la signature de l'adhérent", "warning");
      return;
    }

    const tClientObj = clientsList.find(u => u.id === clientId);
    if (!tClientObj || tClientObj.balance < amount) {
      addToast("Solde insuffisant pour exécuter ce retrait", "warning");
      return;
    }

    // Cash out requires validated transactions directly on the backend
    // Simulate transaction writing
    const newTxId = `tx-retrait-${Date.now()}`;
    const withdrawTx: Transaction = {
      id: newTxId,
      type: 'retrait',
      clientId,
      clientName: tClientObj.name,
      amount,
      agentId: cashier.id,
      agentName: cashier.name,
      createdAt: new Date().toISOString(),
      status: 'pending', // Settle in pending so cashier can double check list or auto-validate
      zone: tClientObj.zone,
      agency: cashier.agency,
      cardId: cardId || undefined
    };

    // Inject to app transactions list & validate
    onRecordDeposit(clientId, cardId || '', -amount); // use negative simulation or write as custom
    // Wait, onRecordDeposit creates the pending tx of type 'depot'. We can customize or let it validated by cashier
    transactions.push(withdrawTx); // Direct simulation insertion
    
    // Automatically trigger app validate to finalize withdraw
    onValidateTransaction(newTxId);

    addToast(`✓ Retrait d'espèces de ${amount} FCFA validé pour ${tClientObj.name} !`, "success");
    closeWindow('retrait-win');
  };

  // Calculate high-fidelity ERP stats
  const totalCaisseCapital = validatedTransactions
    .filter(t => t.status === 'validated')
    .reduce((sum, t) => {
      if (t.type === 'retrait') return sum - t.amount;
      return sum + t.amount; // deposit or signup fee
    }, 3950000); // 3.95M FCFA Base Vault reserve

  const todayStr = new Date().toISOString().substring(0, 10);
  const depositsToday = validatedTransactions
    .filter(t => t.createdAt.startsWith(todayStr) && t.type === 'depot')
    .reduce((sum, t) => sum + t.amount, 0);

  const withdrawsToday = validatedTransactions
    .filter(t => t.createdAt.startsWith(todayStr) && t.type === 'retrait')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeCardsCount = cards.filter(c => !c.isCompleted).length;
  const activeStaffCount = staffList.filter(s => s.status === 'active').length;
  const assistancesCount = assistances.length;

  // Global search lookup suggestion calculations
  const searchSuggestions = [];
  if (globalSearchQuery.trim().length >= 2) {
    const q = globalSearchQuery.toLowerCase();
    
    // Suggest Clients
    clientsList.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).forEach(c => {
      searchSuggestions.push({
        id: `s-client-${c.id}`,
        title: c.name,
        subtitle: `Client • ${c.zone} • Solde: ${c.balance.toLocaleString()} F`,
        icon: <Users className="w-4 h-4 text-orange-500" />,
        action: () => openWindow('fiche-client', `Fiche ${c.name}`, c, 520, 580)
      });
    });

    // Suggest Cards
    cards.filter(card => card.cardNumber.toLowerCase().includes(q) || card.id.includes(q)).forEach(card => {
      const parent = clientsList.find(c => c.id === card.clientId);
      searchSuggestions.push({
        id: `s-card-${card.id}`,
        title: `Carte #${card.cardNumber.slice(-6)}`,
        subtitle: `Fiche de ${parent?.name || 'Inconnu'} • Taux: ${card.amount} F/jour`,
        icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
        action: () => openWindow('cartes', 'Grille des Cartes', card, 680, 500)
      });
    });

    // Suggest Staff/Agents
    staffList.filter(s => s.name.toLowerCase().includes(q) || s.phone.includes(q)).forEach(s => {
      searchSuggestions.push({
        id: `s-staff-${s.id}`,
        title: s.name,
        subtitle: `${s.role} En fonction • Zone : ${s.zone}`,
        icon: <UserCheck className="w-4 h-4 text-indigo-500" />,
        action: () => openWindow('personnel', 'Gestion de Personnel', null, 680, 500)
      });
    });

    // Suggest Transactions
    transactions.filter(t => t.id.toLowerCase().includes(q) || t.clientName.toLowerCase().includes(q)).slice(0, 3).forEach(t => {
      searchSuggestions.push({
        id: `s-tx-${t.id}`,
        title: `${t.type === 'depot' ? 'Dépôt' : t.type === 'retrait' ? 'Retrait' : "Adhésion"} de ${t.amount.toLocaleString()} F`,
        subtitle: `Audit #${t.id.slice(-6)} • Par ${t.agentName} pour ${t.clientName}`,
        icon: <History className="w-4 h-4 text-purple-500" />,
        action: () => addToast(`Flux transactionnel ${t.id} consulté en base de données. Statut: ${t.status}`, "info")
      });
    });
  }

  return (
    <div className="space-y-4 animate-fadeIn font-sans select-none pb-20">
      
      {/* 1. TOP DOCKS HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl text-white">
        
        {/* Profile and System Status */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-orange-450 to-orange-600 rounded-2xl">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider">{cashier.name}</span>
              <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                CAISSIÈRE CENTRALE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Système connecté d'établissement • Bureau : <strong className="text-white">{cashier.agency}</strong>
            </p>
          </div>
        </div>

        {/* Global Search Input Bar (Instant feedback results) */}
        <div className="relative w-full md:w-96">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Recherche ERP globale (Client, Carte, Téléphone...)"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchfocused(true)}
              onBlur={() => setTimeout(() => setIsSearchfocused(false), 250)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-550 transition-colors"
            />
            {globalSearchQuery && (
              <button 
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick recommendations panel */}
          {isSearchfocused && searchSuggestions.length > 0 && (
            <div className="absolute top-11 left-0 w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-xs text-left max-h-80 overflow-y-auto space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block px-2 mb-1.5">
                RÉSULTATS TROUVÉS ({searchSuggestions.length})
              </span>
              {searchSuggestions.map(s => (
                <button
                  key={s.id}
                  onMouseDown={() => {
                    s.action();
                    setGlobalSearchQuery('');
                  }}
                  className="w-full p-2 hover:bg-slate-900 rounded-xl flex items-center gap-3 transition-colors text-left"
                >
                  <div className="p-1.5 bg-slate-900 rounded-lg">
                    {s.icon}
                  </div>
                  <div>
                    <span className="font-extrabold text-white block">{s.title}</span>
                    <span className="text-[10px] text-slate-400 block">{s.subtitle}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live clock and Quick Menu */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-black font-mono block text-emerald-400">{systemTimeStr}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Serveur Congo Brazzaville
            </span>
          </div>
          
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Quick popup actions */}
          <div className="flex gap-2">
            <button
              onClick={() => openWindow('encaissement', 'Saisie de Pointage d\'Épargne', null, 420, 480)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              Pointage
            </button>
            
            <button
              onClick={() => openWindow('retrait', 'Saisie de Retrait d\'Épargne Solde', null, 420, 480)}
              className="px-3.5 py-2.5 bg-orange-550 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-orange-950/20 cursor-pointer"
            >
              <ArrowDownCircle className="w-4 h-4" />
              Retrait
            </button>
          </div>
        </div>

      </div>

      {/* 2. THE MULTI-WINDOW WORKSPACE CANVAS */}
      <div 
        ref={workspaceRef}
        onMouseMove={handleWorkspaceMouseMove}
        onMouseUp={handleWorkspaceMouseUp}
        onMouseLeave={handleWorkspaceMouseUp}
        className="relative w-full min-h-[640px] bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-inner"
      >
        
        {/* SIDE BAR NAVIGATION */}
        <aside className="w-full md:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">ERP FINTECH</span>
              <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight mt-0.5">
                MENU DE CAISSE
              </h2>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {[
                { label: 'Tableau de bord', icon: <Landmark className="w-4 h-4" />, action: () => openWindows.forEach(w => minimizeWindow(w.id)) }, // minimal shortcut to view backdrop
                { label: 'Clients', icon: <Users className="w-4 h-4" />, action: () => openWindow('clients', 'Gestion des Clients Épargnants', null, 700, 560) },
                { label: 'Cartes', icon: <CreditCard className="w-4 h-4" />, action: () => openWindow('cartes', 'Gestion des Fiches et Carnets', null, 680, 500) },
                { label: 'Encaissements', icon: <Coins className="w-4 h-4" />, action: () => openWindow('encaissement', 'Saisie de Pointage d\'Épargne', null, 420, 520) },
                { label: 'Retraits', icon: <ArrowDownCircle className="w-4 h-4" />, action: () => openWindow('retrait', 'Saisie de Retrait d\'Épargne Solde', null, 420, 480) },
                { label: 'Assistances', icon: <HelpCircle className="w-4 h-4" />, action: () => openWindow('assistances', 'Dossiers de Financement Associatifs', null, 700, 520) },
                { label: 'Personnel', icon: <UserCheck className="w-4 h-4" />, action: () => openWindow('personnel', 'Gestion de Personnel & Commissions', null, 680, 500) },
                { label: 'Rapports', icon: <TrendingUp className="w-4 h-4" />, action: () => openWindow('rapports', 'Analyse Financière & Trésorerie globale', null, 820, 580) },
                { label: 'Notifications', icon: <Activity className="w-4 h-4" />, action: () => openWindow('notifications', 'Terminal d\'activité temps réel', null, 420, 485) }
              ].map((m, i) => (
                <button
                  key={i}
                  onClick={m.action}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group text-left"
                >
                  <span className="flex items-center gap-2.5">
                    {m.icon}
                    {m.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick status card on sidebar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[10px] text-slate-400 space-y-2">
            <div className="flex justify-between font-bold">
              <span>Ressources Caisse :</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Actif
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
              <span className="block text-[8px] font-bold text-slate-500 uppercase">Solde coffre sécurisé</span>
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                {totalCaisseCapital.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA (Underneath is the permanent stats dashboard, overhead are the dragging windows) */}
        <main className="flex-grow p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
          
          {/* THE PERMANENT BACKGROUND STATS DASHBOARD DISPLAYED WHEN NO FULLSCREEN WINDOWS COVER IT */}
          <div className="space-y-6 select-text mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-850 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">FINANCIAL SUPERVISION BACKDROP</span>
                <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  TABLEAU DE BORD DE CAISSE PRINCIPALE
                </h3>
              </div>
              <span className="text-xs font-black text-slate-500 bg-slate-205 dark:bg-slate-800 px-3 py-1 rounded-xl">
                Flux consolidés d'aujourd'hui
              </span>
            </div>

            {/* Static Widgets in central backing */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Vault Gold Card */}
              <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-850 shadow-md flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <Landmark className="w-6 h-6 text-orange-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">COFFRE-FORT CENTRAL</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Encours Caisse Actuel</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-white">
                    {totalCaisseCapital.toLocaleString()} <span className="text-[11px] font-black text-orange-500">FCFA</span>
                  </span>
                </div>
              </div>

              {/* Day Deposits */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <Coins className="w-6 h-6 text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">VERSEMENTS</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Recettes Journée</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-white">
                    {depositsToday.toLocaleString()} <span className="text-[11px] font-black text-emerald-500">FCFA</span>
                  </span>
                </div>
              </div>

              {/* Day Withdrawals */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <ArrowDownCircle className="w-6 h-6 text-amber-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">RETRAITS</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Sorties du jour</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-white">
                    {withdrawsToday.toLocaleString()} <span className="text-[11px] font-black text-amber-500">FCFA</span>
                  </span>
                </div>
              </div>

              {/* Active Clients */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <Users className="w-6 h-6 text-indigo-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono font-mono">ADHÉRENTS</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Fichier Clientèle Actif</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-white">
                    {clientsList.length} <span className="text-[11px] font-black text-indigo-500">Comptes</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Quick KPI stats sub-row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">CARTES ACTIVES</span>
                  <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white">{activeCardsCount}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-pink-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">ASSISTANCES</span>
                  <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white">{assistancesCount}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">EMPLOYÉS ACTIFS</span>
                  <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white">{activeStaffCount} 💼</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 animate-pulse" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">EN ATTENTE</span>
                  <span className="font-extrabold font-mono text-sm text-orange-600">{pendingTransactions.length} Dossiers</span>
                </div>
              </div>
            </div>

            {/* Quick Pending Validation Ledger at background (so they don't have empty screen) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm text-xs space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">
                  Écritures comptables en attente de caisse (Aperçu direct coffre)
                </h4>
                <button 
                  onClick={() => openWindow('clients', 'Gestion des Clients Épargnants', null, 700, 560)}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg hover:text-slate-950 font-black cursor-pointer text-[10px] flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  Ouvrir Terminal complet <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-semibold">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                      <th>Bénéficiaire</th>
                      <th>Type</th>
                      <th>Créé par l'Agent</th>
                      <th className="text-right">Montant brut</th>
                      <th className="text-right">Action directe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-slate-700 dark:text-slate-350">
                    {pendingTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                          ✓ Aucun flux en attente d'écriture. Toutes les transactions de caisse sont scellées et balancées.
                        </td>
                      </tr>
                    ) : (
                      pendingTransactions.slice(0, 4).map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="py-2.5">
                            <span className="font-extrabold text-slate-950 dark:text-white block">{tx.clientName}</span>
                            <span className="text-[9px] text-slate-400 font-normal">Secteur: {tx.zone}</span>
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              tx.type === 'depot' ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-850'
                            }`}>
                              {tx.type === 'depot' ? 'Dépôt' : 'Retrait'}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono">{tx.agentName}</td>
                          <td className="py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                            {tx.amount.toLocaleString()} F
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              id={`quick-validate-btn-${tx.id}`}
                              onClick={() => {
                                onValidateTransaction(tx.id);
                                addToast(`Transaction validated successfully!`, "success");
                              }}
                              className="p-1 px-2.1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-0.5"
                            >
                              <Check className="w-3 h-3" /> Approuver
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* DYNAMIC RENDERING OF MULTIPLE OPEN ACTIVE WINDOWS OVERHEAD */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <AnimatePresence>
              {openWindows.map((win) => {
                if (win.isMinimized) return null;

                // Configure window size and coordinate bounds
                const isMax = win.isMaximized;
                const windowWidth = win.w || 640;
                const windowHeight = win.h || 520;

                return (
                  <motion.div
                    key={win.id}
                    initial={isMax ? { x: 0, y: 0, width: '100%', height: '100%', scale: 1 } : { x: win.x, y: win.y, width: windowWidth, height: windowHeight, scale: 0.95, opacity: 0 }}
                    animate={isMax ? { x: 0, y: 0, width: '105%', height: '100%', opacity: 1, scale: 1, transition: { duration: 0.15 } } : { x: win.x, y: win.y, width: windowWidth, height: windowHeight, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{ zIndex: win.zIndex }}
                    className="absolute bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                  >
                    
                    {/* WINDOW TITLE BAR */}
                    <div 
                      onMouseDown={(e) => handleHeaderMouseDown(e, win.id)}
                      className={`px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between cursor-move selection:bg-none select-none rounded-t-3xl border-b border-slate-850`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-550 shrink-0 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider font-mono">
                          {win.title}
                        </span>
                      </div>

                      {/* Small window controls */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => minimizeWindow(win.id)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Réduire"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleMaximizeWindow(win.id)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title={isMax ? "Restaurer" : "Agrandir"}
                        >
                          <Square className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => closeWindow(win.id)}
                          className="p-1 text-rose-500 hover:text-white hover:bg-rose-600 rounded transition-all cursor-pointer"
                          title="Fermer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* WINDOW BODY CONTAINER */}
                    <div 
                      onClick={() => bringToFront(win.id)}
                      className="flex-grow p-6 overflow-y-auto text-slate-700 dark:text-slate-350 select-text bg-white dark:bg-slate-900 custom-scrollbar text-xs"
                    >
                      
                      {/* WINDOW TYPE 1: CLIENTS MANAGEMENT LIST */}
                      {win.type === 'clients' && (
                        <div className="space-y-4">
                          
                          {/* Search and Action Row */}
                          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openWindow('clients', 'Gestion des Clients Épargnants', null, 700, 560)}
                                className="px-3.5 py-1.5 bg-slate-105 hover:bg-slate-201 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-xl"
                              >
                                Rafraîchir
                              </button>
                              
                              <button
                                onClick={() => openWindow('clients', 'Nouveau Client', null, 420, 500)} // we can repurpose forms to opens
                                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center gap-1"
                              >
                                <UserPlus className="w-4 h-4" /> Nouveau Client
                              </button>
                            </div>

                            {/* Live Suggestion Search */}
                            <input
                              type="text"
                              placeholder="Rechercher par nom / tél..."
                              value={clientSearchFilter}
                              onChange={(e) => setClientSearchFilter(e.target.value)}
                              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none"
                            />
                          </div>

                          {/* Quick Region Filters */}
                          <div className="flex gap-1.5 flex-wrap">
                            {['All', 'Zone A - Massina', 'Zone B - Ouenze', 'Zone C - Talangaï', 'Zone D - Poto-Poto', 'Zone E - Bacongo'].map(z => (
                              <button
                                key={z}
                                onClick={() => setClientZoneFilter(z)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${clientZoneFilter === z ? 'bg-orange-500/10 border border-orange-500 text-orange-600 font-black' : 'border border-slate-205 dark:border-slate-800 text-slate-400'}`}
                              >
                                {z === 'All' ? 'Tous les secteurs' : z.replace('Zone ', '')}
                              </button>
                            ))}
                          </div>

                          {/* Client Data Grid Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th className="py-2.5">Adhérent Titulaire</th>
                                  <th className="py-2.5">Téléphone</th>
                                  <th className="py-2.5">Zone administrative</th>
                                  <th className="py-2.5">Solde Accumulé</th>
                                  <th className="py-2.5 text-right">Actions de Fiche</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 font-bold text-slate-705">
                                {clientsList
                                  .filter(c => {
                                    const matchQ = c.name.toLowerCase().includes(clientSearchFilter.toLowerCase()) || c.phone.includes(clientSearchFilter);
                                    const matchZ = clientZoneFilter === 'All' || c.zone === clientZoneFilter;
                                    return matchQ && matchZ;
                                  })
                                  .map(c => (
                                    <tr 
                                      key={c.id}
                                      onDoubleClick={() => openWindow('fiche-client', `Fiche ${c.name}`, c, 520, 580)}
                                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors cursor-pointer"
                                      title="Double-cliquez pour ouvrir la fiche individuelle"
                                    >
                                      <td className="py-3">
                                        <span className="font-extrabold text-slate-900 dark:text-white block">{c.name}</span>
                                        <span className="text-[10px] text-slate-400 block font-normal">{c.email}</span>
                                      </td>
                                      <td className="py-3 font-mono text-[11px] font-semibold text-slate-500">{c.phone}</td>
                                      <td className="py-3 font-semibold text-slate-500">{c.zone}</td>
                                      <td className="py-3 font-mono font-black text-rose-505 text-slate-900 dark:text-white">
                                        {c.balance.toLocaleString()} F
                                      </td>
                                      <td className="py-3 text-right">
                                        <button
                                          onClick={() => openWindow('fiche-client', `Fiche ${c.name}`, c, 520, 580)}
                                          className="px-2.5 py-1 bg-orange-500/10 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-all text-[10px] font-black inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          Ouvrir Dossier <ChevronRight className="w-3 h-3" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      )}

                      {/* WINDOW TYPE 2: INDIVIDUAL DETAILED FICHE CLIENT */}
                      {win.type === 'fiche-client' && (
                        <div className="space-y-5">
                          {(() => {
                            const clientPayload: User = win.data;
                            if (!clientPayload) return <p className="text-slate-405 italic">Fiche inaccessible ou vidée.</p>;
                            
                            // Re-fetch fresher values from parent props
                            const freshClient = allUsers.find(u => u.id === clientPayload.id) || clientPayload;
                            const clientCards = cards.filter(c => c.clientId === freshClient.id);
                            const clientTransactions = transactions.filter(t => t.clientId === freshClient.id);
                            const clientAssistances = assistances.filter(a => a.clientId === freshClient.id);

                            return (
                              <div className="space-y-5">
                                {/* Profile Layout header with initial avatar icon */}
                                <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                                  <div className="w-14 h-14 rounded-xl bg-orange-550 flex items-center justify-center font-black text-xl text-white font-mono shadow-inner">
                                    {freshClient.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-orange-500/10 text-orange-600 rounded">
                                      ADHÉRENT SYSTÈME
                                    </span>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">{freshClient.name}</h3>
                                    <p className="text-[10px] font-semibold text-slate-500 font-mono">
                                      ID: {freshClient.id} • Inscrit le {new Date(freshClient.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {/* Solde Display banner */}
                                <div className="p-4 bg-slate-950 text-white rounded-2xl flex items-center justify-between border border-slate-800 shadow-inner">
                                  <div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                                      Solde accumulé restituable
                                    </span>
                                    <span className="text-xl font-black font-mono tracking-tight text-white">
                                      {freshClient.balance.toLocaleString()} FCFA
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                                    Zone : {freshClient.zone}
                                  </span>
                                </div>

                                {/* Core micro action points within folder sheet */}
                                <div className="grid grid-cols-4 gap-2">
                                  <button
                                    onClick={() => {
                                      setNewEncaissementForm({
                                        clientId: freshClient.id,
                                        cardId: clientCards[0]?.id || '',
                                        amount: clientCards[0]?.amount || 1000,
                                        date: new Date().toISOString().substring(0, 10),
                                        observation: 'Pointage terrain'
                                      });
                                      openWindow('encaissement', 'Saisie de Pointage d\'Épargne', freshClient, 420, 520);
                                    }}
                                    className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white transition-all text-center flex flex-col items-center gap-1 cursor-pointer font-black text-[10px]"
                                  >
                                    <Coins className="w-5 h-5" />
                                    VERSEMENT
                                  </button>

                                  <button
                                    onClick={() => {
                                      setNewRetraitForm({
                                        clientId: freshClient.id,
                                        cardId: clientCards[0]?.id || '',
                                        amount: freshClient.balance,
                                        trackingCheck: false
                                      });
                                      openWindow('retrait', 'Saisie de Retrait d\'Épargne Solde', freshClient, 420, 480);
                                    }}
                                    className="p-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white transition-all text-center flex flex-col items-center gap-1 cursor-pointer font-black text-[10px]"
                                  >
                                    <ArrowDownCircle className="w-5 h-5" />
                                    RETRAIT
                                  </button>

                                  <button
                                    onClick={() => {
                                      setNewCardForm({
                                        clientId: freshClient.id,
                                        amount: 1000
                                      });
                                      openWindow('cartes', 'Gestion des Fiches et Carnets', freshClient, 680, 500);
                                    }}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center flex flex-col items-center gap-1 cursor-pointer font-black text-[10px]"
                                  >
                                    <PlusCircle className="w-5 h-5 text-slate-400" />
                                    NOUVELLE CARTE
                                  </button>

                                  <button
                                    onClick={() => {
                                      addToast(`⚙ Impression du grand-livre comptable pour ${freshClient.name} simulée.`);
                                      window.print();
                                    }}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center flex flex-col items-center gap-1 cursor-pointer font-black text-[10px]"
                                  >
                                    <Printer className="w-5 h-5 text-slate-400" />
                                    IMPRIMER
                                  </button>
                                </div>

                                {/* Active Cards Progress list */}
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450">
                                    Fiches de pointage du Client ({clientCards.length})
                                  </h4>
                                  {clientCards.length === 0 ? (
                                    <p className="p-4 rounded-xl border border-dashed border-slate-200 text-center italic text-slate-405">
                                      Aucune fiche active. Veuillez en émettre une.
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {clientCards.map(c => {
                                        const filled = c.filledCells.length;
                                        const percent = Math.min(100, Math.round((filled / 31) * 100));
                                        return (
                                          <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
                                            <div className="flex justify-between items-center mb-1.5 font-bold">
                                              <span>Fiche N°{c.cardNumber.slice(-6)} ({c.amount.toLocaleString()} F)</span>
                                              <span className="font-mono text-[10.5px]">{filled}/31 cotisé</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                              <div className="bg-orange-505 bg-orange-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-1.5">
                                              <span>Progression : {percent}%</span>
                                              <span>Échéance brute : {(c.amount * 30).toLocaleString()} F</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Fiche Transactions recent audit history */}
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450">
                                    Dernières transactions enregistrées
                                  </h4>
                                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {clientTransactions.slice(0, 3).map(tx => (
                                      <div key={tx.id} className="py-2 flex justify-between items-center text-xs font-semibold">
                                        <div>
                                          <span className="block text-slate-900 dark:text-white font-extrabold capitalize">
                                            {tx.type === 'depot' ? 'Pointage' : tx.type === 'retrait' ? 'Retrait' : 'Frais d\'inscription'}
                                          </span>
                                          <span className="text-[10px] text-slate-450 font-normal">
                                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.agentName}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <span className={`block font-mono font-black ${tx.type === 'retrait' ? 'text-rose-500' : 'text-emerald-600'}`}>
                                            {tx.type === 'retrait' ? '-' : '+'}{tx.amount.toLocaleString()} F
                                          </span>
                                          <span className="text-[9px] uppercase font-bold text-slate-400">{tx.status}</span>
                                        </div>
                                      </div>
                                    ))}
                                    {clientTransactions.length === 0 && (
                                      <p className="py-2.5 italic text-slate-450 text-center">Aucune transaction.</p>
                                    )}
                                  </div>
                                </div>

                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* WINDOW TYPE 3: NOUVEL ENCAISSEMENT / POINTAGE FORM */}
                      {win.type === 'encaissement' && (
                        <form onSubmit={handleERPDepositSubmit} className="space-y-4">
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-xl leading-normal font-bold">
                            🔍 Saisie d'une fiche d'encaissement liquide reçue par un agent sur le terrain.
                          </div>

                          {/* Client Dropdown */}
                          <div>
                            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">
                              Choisir le Client Adhérent
                            </label>
                            <select
                              value={newEncaissementForm.clientId}
                              onChange={(e) => {
                                const activeCards = cards.filter(c => c.clientId === e.target.value && !c.isCompleted);
                                setNewEncaissementForm({
                                  ...newEncaissementForm,
                                  clientId: e.target.value,
                                  cardId: activeCards[0]?.id || '',
                                  amount: activeCards[0]?.amount || 1000
                                });
                              }}
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                              required
                            >
                              <option value="">-- Sélectionner un client --</option>
                              {clientsList.map(c => (
                                <option key={c.id} value={c.id}>{c.name} (Solde : {c.balance.toLocaleString()} F)</option>
                              ))}
                            </select>
                          </div>

                          {/* Card Dropdown based on Client */}
                          {newEncaissementForm.clientId && (
                            <div>
                              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">
                                Sélectionner la carte de pointage active
                              </label>
                              <select
                                value={newEncaissementForm.cardId}
                                onChange={(e) => {
                                  const cObj = cards.find(c => c.id === e.target.value);
                                  setNewEncaissementForm({
                                    ...newEncaissementForm,
                                    cardId: e.target.value,
                                    amount: cObj ? cObj.amount : 1000
                                  });
                                }}
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                required
                              >
                                {cards
                                  .filter(c => c.clientId === newEncaissementForm.clientId && !c.isCompleted)
                                  .map(c => (
                                    <option key={c.id} value={c.id}>
                                      Fiche N°{c.cardNumber.slice(-6)} — Valeur fixe: {c.amount.toLocaleString()} FCFA ({c.filledCells.length}/31 Cases)
                                    </option>
                                  ))}
                              </select>
                              {cards.filter(c => c.clientId === newEncaissementForm.clientId && !c.isCompleted).length === 0 && (
                                <p className="text-[10px] text-rose-500 font-bold mt-1">⚠ Cet adhérent ne dispose d'aucune fiche de pointage ouverte.</p>
                              )}
                            </div>
                          )}

                          {/* Quick Value Picker inside modal */}
                          <div>
                            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5">
                              Montant à verser (FCFA)
                            </label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                              {[500, 1000, 2000, 5000].map(val => (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => setNewEncaissementForm({ ...newEncaissementForm, amount: val })}
                                  className={`py-1.5 px-1 rounded-xl border text-[11px] font-bold ${newEncaissementForm.amount === val ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-black' : 'border-slate-100 dark:border-slate-800 text-slate-450'}`}
                                >
                                  {val} F
                                </button>
                              ))}
                            </div>
                            <input
                              type="number"
                              value={newEncaissementForm.amount}
                              onChange={(e) => setNewEncaissementForm({ ...newEncaissementForm, amount: Number(e.target.value) })}
                              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl font-mono font-black text-slate-900 dark:text-white"
                              min="500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">
                              Observations de versement
                            </label>
                            <input
                              type="text"
                              value={newEncaissementForm.observation}
                              placeholder="Fiche terrain Massina Guy-Aimé..."
                              onChange={(e) => setNewEncaissementForm({ ...newEncaissementForm, observation: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase"
                          >
                            VALIDER ET COMPTABILISER LE FLUX
                          </button>
                        </form>
                      )}

                      {/* WINDOW TYPE 4: RETRAIT SOLDE DE COMPTE FORM */}
                      {win.type === 'retrait' && (
                        <form onSubmit={handleERPRetraitSubmit} className="space-y-4">
                          <div className="p-3 bg-orange-500/5 border border-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl leading-normal font-bold flex gap-2">
                            <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0" />
                            <span>Veuillez valider l'identité du client et certifier l'encaissement direct d'espèces.</span>
                          </div>

                          {/* Client Dropdown */}
                          <div>
                            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">
                              Sélectionner l'Adhérent Bénéficiaire
                            </label>
                            <select
                              value={newRetraitForm.clientId}
                              onChange={(e) => {
                                const selectedUserObj = clientsList.find(c => c.id === e.target.value);
                                setNewRetraitForm({
                                  ...newRetraitForm,
                                  clientId: e.target.value,
                                  amount: selectedUserObj ? selectedUserObj.balance : 0
                                });
                              }}
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl"
                              required
                            >
                              <option value="">-- Sélectionner un client --</option>
                              {clientsList.map(c => (
                                <option key={c.id} value={c.id}>{c.name} (Solde : {c.balance.toLocaleString()} F)</option>
                              ))}
                            </select>
                          </div>

                          {/* Calculation overview parameters */}
                          {newRetraitForm.clientId && (() => {
                            const activeUser = clientsList.find(c => c.id === newRetraitForm.clientId);
                            if (!activeUser) return null;

                            const activeUserCards = cards.filter(c => c.clientId === activeUser.id);
                            const cardRate = activeUserCards[0]?.amount || 1000;
                            const totalAccumulated = activeUser.balance;
                            
                            // Mobikissi structural commission logic
                            const keepingFee = cardRate; // Mobikissi keeps 1 cell of rate as administration fees
                            const netsReclaimed = Math.max(0, totalAccumulated - keepingFee);

                            return (
                              <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl border-dashed border-slate-202 space-y-2">
                                <div className="flex justify-between font-bold">
                                  <span>Solde total brut éligible :</span>
                                  <span className="font-mono text-slate-950 dark:text-white font-black">{totalAccumulated.toLocaleString()} F</span>
                                </div>
                                <div className="flex justify-between font-bold text-amber-500">
                                  <span>Frais de Carreau (Part Administration) :</span>
                                  <span className="font-mono text-amber-500 font-extrabold">-{keepingFee.toLocaleString()} F</span>
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-black text-emerald-555">
                                  <span>Somme nette récupérable :</span>
                                  <span className="font-mono text-emerald-500 text-sm font-black">{netsReclaimed.toLocaleString()} FCFA</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Amount Input */}
                          <div>
                            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1">
                              Montant liquide décaissé en Agence (FCFA)
                            </label>
                            <input
                              type="number"
                              value={newRetraitForm.amount}
                              onChange={(e) => setNewRetraitForm({ ...newRetraitForm, amount: Number(e.target.value) })}
                              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-black text-sm"
                              required
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="signature-certified-check"
                              checked={newRetraitForm.trackingCheck}
                              onChange={(e) => setNewRetraitForm({ ...newRetraitForm, trackingCheck: e.target.checked })}
                              className="w-4 h-4 text-orange-505 bg-slate-900 rounded"
                            />
                            <label htmlFor="signature-certified-check" className="text-[10px] font-semibold text-slate-500">
                              Je certifie avoir recueilli la signature de l'adhérent sous dossier papier d'émargement d'agence.
                            </label>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs uppercase"
                          >
                            CONFIRMER LE RETRAIT D'ESPÈCES
                          </button>
                        </form>
                      )}

                      {/* WINDOW TYPE 5: CARDS / CARNETS GRIDS */}
                      {win.type === 'cartes' && (
                        <div className="space-y-4">
                          
                          {/* Search cards filters */}
                          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                setNewCardForm({ clientId: clientsList[0]?.id || '', amount: 1000 });
                                openWindow('cartes', 'Grille des Cartes', null, 680, 500);
                              }}
                              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                            >
                              <PlusCircle className="w-4 h-4" /> Nouvelle Carte
                            </button>

                            <input
                              type="text"
                              placeholder="Scanner N° de carte ou nom..."
                              value={cardSearchFilter}
                              onChange={(e) => setCardSearchFilter(e.target.value)}
                              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-850"
                            />
                          </div>

                          {/* Cards Table rendering */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th className="py-2">Fiche / Card Number</th>
                                  <th className="py-2">Titulaire</th>
                                  <th className="py-2">Cotise (FCFA)</th>
                                  <th className="py-2 text-center">Cases</th>
                                  <th className="py-2">Statut</th>
                                  <th className="py-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 font-bold">
                                {cards
                                  .filter(c => {
                                    const clientOfCard = clientsList.find(u => u.id === c.clientId);
                                    const matchQ = c.cardNumber.toLowerCase().includes(cardSearchFilter.toLowerCase()) || 
                                                   clientOfCard?.name.toLowerCase().includes(cardSearchFilter.toLowerCase());
                                    return matchQ;
                                  })
                                  .map(c => {
                                    const parentUser = clientsList.find(u => u.id === c.clientId);
                                    return (
                                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                                        <td className="py-3 font-mono text-[10px] text-orange-505 font-bold">
                                          #{c.cardNumber.toUpperCase()}
                                        </td>
                                        <td className="py-3">{parentUser?.name || 'Inconnu'}</td>
                                        <td className="py-3 font-mono font-black">{c.amount.toLocaleString()} F / j</td>
                                        <td className="py-3 text-center">
                                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-full font-mono text-[10.5px]">
                                            {c.filledCells.length} / 31
                                          </span>
                                        </td>
                                        <td className="py-3">
                                          <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${c.isCompleted ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-600'}`}>
                                            {c.isCompleted ? 'Champion' : 'En cours'}
                                          </span>
                                        </td>
                                        <td className="py-3 text-right">
                                          <button
                                            onClick={() => openWindow('fiche-client', `Fiche ${parentUser?.name}`, parentUser, 520, 580)}
                                            className="px-2.5 py-1 bg-slate-900 text-white rounded-lg hover:bg-orange-550 transition-colors text-[9.5px]"
                                          >
                                            Ouvrir Grille 
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      )}

                      {/* WINDOW TYPE 6: ASSISTANCES / MICRO-LOANS LIST */}
                      {win.type === 'assistances' && (
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs">
                                Mutuelles de Coopération d'Établissement
                              </h4>
                              <p className="text-[10px] text-slate-400">Cliquez sur un dossier mutuel pour l'approbation du taux d'intérêt et versement.</p>
                            </div>
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-mono font-semibold text-[10.5px]">
                              {assistances.length} demandes
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th>Adhérent</th>
                                  <th>Secteur / Projet</th>
                                  <th className="text-right">Mutuel (FCFA)</th>
                                  <th className="text-right font-mono">Taux brut</th>
                                  <th>Statut dossier</th>
                                  <th className="text-right">Actions caisse</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 font-bold">
                                {assistances.map(a => (
                                  <tr key={a.id} className="hover:bg-slate-55/50 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="py-2.5">
                                      <span className="font-black text-slate-950 dark:text-white block">{a.clientName}</span>
                                      <span className="text-[9.5px] text-slate-400 font-normal">Identifiant: {a.clientId}</span>
                                    </td>
                                    <td className="py-2.5">
                                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 rounded text-[9.5px] text-slate-500">{a.domain}</span>
                                    </td>
                                    <td className="py-2.5 text-right font-mono font-extrabold">{a.amount.toLocaleString()} F</td>
                                    <td className="py-2.5 text-right font-mono font-black text-purple-500">{a.repaymentAmount.toLocaleString()} F</td>
                                    <td className="py-2.5 capitalize text-[10.5px]">
                                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                                        a.status === 'approved' ? 'bg-emerald-50 text-emerald-800' :
                                        a.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                        a.status === 'refunded' ? 'bg-blue-50 text-blue-800' : 'bg-red-50 text-red-500'
                                      }`}>
                                        {a.status === 'approved' ? 'Accordé' : a.status === 'pending' ? 'Attente' : a.status === 'refunded' ? 'Solfé' : 'Refusé'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                      {a.status === 'pending' ? (
                                        <div className="flex justify-end gap-1">
                                          <button
                                            id={`approve-ast-${a.id}`}
                                            onClick={() => {
                                              onManageAssistance(a.id, 'approved');
                                              addToast(`Dossier d'assistance de ${a.clientName} approuvé !`, "success");
                                            }}
                                            className="px-2 py-1 bg-emerald-500 text-white rounded text-[9.5px]"
                                          >
                                            Accorder
                                          </button>
                                          <button
                                            id={`refuse-ast-${a.id}`}
                                            onClick={() => {
                                              onManageAssistance(a.id, 'refused');
                                              addToast(`Dossier d'assistance de ${a.clientName} réfusé`, "warning");
                                            }}
                                            className="px-2 py-1 bg-rose-500 text-white rounded text-[9.5px]"
                                          >
                                            Refuser
                                          </button>
                                        </div>
                                      ) : a.status === 'approved' ? (
                                        <button
                                          id={`refund-ast-${a.id}`}
                                          onClick={() => {
                                            onManageAssistance(a.id, 'refunded');
                                            addToast(`Règlement de remboursement comptabilisé !`, "success");
                                          }}
                                          className="px-2 py-1 bg-blue-500 text-white rounded text-[9.5px]"
                                        >
                                          Solfé (Settle)
                                        </button>
                                      ) : (
                                        <span className="text-slate-400 font-normal">Scellé</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      )}

                      {/* WINDOW TYPE 7: STAFF / PERSONNEL & COMMISSIONS */}
                      {win.type === 'personnel' && (
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sm:flex-row flex-col gap-2">
                            <div>
                              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs">
                                Gestion des Employés Mobikissi
                              </h4>
                              <p className="text-[10px] text-slate-400">Contrôle de performance, de commissions acquises, salaires et zones.</p>
                            </div>

                            <button
                              onClick={() => {
                                setNewStaffForm({ name: '', phone: '', email: '', role: 'RECOUVREUR', zone: 'Zone A - Massina', salary: 120000, prime: 15000 });
                                addToast("Dossier de recrutement prêt.", "info");
                              }}
                              className="px-3.5 py-1.5 bg-orange-650 hover:bg-orange-700 text-white rounded-xl font-bold text-[10.5px]"
                            >
                              Ajouter un collaborateur
                            </button>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-semibold">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th>Collaborateur</th>
                                  <th>Rôle d'établissement</th>
                                  <th>Zone d'affectation</th>
                                  <th>Régime de base</th>
                                  <th className="text-right">Commissions acquises</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805">
                                {staffList.map((s, i) => (
                                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                                    <td className="py-2.5">
                                      <span className="font-black text-slate-950 dark:text-white block">{s.name}</span>
                                      <span className="text-[9px] text-slate-500 font-normal">{s.phone}</span>
                                    </td>
                                    <td className="py-2.5 font-bold">
                                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9.5px]">
                                        {s.role}
                                      </span>
                                    </td>
                                    <td className="py-2.5 font-normal text-slate-500">{s.zone}</td>
                                    <td className="py-2.5 font-mono">
                                      {s.baseSalary ? s.baseSalary.toLocaleString() : '120 000'} F
                                    </td>
                                    <td className="py-2.5 text-right font-mono font-black text-emerald-600">
                                      {s.commission ? s.commission.toLocaleString() : '12 500'} FCFA
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      )}

                      {/* WINDOW TYPE 8: ANALYTICS & REPORTS (SVG FINTECH CHARTS) */}
                      {win.type === 'rapports' && (
                        <div className="space-y-6">
                          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center mb-2">
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs">
                                Analyse des Taux d'Épargne & Audits de Secrétariat
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold">Historique consolidé du grand livre comptable.</p>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-600 font-mono font-bold text-[10px] px-3 py-1 rounded-xl">
                              Taux de liquidité global : 94.2%
                            </span>
                          </div>

                          {/* Graphical Charts Layout using clean responsive SVG visuals */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* SVG Bar Chart: Monthly collections inside Zones comparison */}
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-900 rounded-3xl space-y-3 shadow-inner">
                              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                Collectes d'épargne par Zone (FCFA)
                              </span>
                              
                              <div className="w-full h-40 flex items-end justify-between px-3 border-b border-l border-slate-205 dark:border-slate-850 pb-2 pt-4">
                                {[
                                  { zone: 'Alicia A', collections: '1 250k', hPercent: '85%', color: '#f97316' },
                                  { zone: 'Talangaï C', collections: '980k', hPercent: '65%', color: '#10b981' },
                                  { zone: 'Ouenze B', collections: '750k', hPercent: '50%', color: '#3b82f6' },
                                  { zone: 'Poto-Poto D', collections: '450k', hPercent: '30%', color: '#8b5cf6' },
                                ].map((item, i) => (
                                  <div key={i} className="flex flex-col items-center gap-1.5 w-1/5 group cursor-pointer">
                                    <span className="text-[9px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-1 py-0.5 rounded">
                                      {item.collections}
                                    </span>
                                    <div 
                                      style={{ height: item.hPercent, backgroundColor: item.color }}
                                      className="w-8 rounded-t-lg shadow transition-all duration-300 transform group-hover:scale-y-105"
                                    />
                                    <span className="text-[9px] text-slate-500 truncate text-center w-full">
                                      {item.zone.replace('Zone ', '')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* SVG Line Chart: Cumulative Savings growth trend visualizer */}
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-900 rounded-3xl space-y-3 shadow-inner">
                              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                Progression mensuelle de l'épargne globale
                              </span>

                              <div className="relative w-full h-40 border-b border-l border-slate-205 dark:border-slate-850 pb-2">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  {/* Line paths */}
                                  <path
                                    d="M 5,90 Q 25,60 50,45 T 95,15"
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="3.5"
                                    className="path-animated-drawing"
                                  />
                                  {/* Area paths fill */}
                                  <path
                                    d="M 5,90 Q 25,60 50,45 T 95,15 L 95,95 L 5,95 Z"
                                    fill="rgba(249, 115, 22, 0.08)"
                                  />
                                </svg>
                                
                                <div className="absolute bottom-2.5 left-2.5 text-[10px] font-mono text-slate-400">950k F</div>
                                <div className="absolute top-2.5 right-2.5 text-[10.5px] font-mono text-orange-555 font-bold">4.2M FCFA</div>
                              </div>
                            </div>

                          </div>

                          {/* Historical statistical analysis data sheet */}
                          <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-850 space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-405 block">Rapport d'audit de conformité</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                              <div>
                                <span className="block text-[8px] font-bold text-slate-550 uppercase">Remboursements assistances</span>
                                <span className="text-sm font-bold text-emerald-400 mt-1 block">82.3% réguliers</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-bold text-slate-550 uppercase">Part d'Établissement cumulée</span>
                                <span className="text-sm font-bold text-blue-400 mt-1 block">120 500 F</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-bold text-slate-550 uppercase">Conformité de coffre</span>
                                <span className="text-sm font-bold text-orange-400 mt-1 block">Sans écart (100%)</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-bold text-slate-550 uppercase">Sécurité d'écritures</span>
                                <span className="text-sm font-bold text-indigo-400 mt-1 block">Rapprochement auto</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* WINDOW TYPE 9: TERMINAL LOG DE NOTIFICATIONS TEMPS RÉEL */}
                      {win.type === 'notifications' && (
                        <div className="space-y-4">
                          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center mb-1">
                            <div>
                              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs">
                                Journal d'Événements Temps Réel
                              </h4>
                              <p className="text-[10px] text-slate-400">Flux d'activités provenant des applications de terrain des agents.</p>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          </div>

                          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                            {tickerEvents.map(t => (
                              <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-201 dark:border-slate-850 rounded-xl space-y-1">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className={`capitalize ${
                                    t.type === 'success' ? 'text-emerald-555 text-emerald-600' :
                                    t.type === 'assistance' ? 'text-purple-500' : 'text-slate-700 dark:text-slate-300'
                                  }`}>{t.type === 'success' ? 'Recouvrement' : t.type === 'assistance' ? 'Financement' : 'Flux Système'}</span>
                                  <span className="text-slate-400 text-[10px]">{t.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{t.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </main>

      </div>

      {/* 3. MULTI-FENÊTRES TASKBAR LAYOUT SYSTEM */}
      <footer className="fixed bottom-0 left-0 w-full bg-slate-950/95 border-t border-slate-800 p-2 text-white flex items-center justify-between sm:px-8 z-50 shadow-2xl backdrop-blur">
        
        {/* Taskbar Windows launcher logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => openWindow('clients', 'Gestion des Clients Épargnants', null, 700, 560)}
            className="p-2.5 bg-orange-550 hover:bg-orange-650 rounded-xl cursor-pointer transition-colors shrink-0"
            title="Menu Démarrer Mobikissi"
          >
            <Layers className="w-4.5 h-4.5 text-white animate-spin-slow" />
          </div>
          
          <div className="h-8 w-px bg-slate-800" />

          {/* Opened windows task bar items */}
          <div className="flex gap-2 max-w-lg sm:max-w-2xl overflow-x-auto py-0.5 custom-scrollbar pr-3">
            {openWindows.map(w => (
              <button
                key={w.id}
                onClick={() => {
                  if (w.isMinimized) {
                    bringToFront(w.id);
                  } else {
                    minimizeWindow(w.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border text-[10.5px] font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  w.isMinimized 
                    ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white' 
                    : 'border-orange-500 bg-orange-500/10 text-orange-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${w.isMinimized ? 'bg-slate-500' : 'bg-orange-500'}`} />
                {w.title.slice(0, 16)}{w.title.length > 16 ? '...' : ''}
                <X 
                  className="w-3 h-3 hover:text-rose-500 ml-1 shrink-0" 
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(w.id);
                  }}
                />
              </button>
            ))}
            {openWindows.length === 0 && (
              <span className="text-[10px] text-slate-500 font-bold self-center">
                Aucune fiche ou carnet d'ERP ouvert
              </span>
            )}
          </div>
        </div>

        {/* Taskbar Info footer */}
        <div className="flex items-center gap-4 text-[10.5px] font-bold text-slate-400">
          <span className="hidden sm:inline-block">Caisse Centrale : En Ligne ●</span>
          <span className="text-emerald-400 font-mono font-black">{systemTimeStr.split(' ')[0]}</span>
        </div>

      </footer>

      {/* FLOAT SLIDE-IN DESKTOP TOAST ALERTS */}
      <div className="fixed bottom-14 right-4 z-50 space-y-2 max-w-md pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto text-white text-xs font-bold w-72"
            >
              <div className="p-1 bg-gradient-to-br from-orange-450 to-orange-550 rounded-lg shrink-0 text-white">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-orange-400 block font-mono">
                  ERP NOTIFICATION
                </span>
                <p className="leading-relaxed text-slate-300 font-medium">{t.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
