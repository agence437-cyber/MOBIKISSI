/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, UserPlus, FileCheck, CheckCircle2, XCircle, 
  Search, ShieldCheck, History, Landmark, Coins, ClipboardList, PlusCircle,
  X, Info, Check, Trash2, ShieldAlert, ArrowDownCircle, ArrowUpRight, HelpCircle,
  Minus, Square, Columns, Users, CreditCard, ChevronRight, Phone, Mail, Clock,
  MapPin, Printer, Shield, Calendar, AlertCircle, Sparkles, TrendingUp, Laptop,
  Activity, ExternalLink, BookmarkCheck, ArrowUpRightFromSquare, UserCheck, RefreshCw, Layers,
  Send, Ban, Crown, AlertTriangle, ShieldX, HeartHandshake
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { User, Card, Transaction, SystemSetting, Assistance } from '../types';

interface SuperviseurDashboardProps {
  supervisor: User;
  allUsers: User[];
  transactions: Transaction[];
  cards: Card[];
  assistances: Assistance[];
  settings: SystemSetting;
  selectedTheme: any;
}

interface ERPWindow {
  id: string; // e.g. "agents-win", "fiche-agent-1", "clients-win", "zones-win"
  title: string;
  type: 'agents' | 'fiche-agent' | 'clients' | 'fiche-client' | 'cartes' | 'zones' | 'performances' | 'assistances' | 'reports' | 'alerts' | 'notifications';
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: any; // payload like agent or client object
  x: number;
  y: number;
  w?: number;
  h?: number;
}

interface LiveNotification {
  id: string;
  text: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'system' | 'performance';
}

export default function SuperviseurDashboard({
  supervisor,
  allUsers,
  transactions,
  cards,
  assistances,
  settings,
  selectedTheme
}: SuperviseurDashboardProps) {

  // Role Filtering
  const clientsList = useMemo(() => allUsers.filter(u => u.role === 'CLIENT'), [allUsers]);
  const agentsList = useMemo(() => allUsers.filter(u => u.role === 'RECOUVREUR'), [allUsers]);
  const validatedTransactions = useMemo(() => transactions.filter(t => t.status === 'validated'), [transactions]);

  // Window System State
  const [openWindows, setOpenWindows] = useState<ERPWindow[]>([]);
  const [windowZIndexTracker, setWindowZIndexTracker] = useState(20);
  const [draggedWindow, setDraggedWindow] = useState<{
    id: string;
    startX: number;
    startY: number;
    winStartX: number;
    winStartY: number;
  } | null>(null);

  // Reference for dragging constraints
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchfocused, setIsSearchfocused] = useState(false);

  // Local state alerts & toasts
  const [toasts, setToasts] = useState<{ id: string; text: string; type: string }[]>([]);
  const [systemTimeStr, setSystemTimeStr] = useState('');

  // Active filters inside subwindows
  const [agentFilter, setAgentFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [cardStatusFilter, setCardStatusFilter] = useState('All');
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedAgentForAudit, setSelectedAgentForAudit] = useState<User | null>(null);

  // Live real-time stream simulation for a Supervisor's operational watchtower
  const [realtimeNotifs, setRealtimeNotifs] = useState<LiveNotification[]>([
    { id: 'rn-1', text: "Agent Guy-Aimé a collecté 15 000 FCFA à la Cité de l'Oua (Zone B)", time: "À l'instant", type: 'success' },
    { id: 'rn-2', text: "Alerte : Baisse de performance détectée pour l'Agent Massina", time: "Il y a 2 min", type: 'warning' },
    { id: 'rn-3', text: "Adhérent Georges Louemba vient de charger une nouvelle carte d'épargne", time: "Il y a 6 min", type: 'info' },
    { id: 'rn-4', text: "Système : Seuil d'assistance mutuelle débloqué pour 14 créanciers en Zone A", time: "Il y a 10 min", type: 'system' },
    { id: 'rn-5', text: "Objectif du jour dépassé de 12% pour l'agence régionale de Poto-Poto", time: "Il y a 15 min", type: 'performance' }
  ]);

  // Sync virtual clock with server time (Brazzaville GMT+1)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSystemTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (GMT+1)');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Event telemetry simulator for realistic field feedback
  useEffect(() => {
    const TELEMETRY_POOL = [
      { text: "Agent Massina vient de valider un versement journalier de 3 000 FCFA", type: 'success' },
      { text: "Nouveau compte ouvert par l'Agent Guy-Aimé à Ouenzé (Zone B)", type: 'success' },
      { text: "Alerte : Plus de 4 jours sans activité de collecte pour l'Agent Christian", type: 'warning' },
      { text: "Filiation de carte d'épargne approuvée pour l'Adhérente Alice Massengo", type: 'info' },
      { text: "Objectif atteint pour le Secteur Massina : 150 000 FCFA d'épargne collectée", type: 'performance' },
      { text: "Alerte : Carte Suspecte sans signature détectée en Zone C (Talangaï)", type: 'warning' },
      { text: "Terminal : Saisie de 25 000 FCFA de versements consolidée en Zone D", type: 'system' }
    ];

    const interval = setInterval(() => {
      const eventCandidate = TELEMETRY_POOL[Math.floor(Math.random() * TELEMETRY_POOL.length)];
      const notifItem: LiveNotification = {
        id: `rn-${Date.now()}`,
        text: eventCandidate.text,
        time: "À l'instant",
        type: eventCandidate.type as any
      };
      setRealtimeNotifs(prev => [notifItem, ...prev.slice(0, 15)]);
      addToast(eventCandidate.text, eventCandidate.type);
    }, 24000);

    return () => clearInterval(interval);
  }, []);

  const addToast = (text: string, type = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Window controllers
  const openWindow = (type: ERPWindow['type'], title: string, data?: any, width = 640, height = 500) => {
    let windowId = `${type}-win`;
    if (type === 'fiche-agent' && data?.id) {
      windowId = `fiche-agent-${data.id}`;
    } else if (type === 'fiche-client' && data?.id) {
      windowId = `fiche-client-${data.id}`;
    }

    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === windowId);
      if (existing) {
        // Bring active window to front and restore
        const newZ = windowZIndexTracker + 1;
        setWindowZIndexTracker(newZ);
        return prev.map(w => w.id === windowId ? { ...w, isMinimized: false, zIndex: newZ } : w);
      }

      // Slightly stagger positions
      const count = prev.length;
      const initialX = 50 + (count % 5) * 30;
      const initialY = 70 + (count % 5) * 25;

      const newZ = windowZIndexTracker + 1;
      setWindowZIndexTracker(newZ);

      const newWin: ERPWindow = {
        id: windowId,
        title,
        type,
        isMinimized: false,
        isMaximized: false,
        zIndex: newZ,
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
    const newZ = windowZIndexTracker + 1;
    setWindowZIndexTracker(newZ);
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w));
  };

  // Drag listeners
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
        let nextX = draggedWindow.winStartX + dx;
        let nextY = draggedWindow.winStartY + dy;

        return {
          ...w,
          x: Math.max(-100, Math.min(nextX, window.innerWidth - 100)),
          y: Math.max(0, Math.min(nextY, window.innerHeight - 150))
        };
      }
      return w;
    }));
  };

  const handleWorkspaceMouseUp = () => {
    setDraggedWindow(null);
  };

  // Calculations for KPI dashboard cards
  const activeCardsCount = useMemo(() => cards.filter(c => !c.isCompleted).length, [cards]);
  const completedCardsCount = useMemo(() => cards.filter(c => c.isCompleted).length, [cards]);
  const pendingHelpCount = useMemo(() => assistances.filter(a => a.status === 'pending').length, [assistances]);

  // Group transactions for analytics
  const todayStr = new Date().toISOString().substring(0, 10);
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const collectedToday = useMemo(() => {
    return validatedTransactions
      .filter(t => t.createdAt.startsWith(todayStr) && t.type === 'depot')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTransactions, todayStr]);

  const collectedThisMonth = useMemo(() => {
    return validatedTransactions
      .filter(t => t.createdAt.startsWith(currentMonthStr) && t.type === 'depot')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [validatedTransactions, currentMonthStr]);

  const newClientsTodayCount = useMemo(() => {
    return clientsList.filter(c => c.createdAt.startsWith(todayStr)).length;
  }, [clientsList, todayStr]);

  const newCardsTodayCount = useMemo(() => {
    return cards.filter(c => c.createdAt.startsWith(todayStr)).length;
  }, [cards, todayStr]);

  // Compute precise analytics for high-fidelity interactive Recharts graphs
  const zoneStatsPreCalculated = useMemo(() => {
    const zones = ['Zone A - Massina', 'Zone B - Ouenze', 'Zone C - Talangaï', 'Zone D - Poto-Poto', 'Zone E - Bacongo'];
    return zones.map(z => {
      const zoneClients = clientsList.filter(c => c.zone === z);
      const zoneCards = cards.filter(card => {
        const client = clientsList.find(c => c.id === card.clientId);
        return client && client.zone === z;
      });
      const zoneAmtCollected = validatedTransactions
        .filter(t => t.zone === z && t.type === 'depot')
        .reduce((sum, t) => sum + t.amount, 0);
      const zoneAgents = agentsList.filter(a => a.zone === z).length;

      return {
        name: z.replace('Zone ', ''),
        clients: zoneClients.length,
        cards: zoneCards.length,
        collected: zoneAmtCollected,
        agents: zoneAgents || 1 // fallback safely
      };
    }).sort((a, b) => b.collected - a.collected); // Automatic zone leaderboard ranking!
  }, [clientsList, cards, validatedTransactions, agentsList]);

  const agentStatsPreCalculated = useMemo(() => {
    return agentsList.map(agent => {
      const agentCollected = validatedTransactions
        .filter(t => t.agentId === agent.id && t.type === 'depot')
        .reduce((sum, t) => sum + t.amount, 0);

      const agentClients = clientsList.filter(c => c.zone === agent.zone).length;
      
      const agentCards = cards.filter(card => {
        const owner = clientsList.find(c => c.id === card.clientId);
        return owner && owner.zone === agent.zone;
      }).length;

      const isInactive = agentCollected === 0;
      const statusLabel = isInactive ? 'Inactive' : 'Active';

      return {
        id: agent.id,
        name: agent.name,
        phone: agent.phone,
        zone: agent.zone,
        clientsCount: agentClients,
        cardsCount: agentCards,
        collected: agentCollected,
        status: agent.status,
        dateJoined: agent.createdAt.substring(0, 10),
        target: 250000, // Monthly corporate target
        achievedRate: Math.min(100, Math.round((agentCollected / 250000) * 100))
      };
    }).sort((a, b) => b.collected - a.collected);
  }, [agentsList, validatedTransactions, clientsList, cards]);

  // Control Center detection heuristics
  const anomaliesHeuristics = useMemo(() => {
    const alertsList: Array<{ id: string; type: string; level: 'critical' | 'alert' | 'warning'; message: string; sub: string; meta?: any }> = [];

    // 1. Idle agents without collection
    agentStatsPreCalculated.forEach(as => {
      if (as.collected === 0 && as.status === 'active') {
        alertsList.push({
          id: `anomaly-agent-${as.id}`,
          type: "Agent inactif",
          level: 'critical',
          message: `L'Agent ${as.name} n'a enregistré aucune transaction.`,
          sub: `Zone de couverture: ${as.zone}`,
          meta: as
        });
      }
    });

    // 2. Abandoned Cards (Active cards with no cells checked or static for weeks)
    cards.forEach(c => {
      if (c.filledCells.length === 0) {
        const client = clientsList.find(u => u.id === c.clientId);
        alertsList.push({
          id: `anomaly-card-${c.id}`,
          type: "Carte abandonnée",
          level: 'warning',
          message: `Carte #${c.cardNumber.slice(-6)} inactive sans aucun pointage enregistré.`,
          sub: `Client : ${client?.name || 'Inconnu'} • Secteur : ${client?.zone || 'Inconnu'}`,
          meta: c
        });
      }
    });

    // 3. Delayed repayments or low balance assistances
    assistances.forEach(a => {
      if (a.status === 'approved' && a.repaidAmount < (a.repaymentAmount * 0.1) && new Date(a.createdAt).getTime() < (Date.now() - 14 * 24 * 3600 * 1000)) {
        alertsList.push({
          id: `anomaly-as-${a.id}`,
          type: "Retard remboursement",
          level: 'alert',
          message: `Remboursement insuffisant pour l'Assistance de ${a.clientName}.`,
          sub: `Remboursé: ${a.repaidAmount.toLocaleString()} / ${a.repaymentAmount.toLocaleString()} FCFA`,
          meta: a
       });
      }
    });

    return alertsList;
  }, [agentStatsPreCalculated, cards, clientsList, assistances]);

  // Global query lookup with instant matching
  const searchSuggestions = useMemo(() => {
    if (globalSearchQuery.trim().length < 2) return [];
    const q = globalSearchQuery.toLowerCase();
    const suggestions: any[] = [];

    // Matching Agents
    agentsList.filter(a => a.name.toLowerCase().includes(q) || a.phone.includes(q)).forEach(agent => {
      suggestions.push({
        id: `sg-agent-${agent.id}`,
        title: agent.name,
        subtitle: `Agent Recouvreur • ${agent.zone} • ${agent.phone}`,
        icon: <UserCheck className="w-4 h-4 text-orange-500" />,
        action: () => openWindow('fiche-agent', `Dossier Agent - ${agent.name}`, agent, 560, 520)
      });
    });

    // Matching Clients
    clientsList.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.zone.toLowerCase().includes(q)).forEach(client => {
      suggestions.push({
        id: `sg-client-${client.id}`,
        title: client.name,
        subtitle: `Client Épargnant • Solde: ${client.balance.toLocaleString()} F • ${client.zone}`,
        icon: <Users className="w-4 h-4 text-emerald-500" />,
        action: () => openWindow('fiche-client', `Consulter Client : ${client.name}`, client, 540, 540)
      });
    });

    // Matching Cards
    cards.filter(c => c.cardNumber.toLowerCase().includes(q)).forEach(card => {
      const owner = clientsList.find(u => u.id === card.clientId);
      suggestions.push({
        id: `sg-card-${card.id}`,
        title: `Carte #${card.cardNumber.slice(-6)}`,
        subtitle: `Initialisé le ${card.createdAt.substring(0, 10)} • Titulaire: ${owner?.name || 'Inconnu'}`,
        icon: <CreditCard className="w-4 h-4 text-purple-500" />,
        action: () => openWindow('cartes', 'Grille de Supervision des Cartes', null, 700, 480)
      });
    });

    return suggestions;
  }, [globalSearchQuery, agentsList, clientsList, cards]);

  return (
    <div className="space-y-4 animate-fadeIn select-none pb-20 text-xs">
      
      {/* 1. PROFESSIONAL SUPERVISOR WATCH BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl text-white">
        
        {/* Profile identity */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-950/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider">{supervisor.name}</span>
              <span className="bg-indigo-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                SUPERVISEUR TERRAIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Espace de Contrôle & Analyse d'Établissement • Secteurs : <strong className="text-white">{supervisor.zone}</strong>
            </p>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Recherche Superviseur (Agent, Client, Carte, Téléphone...)"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchfocused(true)}
              onBlur={() => setTimeout(() => setIsSearchfocused(false), 250)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-550 transition-colors"
            />
            {globalSearchQuery && (
              <button 
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick matching search suggestions panel */}
          {isSearchfocused && searchSuggestions.length > 0 && (
            <div className="absolute top-11 left-0 w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-xs text-left max-h-80 overflow-y-auto space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block px-2 mb-1.5">
                Rapports de base correspondants ({searchSuggestions.length})
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
                  <div className="p-1.5 bg-slate-900 rounded-md">
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

        {/* Sync telemetry, alerts and system status */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-black font-mono block text-indigo-400">{systemTimeStr}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-550">
              CONTRÔLEUR GÉNÉRAL DE ZONE
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Alerts Counter Center Button */}
          <button
            onClick={() => openWindow('alerts', 'Centre de Détection des Anomalies Heuristiques', null, 560, 480)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer border border-slate-750 relative"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Alertes</span>
            {anomaliesHeuristics.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-550 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono font-black text-[9px] animate-bounce">
                {anomaliesHeuristics.length}
              </span>
            )}
          </button>
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
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">FINTECH MONITORING</span>
              <h2 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-tight mt-0.5">
                SUPERVISEUR
              </h2>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {[
                { label: 'Tableau de bord', icon: <Landmark className="w-4 h-4 text-indigo-505" />, action: () => openWindows.forEach(w => minimizeWindow(w.id)) },
                { label: 'Personnel & Agents', icon: <UserCheck className="w-4 h-4" />, action: () => openWindow('agents', 'Rapport de Supervision des Agents', null, 740, 520) },
                { label: 'Clients Épargnants', icon: <Users className="w-4 h-4" />, action: () => openWindow('clients', 'Fichier Centralisé des Adhérents', null, 700, 540) },
                { label: 'Cartes actives', icon: <CreditCard className="w-4 h-4" />, action: () => openWindow('cartes', 'Gestion des Fiches et Carnets', null, 710, 510) },
                { label: 'Zones', icon: <MapPin className="w-4 h-4" />, action: () => openWindow('zones', 'Classement et Statistiques des Zones', null, 660, 480) },
                { label: 'Performances', icon: <TrendingUp className="w-4 h-4" />, action: () => openWindow('performances', 'Performance de collecte des Agents', null, 720, 500) },
                { label: 'Assistances Mutuelles', icon: <HeartHandshake className="w-4 h-4" />, action: () => openWindow('assistances', 'Analyse Prêt & Financement Social', null, 700, 520) },
                { label: 'Rapports Financiers', icon: <Activity className="w-4 h-4" />, action: () => openWindow('reports', 'Analyse du Flux de Trésorerie', null, 780, 540) },
                { label: 'Fils d\'alertes', icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, action: () => openWindow('alerts', 'Centre de Détection des Anomalies Heuristiques', null, 560, 480) }
              ].map((m, i) => (
                <button
                  key={i}
                  onClick={m.action}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-indigo-50/20 dark:hover:bg-slate-800/50 transition-all cursor-pointer group text-left"
                >
                  <span className="flex items-center gap-2.5">
                    {m.icon}
                    {m.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-3px] group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick status card on sidebar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[10px] text-slate-400 space-y-2">
            <div className="p-3 bg-indigo-50/10 dark:bg-slate-950 rounded-2xl border border-indigo-200/20">
              <span className="block text-[8px] font-bold text-indigo-400 uppercase">Collecté ce mois</span>
              <span className="text-sm font-black font-mono text-indigo-950 dark:text-indigo-400">
                {collectedThisMonth.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA (Central stats dashboard in the background, overlaid draggable window panels) */}
        <main className="flex-grow p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
          
          <div className="space-y-6 select-text mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-850 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">DASHBOARD CENTRAL DE RECOUVREMENT</span>
                <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  TÉLÉMÉTRIE TERRITORIALE EN TEMPS RÉEL
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-205 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {supervisor.zone}
              </span>
            </div>

            {/* Principal KPI Grid cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Agents working card */}
              <div className="p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl border border-indigo-805/30 shadow-md flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <UserCheck className="w-6 h-6 text-indigo-455" />
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest font-mono">TERRAIN</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Agents Recouvreurs</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-white">
                    {agentsList.length} <span className="text-[11px] font-extrabold text-indigo-400">Actifs</span>
                  </span>
                </div>
              </div>

              {/* Collections today */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <Coins className="w-6 h-6 text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">AUJOURD'HUI</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Montant collecté</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-white">
                    {collectedToday.toLocaleString()} <span className="text-[11px] font-extrabold text-emerald-500">FCFA</span>
                  </span>
                </div>
              </div>

              {/* Collections month */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <TrendingUp className="w-6 h-6 text-indigo-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">MENSUEL</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Trésorerie encaissée</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-white">
                    {collectedThisMonth.toLocaleString()} <span className="text-[11px] font-extrabold text-indigo-500">FCFA</span>
                  </span>
                </div>
              </div>

              {/* Client registry */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col justify-between h-32 transform hover:scale-101 transition-all">
                <div className="flex justify-between items-start">
                  <Users className="w-6 h-6 text-orange-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">ÉPARGNANTS</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Portefeuille Adhérents</span>
                  <span className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-white">
                    {clientsList.length} <span className="text-[11px] font-extrabold text-orange-500">Comptes</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Quick KPI stats secondary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">CARTES ENCOURS</span>
                  <span className="font-extrabold font-mono text-xs text-slate-900 dark:text-white">
                    {activeCardsCount} Actives
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-pink-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">SOUTIEN SOCIAL</span>
                  <span className="font-extrabold font-mono text-xs text-slate-900 dark:text-white">
                    {pendingHelpCount} En attente
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">NOUVEAUX COMPTES</span>
                  <span className="font-extrabold font-mono text-xs text-slate-900 dark:text-white">
                    {newClientsTodayCount} Créés
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
                <BookmarkCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">OBJECTIFS ATTEINTS</span>
                  <span className="font-extrabold font-mono text-xs text-emerald-600">
                    94.2 % Global
                  </span>
                </div>
              </div>
            </div>

            {/* Backgound Interactive Charts Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Chart 1: Collective zone distribution */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-950 dark:text-white block">
                    Recettes d'Épargne cumulées par Zone de supervision
                  </span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase">Interactive</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zoneStatsPreCalculated}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} 
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {zoneStatsPreCalculated.map((entry, index) => {
                          const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Agent Leaderboard Preview */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-950 dark:text-white block">
                    Leaderboard d'activité des agents recouvreurs (Comm/Recettes)
                  </span>
                  <button 
                    onClick={() => openWindow('performances', 'Performance Globale des Agents', null, 720, 500)}
                    className="text-[9px] font-black text-indigo-500 hover:underline"
                  >
                    Voir tout
                  </button>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={agentStatsPreCalculated.slice(0, 4)}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="collected" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>

          {/* DRAGGABLE FLOATING EXPERIMENTAL WINDOW LAYER */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <AnimatePresence>
              {openWindows.map((win) => {
                if (win.isMinimized) return null;

                const isMax = win.isMaximized;
                const windowWidth = win.w || 650;
                const windowHeight = win.h || 500;

                return (
                  <motion.div
                    key={win.id}
                    initial={isMax ? { x: 0, y: 0, width: '100%', height: '105%', scale: 1 } : { x: win.x, y: win.y, width: windowWidth, height: windowHeight, scale: 0.95, opacity: 0 }}
                    animate={isMax ? { x: 0, y: 0, width: '105%', height: '105%', opacity: 1, scale: 1, transition: { duration: 0.12 } } : { x: win.x, y: win.y, width: windowWidth, height: windowHeight, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    style={{ zIndex: win.zIndex }}
                    className="absolute bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                  >
                    
                    {/* WINDOW HEADER */}
                    <div 
                      onMouseDown={(e) => handleHeaderMouseDown(e, win.id)}
                      className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between cursor-move selection:bg-none select-none rounded-t-3xl border-b border-slate-850"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider font-mono">
                          {win.title}
                        </span>
                      </div>

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

                    {/* WINDOW CONTENT WRAPPER */}
                    <div 
                      onClick={() => bringToFront(win.id)}
                      className="flex-grow p-6 overflow-y-auto text-slate-705 dark:text-slate-350 select-text bg-white dark:bg-slate-900 custom-scrollbar text-xs"
                    >
                      
                      {/* WINDOW TYPE: PERSONNEL / AGENTS LIST */}
                      {win.type === 'agents' && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                            <span className="font-extrabold text-slate-900 dark:text-white">Effectif d'agents sous responsabilité</span>
                            <div className="flex gap-1.5">
                              {['All', 'Zone A - Massina', 'Zone B - Ouenze', 'Zone C - Talangaï', 'Zone D - Poto-Poto'].map(z => (
                                <button
                                  key={z}
                                  onClick={() => setAgentFilter(z)}
                                  className={`px-2 py-1 rounded text-[9px] font-black uppercase ${agentFilter === z ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 border border-indigo-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                                >
                                  {z === 'All' ? 'Tous' : z.replace('Zone ', '')}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th className="py-2">Agent Recouvreur</th>
                                  <th className="py-2">Secteur</th>
                                  <th className="py-2 text-right">Épargnants</th>
                                  <th className="py-2 text-right">Collecté local</th>
                                  <th className="py-2 text-right">Couverture Objectif</th>
                                  <th className="py-2 text-right">Opération</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[11px] font-bold">
                                {agentStatsPreCalculated
                                  .filter(as => agentFilter === 'All' || as.zone === agentFilter)
                                  .map(as => (
                                    <tr 
                                      key={as.id}
                                      onDoubleClick={() => openWindow('fiche-agent', `Dossier Agent - ${as.name}`, as, 560, 520)}
                                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 cursor-pointer"
                                      title="Double-cliquez pour ouvrir la fiche exhaustive"
                                    >
                                      <td className="py-2.5 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center font-black">
                                          {as.name.charAt(0)}
                                        </div>
                                        <div>
                                          <span className="font-extrabold text-slate-905 dark:text-white block">{as.name}</span>
                                          <span className="text-[9px] text-slate-450 font-medium block">{as.phone}</span>
                                        </div>
                                      </td>
                                      <td className="py-2.5 font-medium text-slate-500">{as.zone}</td>
                                      <td className="py-2.5 text-right font-mono">{as.clientsCount} accounts</td>
                                      <td className="py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                                        {as.collected.toLocaleString()} F
                                      </td>
                                      <td className="py-2.5 text-right font-mono">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <span className="text-[10px] text-slate-500">{as.achievedRate}%</span>
                                          <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-indigo-500 h-full" style={{ width: `${as.achievedRate}%` }} />
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-2.5 text-right">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            addToast(`✓ Consigne de supervision transmise avec succès à ${as.name}.`, "success");
                                          }}
                                          className="p-1 text-indigo-505 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 rounded font-black text-[9px] uppercase cursor-pointer"
                                        >
                                          Instruire
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: FICHE AGENT DETAIL (Double click) */}
                      {win.type === 'fiche-agent' && win.data && (
                        <div className="space-y-5">
                          <div className="p-4 bg-slate-950 text-white rounded-2xl flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-500 text-slate-950 font-black rounded-xl text-xl flex items-center justify-center border-2 border-white/20 shadow-md">
                              {win.data.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black uppercase tracking-tight">{win.data.name}</h4>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${win.data.status === 'active' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                                  {win.data.status === 'active' ? 'EN POSTE' : 'SUSPENDU'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Date d'entrée: <strong className="text-white">{win.data.dateJoined || '2024-03-12'}</strong> • No ID: <strong className="text-white">{win.data.id.slice(-6)}</strong>
                              </p>
                              <p className="text-[10px] text-slate-400 block">Téléphone : {win.data.phone}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                              <span className="text-[8px] text-slate-400 font-bold uppercase block">Affectation zone</span>
                              <span className="font-extrabold text-[11px] text-slate-900 dark:text-white block">
                                {win.data.zone}
                              </span>
                            </div>
                            
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                              <span className="text-[8px] text-slate-400 font-bold uppercase block">Commission cumulée</span>
                              <span className="font-extrabold text-[11px] text-slate-900 dark:text-white block font-mono">
                                {(win.data.collected * 0.05).toLocaleString()} FCFA
                              </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                              <span className="text-[8px] text-slate-400 font-bold uppercase block">Recettes de Caisse</span>
                              <span className="font-extrabold text-[11px] text-slate-900 dark:text-white block font-mono">
                                {win.data.collected.toLocaleString()} FCFA
                              </span>
                            </div>
                          </div>

                          {/* Historical pointage check list */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-550 block">
                              Derniers Pointages consolidés sur le secteur
                            </span>
                            <div className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                              {validatedTransactions
                                .filter(t => t.agentId === win.data.id && t.type === 'depot')
                                .slice(0, 6)
                                .map((t, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[10px] border-b border-slate-50 dark:border-slate-800 pb-1 text-slate-600 dark:text-slate-400">
                                    <span className="font-bold">{t.clientName}</span>
                                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                                      +{t.amount.toLocaleString()} FCFA
                                    </span>
                                    <span className="text-[9px] text-slate-400">{t.createdAt.substring(11, 16)}</span>
                                  </div>
                                ))}
                              {validatedTransactions.filter(t => t.agentId === win.data.id && t.type === 'depot').length === 0 && (
                                <p className="text-center py-4 text-slate-400 font-bold">Aucune transaction recensée pour cet agent.</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
                            <button
                              onClick={() => {
                                openWindow('clients', "Portefeuille d'adhérents de l'Agent", null, 660, 480);
                                addToast(`Filtrage automatique du portefeuille de ${win.data.name}`, "info");
                              }}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                            >
                              Voir ses clients
                            </button>
                            <button
                              onClick={() => {
                                addToast(`Une instruction d'audit d'espaces a été diligentée pour l'Agent ${win.data.name}`, "warning");
                              }}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                            >
                              Lancer Audit Terrain
                            </button>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: CLIENTS CONSULTATION */}
                      {win.type === 'clients' && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                            <span className="font-extrabold text-slate-900 dark:text-white">Annuaire des Adhérents Épargnants</span>
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Filtrer par nom/carte/zone..."
                                value={clientSearchQuery}
                                onChange={(e) => setClientSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th className="py-2">Client Épargnant</th>
                                  <th className="py-2">No Téléphone</th>
                                  <th className="py-2">Zone administrative</th>
                                  <th className="py-2 text-right">Solde Capitalisé</th>
                                  <th className="py-2 text-right">Fiches actives</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[11px] font-bold">
                                {clientsList
                                  .filter(c => {
                                    const matchVal = c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) || 
                                                     c.phone.includes(clientSearchQuery) || 
                                                     c.zone.toLowerCase().includes(clientSearchQuery.toLowerCase());
                                    return matchVal;
                                  })
                                  .map(c => {
                                    const cCards = cards.filter(card => card.clientId === c.id);
                                    return (
                                      <tr 
                                        key={c.id}
                                        onDoubleClick={() => openWindow('fiche-client', `Consulter Client : ${c.name}`, c, 545, 545)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/20 cursor-pointer"
                                        title="Double-cliquez pour inspecter la fiche d'épargne"
                                      >
                                        <td className="py-2.5">
                                          <span className="font-black text-slate-905 dark:text-white block">{c.name}</span>
                                          <span className="text-[9px] text-slate-400 font-normal">{c.email}</span>
                                        </td>
                                        <td className="py-2.5 font-mono text-slate-500">{c.phone}</td>
                                        <td className="py-2.5 font-bold text-slate-450">{c.zone}</td>
                                        <td className="py-2.5 text-right font-mono font-black text-indigo-650 dark:text-indigo-400">
                                          {c.balance.toLocaleString()} FCFA
                                        </td>
                                        <td className="py-2.5 text-right font-mono font-bold text-slate-500">
                                          {cCards.length} fiches
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: FICHE CLIENT COMPLÈTE (Double click) */}
                      {win.type === 'fiche-client' && win.data && (
                        <div className="space-y-5">
                          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-4 border border-slate-800">
                            <div className="w-12 h-12 bg-emerald-500 text-slate-950 font-black rounded-lg text-lg flex items-center justify-center">
                              {win.data.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm uppercase">{win.data.name}</h4>
                              <p className="text-[10px] text-slate-400">
                                No Compte fiscal : <strong className="text-white">{win.data.id}</strong>
                              </p>
                              <p className="text-[10px] text-slate-405">Zone affectée : {win.data.zone}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl space-y-1">
                              <span className="text-[8px] text-slate-400 font-bold uppercase block">Solde Caisse Actuel</span>
                              <span className="text-lg font-black font-mono text-slate-950 dark:text-white">
                                {win.data.balance.toLocaleString()} FCFA
                              </span>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl space-y-1">
                              <span className="text-[8px] text-slate-400 font-bold uppercase block">Téléphone contact</span>
                              <span className="text-lg font-black font-mono text-slate-905 dark:text-white">
                                {win.data.phone}
                              </span>
                            </div>
                          </div>

                          {/* Cards registry linked */}
                          <div className="space-y-2">
                            <span className="font-black text-[10px] uppercase tracking-wider text-slate-500 block">
                              Fiches d'épargne rattachées au dossier
                            </span>
                            <div className="space-y-2">
                              {cards
                                .filter(card => card.clientId === win.data.id)
                                .map((card, index) => (
                                  <div key={card.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center text-[10px]">
                                    <div>
                                      <span className="font-black text-slate-900 dark:text-white block">
                                        Fiche #{card.cardNumber}
                                      </span>
                                      <span className="text-slate-400">Taux journalier: {card.amount} F</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-mono font-extrabold text-slate-950 dark:text-white block">
                                        {card.filledCells.length} / 31 cases
                                      </span>
                                      <span className={`text-[8px] font-black uppercase ${card.isCompleted ? 'text-emerald-500' : 'text-indigo-400'}`}>
                                        {card.isCompleted ? 'Complétée' : 'Active'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: CARTES MANAGEMENT */}
                      {win.type === 'cartes' && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                            <span className="font-extrabold text-slate-900 dark:text-white">Supervision des Fiches d'Épargne Terrain</span>
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Numéro carte ou client..."
                                value={cardSearchQuery}
                                onChange={(e) => setCardSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th className="py-2">No Carte Épargne</th>
                                  <th className="py-2">Propriétaire</th>
                                  <th className="py-2">Initialisé le</th>
                                  <th className="py-2 text-right">Taux unitaire</th>
                                  <th className="py-2 text-right">Renseignement cases</th>
                                  <th className="py-2 text-right">Statut Fiche</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[11px] font-bold">
                                {cards
                                  .filter(c => {
                                    const matchQ = c.cardNumber.toLowerCase().includes(cardSearchQuery.toLowerCase()) || c.id.toLowerCase().includes(cardSearchQuery.toLowerCase());
                                    return matchQ;
                                  })
                                  .map(c => {
                                    const owner = clientsList.find(u => u.id === c.clientId);
                                    return (
                                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-805">
                                        <td className="py-2.5 font-mono text-indigo-650 dark:text-indigo-400">
                                          #{c.cardNumber}
                                        </td>
                                        <td className="py-2.5 font-black text-slate-900 dark:text-white">
                                          {owner?.name || 'Inconnu'}
                                        </td>
                                        <td className="py-2.5 text-slate-450">{c.createdAt.substring(0, 10)}</td>
                                        <td className="py-2.5 text-right font-mono">{c.amount.toLocaleString()} F</td>
                                        <td className="py-2.5 text-right font-mono">
                                          {c.filledCells.length} / 31
                                        </td>
                                        <td className="py-2.5 text-right">
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                            c.isCompleted ? 'bg-emerald-50 text-emerald-800' : 'bg-indigo-50 text-indigo-800'
                                          }`}>
                                            {c.isCompleted ? 'REMPLIE' : 'EN COURS'}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: ZONES CLASSEMENT */}
                      {win.type === 'zones' && (
                        <div className="space-y-4">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            Classement automatique d'activité par Zone
                          </span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {zoneStatsPreCalculated.map((z, idx) => (
                              <div key={z.name} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-2 border border-slate-150/40 dark:border-slate-800">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-indigo-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <span className="font-black text-slate-950 dark:text-white uppercase">
                                      {z.name}
                                    </span>
                                  </div>
                                  <span className="font-mono font-black text-indigo-655 dark:text-indigo-400">
                                    {z.collected.toLocaleString()} FCFA
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] border-t border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                                  <div>
                                    <span className="block text-[8px] text-slate-550">Adhérents</span>
                                    <span className="text-slate-800 dark:text-slate-200">{z.clients}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-550">Cartes</span>
                                    <span className="text-slate-800 dark:text-slate-200">{z.cards}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-550">Part d'agents</span>
                                    <span className="text-slate-800 dark:text-slate-200">{z.agents}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: PERFORMANCES IN-DEPTH */}
                      {win.type === 'performances' && (
                        <div className="space-y-5">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            Suivi individuel et objectifs mensuels agents (Objectif corporate : 250k)
                          </span>

                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={agentStatsPreCalculated}>
                                <XAxis dataKey="name" fontSize={9} />
                                <YAxis fontSize={9} />
                                <Tooltip />
                                <Bar dataKey="collected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Détails d'efficience opérationnelle</span>
                            <div className="space-y-2">
                              {agentStatsPreCalculated.map(as => (
                                <div key={as.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center text-[10px]">
                                  <div>
                                    <span className="font-black text-slate-905 dark:text-white block">{as.name}</span>
                                    <span className="text-slate-400 block font-normal">Secteur: {as.zone}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono font-black text-slate-900 dark:text-white block">
                                      {as.collected.toLocaleString()} FCFA
                                    </span>
                                    <span className={`text-[8px] font-black uppercase ${as.collected >= 250000 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                      {as.collected >= 250000 ? 'OBJECTIF REMPLI' : 'EN COURS'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: ASSISTANCES MUTUELLES REVIEW */}
                      {win.type === 'assistances' && (
                        <div className="space-y-4">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            Dossiers de Financement Associatifs en Instruction
                          </span>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 font-extrabold uppercase text-[9px]">
                                  <th className="py-2">Adhérent Demandeur</th>
                                  <th className="py-2">Domaine d'Investissement</th>
                                  <th className="py-2 text-right">Montant Demandé</th>
                                  <th className="py-2 text-right">Intérêt (Taux)</th>
                                  <th className="py-2 text-right">Amortissement dû</th>
                                  <th className="py-2 text-right">Audit Statut</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-805 text-[11px] font-bold">
                                {assistances.map(a => (
                                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-805">
                                    <td className="py-2.5 font-black text-slate-900 dark:text-white">
                                      {a.clientName}
                                    </td>
                                    <td className="py-2.5 text-indigo-505 dark:text-indigo-400">{a.domain}</td>
                                    <td className="py-2.5 text-right font-mono">{a.amount.toLocaleString()} F</td>
                                    <td className="py-2.5 text-right font-mono text-slate-450">{a.interestRate}%</td>
                                    <td className="py-2.5 text-right font-mono font-black">
                                      {a.repaymentAmount.toLocaleString()} FCFA
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                        a.status === 'approved' ? 'bg-emerald-50 text-emerald-800' :
                                        a.status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                                      }`}>
                                        {a.status === 'approved' ? 'ACCORDÉ' : a.status === 'pending' ? 'EN ATTENTE' : 'REJETÉ'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: DETAILED REPORTS */}
                      {win.type === 'reports' && (
                        <div className="space-y-4 text-xs">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            Analyse de Trésorerie mensuelle et projection d'épargne
                          </span>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-150/40">
                              <span className="text-[10px] block text-slate-400 uppercase font-bold">Frais d'Adhésion cumulés</span>
                              <span className="text-base font-black font-mono text-slate-950 dark:text-white">
                                {(clientsList.length * 500).toLocaleString()} FCFA
                              </span>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-150/40">
                              <span className="text-[10px] block text-slate-400 uppercase font-bold">Versements consolidés</span>
                              <span className="text-base font-black font-mono text-slate-950 dark:text-white">
                                {collectedThisMonth.toLocaleString()} FCFA
                              </span>
                            </div>
                          </div>

                          <div className="p-4 bg-indigo-950 text-white rounded-2xl">
                            <h5 className="font-black text-[13px] block">Avis d'analyse de zone</h5>
                            <p className="text-[10px] text-slate-350 leading-relaxed mt-1">
                              ✓ La Zone Massina domine d'activité à hauteur de 44% du capital global de l'établissement. Il est conseillé de dupliquer les stratégies d'incitation à l'Ouenze pour stimuler le taux de pointage hebdomadaire.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* WINDOW TYPE: ALERTS (Control Center) */}
                      {win.type === 'alerts' && (
                        <div className="space-y-4">
                          <span className="font-black block text-rose-500 uppercase flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            Anomalies et alertes de non-conformité détectées
                          </span>

                          <div className="space-y-2">
                            {anomaliesHeuristics.map(al => (
                              <div key={al.id} className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-200/40 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase text-red-700 bg-red-100 rounded px-1.5 py-0.2">
                                      {al.type}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{al.sub}</span>
                                  </div>
                                  <p className="font-bold text-slate-900 dark:text-white text-[11px]">{al.message}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    addToast("Instruction d'audit notifiée !", "warning");
                                    closeWindow('alerts');
                                  }}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-[9px] font-black uppercase cursor-pointer"
                                >
                                  Auditer
                                </button>
                              </div>
                            ))}
                            {anomaliesHeuristics.length === 0 && (
                              <p className="text-center py-6 text-slate-400 font-bold">✓ Aucune anomalie opérationnelle en cours de supervision.</p>
                            )}
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

      {/* 3. FLOAT TOAST NOTIFICATION STREAM IN COOPERATIVE LAYOUT */}
      <div className="fixed bottom-14 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={`p-3.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md text-white pointer-events-auto border ${
                t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500' :
                t.type === 'warning' ? 'bg-rose-950/90 border-rose-500' :
                'bg-slate-950/90 border-indigo-500'
              }`}
            >
              {t.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Info className="w-5 h-5 text-indigo-400" />}
              <span className="font-extrabold text-[11px] font-sans">{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
